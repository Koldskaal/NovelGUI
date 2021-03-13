import { Grid, GridItem, Text, Image, Box } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { getFromSession } from "../AppData";
import { Novel, NovelInfo } from "../dataTypes";
import { ViewManager } from "../../modules/ViewManager";
import { isEmpty } from "../../modules/helpers";

export const NovelInfoGrid = ({title, author, cover, volumes, chapters}: NovelInfo) => {
  const getAuthor = () => {
    if (author) {
      return author;
    }
    return "X";
  };

  const getTitle = () => {
    if (title) {
      return title;
    }
    return "X";
  };

  const coverLink = () => {
    if (cover) {
      return cover;
    }
    return "X";
  };

  const getChapters = () => {
    if (chapters) {
      return chapters;
    }
    return "X";
  };

  const getVolumes = () => {
    if (volumes) {
      return volumes;
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
            {getTitle()}
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
            {getAuthor()}
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
            {getChapters()}
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
            {getVolumes()}
          </Text>
        </Box>
      </GridItem>
    </Grid>
  );
};
