import React, { useRef, useEffect, useState } from "react";
import { Box, Text, Tooltip } from "@chakra-ui/react";

type TooltipProp = {
  message: string;
  maxW?: string;
  fontsize?: string;
  color?:string;
};

export const OverflowTooltip = ({ message, maxW, fontsize: fontSize, color }: TooltipProp) => {
  const textElementRef = useRef<HTMLHeadingElement>(null);

  const compareSize = () => {
    const compare =
      textElementRef.current.scrollWidth > textElementRef.current.clientWidth;
    setHover(compare);
  };

  useEffect(() => {
    compareSize();
  }, []);

  const [hoverStatus, setHover] = useState(false);

  return (
    <Box maxW={maxW}>
      <Tooltip
        label={message}
        hasArrow
        openDelay={300}
        isDisabled={!hoverStatus}
      >
        <Text fontSize={fontSize} color={color}  isTruncated ref={textElementRef}>
          {message}
        </Text>
      </Tooltip>
    </Box>
  );
};
