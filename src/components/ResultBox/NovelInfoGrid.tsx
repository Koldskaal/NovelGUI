import { Grid, GridItem, Text, Image, Box } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { getFromSession } from "../AppData";
import { Novel, NovelInfo } from "../dataTypes";
import { ViewManager } from "../modules/ViewManager";
import { isEmpty } from "../modules/helpers";

export const NovelInfoGrid = (props: { novel: Novel }) => {
  const [novelInfo, setNovelInfo] = useState({} as NovelInfo);

  useEffect(() => {
    const updateNovelInfo = () => {
      const cache = getFromSession("cache");
      const url = new URL(props.novel.url);
      if (cache[props.novel.title.toLowerCase()]) {
        const info = cache[props.novel.title.toLowerCase()][url.hostname];
        if (!isEmpty(info)) {
          setNovelInfo(info);
        }
      }
    };

    const handleCacheChange = (e: CustomEvent) => {
      if (!e.detail.payload && e.detail.payload.key !== "cache") return;

      // notice! it updates on any cache change even if irrelevant
      updateNovelInfo();
    };

    updateNovelInfo();
    ViewManager.subscribe("storage", handleCacheChange);

    return function cleanup() {
      ViewManager.unsubscribe("storage", handleCacheChange);
    };
  }, [props.novel.title, props.novel.url]);

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
          borderRadius="sm"
        />
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
