import React, { useCallback, useEffect, useState } from "react";
import { ViewManager } from "../modules/ViewManager";
import { Novel, NovelInfo, NovelTracking } from "./dataTypes";
import { RangeOption } from "./OptionComponents";
import { Message, PythonTask, taskManager, TaskStatus } from "./PythonCommands";

const NovelDataContextProvider = () => {
  const [trackState, setTrackState] = usePersistedState("track", {});

  const [searchState, setSearchState] = useSessionState("search", []);
  const [cacheState, setCacheState] = useSessionState("cache", {});

  useEffect(() => {
    const onNewTask = (task: PythonTask) => {
      task.subscribeToMessage((message: Message) => {
        if (message.status !== "OK") {
          console.log(message);
          return;
        }
        // sort through tasks
        if (message.task.name === "search") {
          if (typeof message.data !== "undefined") {
            // new version
            setSearchState(message.data.novels);
          }
        } else if (message.task.name === "get_novel_info") {
          if (typeof message.data === "undefined") {
            return;
          }
          const title: string = message.data.title.toString().toLowerCase();
          const url: string = new URL(message.data.url).hostname;

          const info = {
            title: message.data.title,
            author: message.data.author,
            cover: message.data.cover,
            volumes: message.data.volumes,
            chapters: message.data.chapters,
          } as NovelInfo;

          if (!cacheState[title]) {
            cacheState[title] = {};
          }
          cacheState[title][url] = info;

          setCacheState(cacheState);
        }
      });
    };

    taskManager.subscribeToAnyTaskStart(onNewTask);

    return function cleanup() {
      taskManager.unsubscribeToAnyTaskStart(onNewTask);
    };
  }, [cacheState, setCacheState, setSearchState]);

  useEffect(() => {
    const recordDownload = (task: PythonTask) => {
      if (task.getFullCommand().command !== "download_novel") return;

      task.subscribeToEnd(() => {
        if (task.status !== TaskStatus.SUCCESS) return;

        const command = task.getFullCommand();
        console.log(command.data.options);
        const rangeOption: RangeOption = command.data.options.rangeOption;
        const hostname = new URL(command.data.url).hostname;
        let latest = 0;

        // translate rangeOptions to latest chapter!
        if (rangeOption.radio === "1") {
          latest = cacheState[command.data.title][hostname].chapters;
        } else if (rangeOption.radio === "2") {
          const chapters = rangeOption.input.match(/\d+/g).map(Number);
          latest = Math.max(...chapters);
        } else if (rangeOption.radio === "3") {
          const volumes = rangeOption.input.match(/\d+/g).map(Number);
          const biggestChapterNr = Math.max(...volumes) * 100;

          const max = cacheState[command.data.title][hostname].chapters;

          if (biggestChapterNr <= max) {
            latest = biggestChapterNr;
          } else {
            latest = max;
          }
        }

        // if latest is bigger than previous latest -> save
        const trackedData = trackState;
        const name = command.data.title + "-" + hostname;

        if (!trackedData[name]) {
          const data = {} as NovelTracking;
          data.novel = {title: command.data.title, url:command.data.url} as Novel
          data.isFavorite = false;
          data.latestDownload = 0;
          trackedData[name] = data;
        }

        if (trackedData[name].latestDownload < latest) {
          trackedData[name].latestDownload = latest;
        }

        setTrackState(trackedData);
      });
    };

    taskManager.subscribeToAnyTaskStart(recordDownload);

    return function cleanup() {
      taskManager.unsubscribeToAnyTaskStart(recordDownload);
    };
  }, [cacheState, setTrackState, trackState]);

  return <div></div>;
};

const usePersistedState = (key: string, defaultValue: any) => {
  const [state, setState] = useState(() => {
    const persistedState = localStorage.getItem(key);
    return persistedState ? JSON.parse(persistedState) : defaultValue;
  });

  const update = useCallback((newState: any) => {
    setState(newState);
    console.log(newState);
    localStorage.setItem(key, JSON.stringify(newState));
    ViewManager.broadcast("storage-" + key, {});
    ViewManager.broadcast("storage", {
      key: key,
    });
  },[key]);

  useEffect(() => {
    const event = () => {
      setState(() => {
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : defaultValue;
      });
    };

    ViewManager.subscribe("storage-" + key, event);
    return function cleanup() {
      ViewManager.unsubscribe("storage-" + key, event);
    };
  }, [defaultValue, key]);

  return [state, update];
};

const useSessionState = (key: string, defaultValue: any) => {
  const [state, setState] = useState(() => {
    const sessionState = sessionStorage.getItem(key) ;
    return sessionState ? JSON.parse(sessionState) as typeof defaultValue : defaultValue;
  });

  const update = useCallback((newState: any) => {
    setState(newState);
    sessionStorage.setItem(key, JSON.stringify(newState));
    ViewManager.broadcast("session-" + key, {});
    ViewManager.broadcast("storage", {
      key: key,
    });
  },[key])

  useEffect(() => {
    const event = () => {
      setState(() => {
        const val = sessionStorage.getItem(key);
        return val ? JSON.parse(val) : defaultValue;
      });
    };

    ViewManager.subscribe("session-" + key, event);
    return function cleanup() {
      ViewManager.unsubscribe("session-" + key, event);
    };
  }, [defaultValue, key]);

  return [state, update];
};

const getFromStorage = (key: string, defaultValue: any = {}) => {
  const state = localStorage.getItem(key);
  return state ? JSON.parse(state) : defaultValue;
};

function getFromSession(key: string, defaultValue: any = {}) {
  const sessionState = sessionStorage.getItem(key);
  return sessionState ? JSON.parse(sessionState) : defaultValue;
}

export {
  NovelDataContextProvider,
  usePersistedState,
  getFromStorage,
  useSessionState,
  getFromSession,
};
