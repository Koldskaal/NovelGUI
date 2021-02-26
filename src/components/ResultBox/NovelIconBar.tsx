import { HStack, IconButton } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { BellIcon, SpinnerIcon, StarIcon } from "@chakra-ui/icons";
import { getFromSession, getFromStorage, usePersistedState } from "../AppData";
import { Novel, NovelTracking } from "../dataTypes";
import { isEmpty } from "../modules/helpers";
import { getInfoPython, PythonTask } from "../PythonCommands";
import { useTrackObject } from "../tracking";

export const NovelIconBar = (props: {
  novel: Novel;
  insetInlineEnd: string;
  top: string;
  layerStyle?: string;
  onMouseEnter?: (event: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => void;
  onMouseLeave?: (event: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => void;
  onFavoritePress?: () => void;
  onRefreshPress?: () => void;
  isRunning?: boolean;
}): JSX.Element => {
  const [state, {setFav}] = useTrackObject(props.novel);

  const [isFav, setIsFav] = useState(false);

  const toggleFavorite = () => {
    setFav(!isFav);
    if (props.onFavoritePress) props.onFavoritePress();
  }

  const refresh = () => {
    props.onRefreshPress();
  }


  useEffect(() => {
    setIsFav(state.isFavorite);
  },[props.novel, state])


  return (
    <HStack
      pos="absolute"
      insetInlineEnd={props.insetInlineEnd}
      top={props.top}
      flexDir="row-reverse"
      layerStyle={props.layerStyle}
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
      spacing="0px"
    >
      <IconButton
        disabled={props.isRunning}
        aria-label="Refresh data"
        w={8}
        h={8}
        icon={<SpinnerIcon />}
        minW="1rem"
        background="none"
        onClick={refresh}
      />
      <IconButton
        aria-label="Favorite"
        w={8}
        h={8}
        icon={isFav ? <StarIcon /> : <BellIcon />}
        minW="1rem"
        background="none"
        onClick={toggleFavorite}
      />
    </HStack>
  );
};
