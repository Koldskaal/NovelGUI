import React, { createContext, useContext, useEffect, useState } from "react";
import { Message, PythonTask, taskManager } from "./PythonCommands";

type Novel = {
  info: string;
  title: string;
  url: string;
};

type NovelResult = {
  id: string;
  novels: Novel[];
  title: string;
};
type CachedNovelInfo = {
  [title: string]: { [url: string]: NovelInfo };
};

type NovelInfo = {
  title: string;
  author: string;
  cover: string;
  volumes: number;
  chapters: number;
};

type callback = () => void;

const NovelDataContext = createContext({ cache: {}, searchResults: [], subscribeToUpdates:(callback:callback) => {return;},});

const NovelDataContextProvider = (props: { children?: JSX.Element }) => {
  const [searchResults, setSearchResults] = useState([] as NovelResult[]);
  const [cache, setCache] = useState({} as CachedNovelInfo);
  const [callbacks, setCallbacks] = useState([] as callback[]);

  const [isDirty, setIsDirty] = useState(false);
  const [started, setStarted] = useState(false);

  

  useEffect(() => {
    const notifyUpdate = () => {
      callbacks.forEach((callback) => {
        callback();
      })
    }

    if (isDirty) {
      notifyUpdate();
      setIsDirty(false);
    }
  },[callbacks, isDirty])

  useEffect(() => {
    const onNewTask = (task: PythonTask) => {
      if (task.getCommand() === "search") {
        setSearchResults([] as NovelResult[]);
      }

      task.subscribeToMessage((message: Message) => {
        if (message.status !== "OK") {
          console.log(message);
          return;
        }
        // sort through tasks
        if (message.task.name === "search") {
          if (typeof message.data !== "undefined") {
            setSearchResults(message.data.novels);
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

          setCache((oldCache) => {

            if (!oldCache[title]){
              oldCache[title] = {};
              
            }
            oldCache[title][url] = info;
            return oldCache;
          }
          );
          setIsDirty(true);
        }
      });
    };

    if (!started) {
      taskManager.subscribeToAnyTaskStart(onNewTask);
      setStarted(true);
    }
  }, [cache, started]);

  const addToList = (callback: callback) => {
    setCallbacks((oldList) => [...oldList, callback]);
  } 

  return (
    <NovelDataContext.Provider
      value={{ cache: cache, searchResults: searchResults, subscribeToUpdates:addToList }}
    >
      {props.children}
    </NovelDataContext.Provider>
  );
};

const useNovelDataContext = () => {
  const context = useContext(NovelDataContext);
  if (context === undefined) {
    throw new Error("Context must be used within a Provider");
  }

  return context.cache as CachedNovelInfo;
};

const useSubscribeToUpdates = () => {
  const context = useContext(NovelDataContext);
  if (context === undefined) {
    throw new Error("Context must be used within a Provider");
  }

  return context.subscribeToUpdates;
};

const useSearchDataContext = () => {
  const context = useContext(NovelDataContext);
  if (context === undefined) {
    throw new Error("Context must be used within a Provider");
  }

  return context.searchResults as NovelResult[];
};

const usePersistedState = (key:string, defaultValue: any) => {
  const [state, setState] = useState(() => {
    const persistedState = localStorage.getItem(key);
    return persistedState ? JSON.parse(persistedState) : defaultValue;
  });
  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(state));
  }, [state, key]);
  return [state, setState];
}

const useSessionState = (key:string, defaultValue: any) => {
  const [state, setState] = useState(() => {
    const persistedState = sessionStorage.getItem(key);
    return persistedState ? JSON.parse(persistedState) : defaultValue;
  });
  useEffect(() => {
    window.sessionStorage.setItem(key, JSON.stringify(state));
  }, [state, key]);
  return [state, setState];
}

const getFromStorage = (key: string) => {
  return JSON.parse(localStorage.getItem(key));
}

export {
  useNovelDataContext,
  useSearchDataContext,
  useSubscribeToUpdates,
  NovelDataContextProvider,
  NovelResult,
  Novel,
  NovelInfo,
  usePersistedState,
  getFromStorage
};
