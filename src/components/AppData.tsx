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
const NovelDataContext = createContext({ cache: {}, searchResults: [] });

const NovelDataContextProvider = (props: { children?: JSX.Element }) => {
  const [searchResults, setSearchResults] = useState([] as NovelResult[]);
  const [cache, setCache] = useState({} as CachedNovelInfo);

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
            console.log(message.task.details);
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
        }
      });
    };

    taskManager.subscribeToAnyTaskStart(onNewTask);
  }, [cache]);

  return (
    <NovelDataContext.Provider
      value={{ cache: cache, searchResults: searchResults }}
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

const useSearchDataContext = () => {
  const context = useContext(NovelDataContext);
  if (context === undefined) {
    throw new Error("Context must be used within a Provider");
  }

  return context.searchResults as NovelResult[];
};

export {
  useNovelDataContext,
  useSearchDataContext,
  NovelDataContextProvider,
  NovelResult,
  Novel,
  NovelInfo,
};
