import React, { useState } from "react";
import {
  Box,
  Progress,
  Fade,


  CloseButton,
  HStack,

  Text,
  Center,

  Tag,
  TagLabel,

  Spinner
} from "@chakra-ui/react";
import { TaskProp } from ".";

export const Task = ({ task, task_detail, progress, onCancelButton }: TaskProp) => {
  const [showCloseBtn, setShowCloseBtn] = useState(false);

  const generateLabel = () => {
    if (progress > 0)
      return progress.toFixed(0).toString() + "%";
    return <Spinner size="sm" />;
  };

  return (
    <Box
      height="30px"
      w="100%"
      onMouseEnter={() => setShowCloseBtn(true)}
      onMouseLeave={() => setShowCloseBtn(false)}
      spacing={0}
      borderBottom="0.5px solid"
      borderColor="gray.700"
    >
      <Box pos="relative" w="100%" h="100%">
        <Box
          pos="absolute"
          width="100%"
          h="100%"
          bg="#2d3748a6"
          left="0"
          zIndex="1"
          hidden={showCloseBtn ? false : true}
        >
          <Center h="100%">
            <Text isTruncated h="20px" maxW="180px" left="0px" fontSize="xs">
              {task_detail ? task_detail : "Waiting..."}
            </Text>
          </Center>
        </Box>
      </Box>

      <HStack w="100%" pos="relative">
        <Center position="absolute" top="-26px" left="5px" w="50px" zIndex="2">
          <Tag variant="outline" width="100%" justifyContent="center">
            <TagLabel>{generateLabel()}</TagLabel>
          </Tag>
        </Center>
        <Center>
          <Progress
            value={progress}
            position="absolute"
            size="xs"
            w="75%"
            left="60px"
            top="-15px" />
        </Center>
      </HStack>

      <Box pos="relative" w="100%" zIndex="2">
        <Fade in={showCloseBtn}>
          <Box pos="absolute" h="100%" right="5px" top="-27px">

            <CloseButton size="sm" onClick={onCancelButton} />

          </Box>
        </Fade>
      </Box>
    </Box>
  );
};
