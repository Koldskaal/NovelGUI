import { HStack, IconButton } from "@chakra-ui/react";
import React from "react";
import { SpinnerIcon, StarIcon } from "@chakra-ui/icons";

export const NovelIconBar = (props: {
  insetInlineEnd: string;
  top: string;
  layerStyle?: string;
  onMouseEnter?: (event: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => void;
  onMouseLeave?: (event: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => void;
  onFavoritePress?: () => void;
  onRefreshPress?: () => void;
}): JSX.Element => {
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
        aria-label="Refresh data"
        w={8}
        h={8}
        icon={<SpinnerIcon />}
        minW="1rem"
        background="none"
        onClick={props.onRefreshPress}
      />
      <IconButton
        aria-label="Favorite"
        w={8}
        h={8}
        icon={<StarIcon />}
        minW="1rem"
        background="none"
        onClick={props.onFavoritePress}
      />
    </HStack>
  );
};
