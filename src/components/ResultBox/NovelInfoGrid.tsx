import {
  Grid,
  GridItem,
  Text,
  Image,
  Box
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { Novel, NovelInfo, useNovelDataContext, useSubscribeToUpdates } from "../AppData";

function isEmpty(ob: NovelInfo) {
    for (const i in ob) {
      return false;
    }
    return true;
  }

export const NovelInfoGrid = (props: { novel: Novel; }) => {
  const data = useNovelDataContext();
  const [novelInfo, setNovelInfo] = useState({} as NovelInfo);
  const subscribe = useSubscribeToUpdates();

  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (started) return;

    const updateNovelInfo = () => {
      const url = new URL(props.novel.url);
      if (data[props.novel.title.toLowerCase()]) {
        const info = data[props.novel.title.toLowerCase()][url.hostname];
        console.log(info);
        if (!isEmpty(info)) {
          setNovelInfo(info);
        }
      }
    }

    subscribe(updateNovelInfo);
    setStarted(true);
  },[subscribe, data, props.novel.title, props.novel.url, started])

  useEffect(() => {
    const url = new URL(props.novel.url);
    if (data[props.novel.title.toLowerCase()]) {
      const info = data[props.novel.title.toLowerCase()][url.hostname];
      console.log(info);
      if (!isEmpty(info)) {
        setNovelInfo(info);
      }
    }
  }, [props.novel.url, props.novel.title, data]);

  const author = () => {
    if (!isEmpty(novelInfo)) {
      return novelInfo.author;
    }
    return "X";
  };

  const title = () => {
    if (!isEmpty(novelInfo)) {
      return novelInfo.title;
    }
    return "X";
  };

  const coverLink = () => {
    if (!isEmpty(novelInfo)) {
      return novelInfo.cover;
    }
    return "X";
  };

  const chapters = () => {
    if (!isEmpty(novelInfo)) {
      return novelInfo.chapters;
    }
    return "X";
  };

  const volumes = () => {
    if (!isEmpty(novelInfo)) {
      return novelInfo.volumes;
    }
    return "X";
  };

  return (
    <Grid templateColumns="repeat(2, minmax(100px, 1fr))" gap={2}>
      <GridItem rowSpan={1} colSpan={1}>
        <Box paddingBottom="3px">
          <Text fontSize="13px">Title:</Text>
        </Box>
        <Box
          layerStyle="selected"
          borderRadius="sm"
          paddingTop="4px"
          paddingBottom="4px"
          paddingLeft="8px"
          paddingRight="8px"
        >
          <Text fontSize="14px" isTruncated>
            {title()}
          </Text>
        </Box>
      </GridItem>
      <GridItem rowSpan={4} colSpan={1}>
        <Image
          src={coverLink()}
          alt="cover"
          margin="auto"
          boxSize="250px"
          borderRadius="sm" />
      </GridItem>
      <GridItem rowSpan={1} colSpan={1}>
        <Box paddingBottom="3px">
          <Text fontSize="13px">Author:</Text>
        </Box>
        <Box
          layerStyle="selected"
          borderRadius="sm"
          paddingTop="4px"
          paddingBottom="4px"
          paddingLeft="8px"
          paddingRight="8px"
        >
          <Text fontSize="14px" isTruncated>
            {author()}
          </Text>
        </Box>
      </GridItem>
      <GridItem rowSpan={1} colSpan={1}>
        <Box paddingBottom="3px">
          <Text fontSize="13px">Chapters:</Text>
        </Box>
        <Box
          layerStyle="selected"
          borderRadius="sm"
          paddingTop="4px"
          paddingBottom="4px"
          paddingLeft="8px"
          paddingRight="8px"
        >
          <Text fontSize="14px" isTruncated>
            {chapters()}
          </Text>
        </Box>
      </GridItem>
      <GridItem rowSpan={1} colSpan={1}>
        <Box paddingBottom="3px">
          <Text fontSize="13px">Volumes:</Text>
        </Box>
        <Box
          layerStyle="selected"
          borderRadius="sm"
          paddingTop="4px"
          paddingBottom="4px"
          paddingLeft="8px"
          paddingRight="8px"
        >
          <Text fontSize="14px" isTruncated>
            {volumes()}
          </Text>
        </Box>
      </GridItem>
    </Grid>
  );
};
