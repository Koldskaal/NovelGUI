import React, { useRef, useEffect, useState } from "react";
import { GridItem, Text, Tooltip } from "@chakra-ui/react";

type TooltipProp = {
    message: string,
    colSpan: number | "auto",
}

export const OverflowTooltip = ({message, colSpan}: TooltipProp) => {
    const textElementRef = useRef<HTMLHeadingElement>(null);
  
    const compareSize = () => {
      const compare =
        textElementRef.current.scrollWidth > textElementRef.current.clientWidth;
      setHover(compare);
    };
  
    useEffect(() => {
      compareSize();
    }, [textElementRef.current]);
  
    const [hoverStatus, setHover] = useState(false);
  
    return (
      <GridItem w="100%" colSpan={colSpan} paddingLeft="1.5rem" paddingRight="1.5rem" paddingTop="0.75rem" paddingBottom="0.75rem">
        <Tooltip label={message} hasArrow openDelay={300} isDisabled={!hoverStatus}>
          <Text isTruncated ref={textElementRef}>
            {message}
          </Text>
        </Tooltip>
      </GridItem>
    );
  };