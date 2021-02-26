import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  VStack,
  Box,
} from "@chakra-ui/react";
import React, { Fragment, useEffect, useState } from "react";
import { ResultBox } from ".";
import { usePersistedState, useSessionState } from "./AppData";
import { Novel, NovelTracking } from "./dataTypes";
import { ViewManager } from "./modules/ViewManager";
import { getInfoPython } from "./PythonCommands";
import { NovelInfoGrid } from "./ResultBox/NovelInfoGrid";
import { SearchField } from "./SeachField";
import { useTrackObject } from "./tracking";

export const FrontPage = () => {
  return (
    <Tabs isFitted>
      <TabList>
        <Tab>Get novels</Tab>
        <Tab>Favorites</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <VStack
            paddingLeft="20px"
            paddingRight="20px"
            justifyContent="center"
            minH="50%"
          >
            <SearchField
              onSearchStart={() => ViewManager.broadcast("search", {})}
            />
            <ResultBox />
          </VStack>
        </TabPanel>
        <TabPanel>
          <Favorites />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

const Favorites = () => {
  const [track, setTrack] = usePersistedState("track", {});
  const [favorites, setFavs] = useState([] as Novel[]);
  // 1. get the saved favorites
  // 2. show them
  // 3. click to download
  useEffect(() => {
    const GenerateFavs = () => {
      const rowArray = [] as Novel[];
      for (const [key, value] of Object.entries(track)) {
        const track = value as NovelTracking;
        if (track.isFavorite) rowArray.push(track.novel);
      }

      setFavs(rowArray);
    };

    GenerateFavs();
  }, [track]);

  const rows = favorites.map((novel: Novel, index: number) => (
    <FavoriteRow key={index} novel={novel} />
  ));

  return <Fragment>{rows}</Fragment>;
};

const FavoriteRow = (props: { novel: Novel }) => {
  const [state, { setNovelInfo }] = useTrackObject(props.novel);
  const hostname = new URL(props.novel.url).hostname;
  const title = props.novel.title.toLowerCase();
  const [cache] = useSessionState("cache", {});
  const [lookingForChanges, setLooking] = useState(false);

  useEffect(() => {
    if (!state.novelInfo) {
      const task = getInfoPython(props.novel.url);
      setLooking(true);
    }
  }, [props.novel.url, state.novelInfo]);

  useEffect(() => {
    if (cache[title] && cache[title][hostname] && lookingForChanges) {
      setNovelInfo(cache[title][hostname]);
      setLooking(false);
    }
  },[cache, hostname, lookingForChanges, setNovelInfo, title])
  return (
    <Box>
      <NovelInfoGrid novel={props.novel}/>
    </Box>
  );
};
