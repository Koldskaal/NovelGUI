import React, { useRef, useEffect, useState } from "react";
import { Box, Text, Tooltip } from "@chakra-ui/react";

type TooltipProp = {
  message: string;
  colSpan?: number | "auto";
  maxW?: string;
};

export const OverflowTooltip = ({ message, colSpan, maxW }: TooltipProp) => {
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
    <Box maxW={maxW}>
      <Tooltip
        label={message}
        hasArrow
        openDelay={300}
        isDisabled={!hoverStatus}
      >
        <Text isTruncated ref={textElementRef}>
          {message}
        </Text>
      </Tooltip>
    </Box>
  );
};
