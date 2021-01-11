import React, { useRef, useEffect, useState } from "react";
import { Grid, GridItem, Text, Tooltip } from "@chakra-ui/react";
import { OverflowTooltip } from "./OverflowTooltip"

type NovelProps = {
  title: string;
  source: string;
  chapters: number;
};





export const NovelCard = ({ title, source, chapters }: NovelProps) => {

  const ch = chapters.toString();

  return (
    <Grid templateColumns="repeat(6, 1fr)" borderBottom="1px solid" 
    borderColor="inherit">
      <OverflowTooltip message={title} colSpan={2}/>
      <OverflowTooltip message={source} colSpan={3}/>
      <OverflowTooltip message={ch} colSpan={1}/>
    </Grid>
  );
};


