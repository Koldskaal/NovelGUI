import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  VStack,
  Box,
  Grid,
  GridItem,
  Image,
  Text,
  Button,
  Center,
} from "@chakra-ui/react";
import React, { Fragment, useEffect, useState } from "react";
import { ResultBox } from ".";
import { usePersistedState, useSessionState } from "./AppData";
import { Novel, NovelInfo, NovelTracking } from "./dataTypes";
import { ViewManager } from "../modules/ViewManager";
import { getInfoPython } from "./PythonCommands";
import { RefreshButton } from "./ResultBox/NovelIconBar";
import { NovelInfoGrid } from "./ResultBox/NovelInfoGrid";
import { NovelModal } from "./ResultBox/NovelModal";
import { getMetaPaths, MetaFile, readMetaFiles } from "../modules/scanFolders";
import { SearchField } from "./SeachField";
import { useTrackObject } from "./tracking";


import TestWorker from "../modules/worker/scanFolder.worker"

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

          <Box marginBottom="25px"></Box>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};
const workwork = new TestWorker();
const Favorites = () => {
  const [track, setTrack] = usePersistedState("track", {});
  const [settings] = usePersistedState("defaultOptions", {});
  const [favorites, setFavs] = useState([] as Novel[]);
  const [novels, setNovels] = useState([] as MetaFile[]);
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

  useEffect(() => {
    
    workwork.postMessage({path:settings.outputPath});
    workwork.onmessage = function(e:any) {
      const metaFiles = readMetaFiles(e.data);
      setNovels(metaFiles);
    }
  }, [settings.outputPath]);

  const rows = favorites.map((novel: Novel, index: number) => (
    <Center key={index} marginTop="5px" pos="relative">
      <FavoriteRow novel={novel} />
    </Center>
  ));

  const rowsMeta = novels.map((metaFile: MetaFile, index: number) => (
    <Center key={index} marginTop="5px" pos="relative">
      <FavoriteRowMeta metaFile={metaFile} />
    </Center>
  ));

  return <Fragment>{rowsMeta}</Fragment>;
};

const FavoriteRowMeta = (props: { metaFile: MetaFile }) => {
  const hostname = new URL(props.metaFile.url).hostname;
  const title = props.metaFile.title.toLowerCase();
  const [cache] = useSessionState("cache", {});
  const [lookingForChanges, setLooking] = useState(false);
  const [novel, setNovel] = useState({} as Novel);
  const [novelInfo, setNovelInfo] = useState({} as NovelInfo);

  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    setNovel({
      title: props.metaFile.title,
      url: props.metaFile.url,
    } as Novel);
    setNovelInfo({
      title: props.metaFile.title,
      author: props.metaFile.author,
      cover: props.metaFile.cover,
      volumes: props.metaFile.volumes.length,
      chapters: props.metaFile.chapters.length,
    } as NovelInfo);
  }, [props.metaFile]);

  useEffect(() => {
    if (cache[title] && cache[title][hostname] && lookingForChanges) {
      setNovelInfo(cache[title][hostname]);
      setLooking(false);
    }
  }, [cache, hostname, lookingForChanges, title]);

  return (
    <Grid templateColumns="repeat(2, minmax(100px, 1fr))" gap={2} maxW="401px">
      <GridItem rowSpan={2} colSpan={1}>
        <RefreshButton
          top="0"
          layerStyle="base"
          onRefreshPress={() => {
            getInfoPython(props.metaFile.url);
            setLooking(true);
          }}
          isRunning={lookingForChanges}
        />
        <Image
          src={
            props.metaFile.localCover
              ? "" + `safe-file-protocol://${props.metaFile.localCover}`
              : props.metaFile.cover
          }
          alt="cover"
          margin="auto"
          boxSize="180px"
          borderRadius="sm"
        />
      </GridItem>
      <GridItem rowSpan={1} colSpan={1}>
        <Text isTruncated>title: {title}</Text>
        <Text isTruncated>author: {props.metaFile.author}</Text>
        <Text isTruncated>source: {hostname}</Text>
        <Text isTruncated>volumes: {props.metaFile.volumes.length}</Text>
        <Text isTruncated>chapters: {props.metaFile.chapters.length}</Text>
      </GridItem>
      <GridItem rowSpan={1} colSpan={1}>
        <Button onClick={() => setOpen(true)}>Download</Button>
        <NovelModal
          novel={novel}
          novelInfo={novelInfo}
          isOpen={isOpen}
          onClose={() => setOpen(false)}
        ></NovelModal>
      </GridItem>
    </Grid>
  );
};

const FavoriteRow = (props: { novel: Novel }) => {
  const [state, { setNovelInfo }] = useTrackObject(props.novel);
  const hostname = new URL(props.novel.url).hostname;
  const title = props.novel.title.toLowerCase();
  const [cache] = useSessionState("cache", {});
  const [lookingForChanges, setLooking] = useState(false);

  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    console.log(state.novelInfo.cover);
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
  }, [cache, hostname, lookingForChanges, setNovelInfo, title]);
  return (
    <Grid templateColumns="repeat(2, minmax(100px, 1fr))" gap={2} maxW="401px">
      <GridItem rowSpan={2} colSpan={1}>
        <RefreshButton
          top="0"
          layerStyle="base"
          onRefreshPress={() => {
            getInfoPython(props.novel.url);
            setLooking(true);
          }}
          isRunning={lookingForChanges}
        />
        <Image
          src={state.novelInfo ? state.novelInfo.cover : ""}
          alt="cover"
          margin="auto"
          boxSize="180px"
          borderRadius="sm"
        />
      </GridItem>
      <GridItem rowSpan={1} colSpan={1}>
        <Text isTruncated>title: {title}</Text>
        <Text isTruncated>
          author: {state.novelInfo ? state.novelInfo.author : "?"}
        </Text>
        <Text isTruncated>source: {hostname}</Text>
        <Text isTruncated>
          volumes: {state.novelInfo ? state.novelInfo.volumes : "?"}
        </Text>
        <Text isTruncated>
          chapters: {state.novelInfo ? state.novelInfo.chapters : "?"}
        </Text>
      </GridItem>
      <GridItem rowSpan={1} colSpan={1}>
        <Button onClick={() => setOpen(true)}>Download</Button>
        <NovelModal
          novel={props.novel}
          novelInfo={state.novelInfo}
          isOpen={isOpen}
          onClose={() => setOpen(false)}
        ></NovelModal>
      </GridItem>
    </Grid>
  );
};
