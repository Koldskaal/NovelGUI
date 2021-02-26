import { useCallback, useEffect, useReducer, useState } from "react";
import { usePersistedState } from "./AppData";
import { Novel, NovelInfo, NovelTracking } from "./dataTypes";

type State = NovelTracking;

type Action =
  | { type: "replace"; data: NovelTracking }
  | { type: "setNovel"; novel: Novel }
  | { type: "setFavorite"; favorite: boolean }
  | { type: "setNovelInfo"; novelInfo: NovelInfo }
  | { type: "setLatestDownload"; latestDownload: number };

function novelTrackingReducer(state: State, action: Action) {
  switch (action.type) {
    case "replace": {
      return action.data;
    }
    case "setNovel": {
      return {
        ...state,
        novel: action.novel,
      };
    }
    case "setFavorite": {
      return {
        ...state,
        isFavorite: action.favorite,
      };
    }
    case "setNovelInfo": {
      return {
        ...state,
        novelInfo: action.novelInfo,
      };
    }
    case "setLatestDownload": {
      return {
        ...state,
        latestDownload: action.latestDownload,
      };
    }
    default: {
      return {
        ...state,
      };
    }
  }
}

function useTrackObject(novel: Novel): [NovelTracking, any] {
  const [track, setTrack] = usePersistedState("track", {});
  const [state, dispatch] = useReducer(novelTrackingReducer, novel, () => {
    const name = novel.title.toLowerCase() + "-" + new URL(novel.url).hostname;
    const data = track[name] ? track[name] : {};
    data.novel = novel;
    return data;
  });

  const [isDirty, setDirty] = useState(false);

  const name = novel
    ? novel.title.toLowerCase() + "-" + new URL(novel.url).hostname
    : "";

  const setFav = useCallback((isFav: boolean) => {
    dispatch({ type: "setFavorite", favorite: isFav });
    setDirty(true);
  }, []);

  const setNovel = useCallback((novel: Novel) => {
    dispatch({ type: "setNovel", novel: novel });
    setDirty(true);
  }, []);

  const setLatestDownload = useCallback((latestDownload: number) => {
    dispatch({ type: "setLatestDownload", latestDownload: latestDownload });
    setDirty(true);
  }, []);

  const setNovelInfo = useCallback((novelInfo: NovelInfo) => {
    console.log(novelInfo);
    dispatch({ type: "setNovelInfo", novelInfo: novelInfo });
    setDirty(true);
  }, []);

  useEffect(() => {
    if (isDirty) {
      track[name] = state;
      setTrack(track);
      setDirty(false);
    }
  }, [isDirty, name, setTrack, state, track]);

  useEffect(() => {
    if (track[name]) {
      dispatch({ type: "replace", data: track[name] });
    }
  }, [name, track]);

  return [state, { setFav, setLatestDownload, setNovelInfo }];
}

export { useTrackObject };
