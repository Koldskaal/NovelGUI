import { HStack, IconButton } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { BellIcon, SpinnerIcon, StarIcon } from "@chakra-ui/icons";


export const RefreshButton = (props: {
  top: string;
  insetInlineEnd?: string;
  layerStyle?: string;
  onMouseEnter?: (
    event: React.MouseEvent<HTMLTableRowElement, MouseEvent>
  ) => void;
  onMouseLeave?: (
    event: React.MouseEvent<HTMLTableRowElement, MouseEvent>
  ) => void;
  onRefreshPress?: () => void;
  isRunning?: boolean;
}): JSX.Element => {
  const refresh = () => {
    props.onRefreshPress();
  };

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
    </HStack>
  );
};
