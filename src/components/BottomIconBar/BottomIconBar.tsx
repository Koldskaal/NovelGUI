import { RepeatIcon, SettingsIcon } from "@chakra-ui/icons";
import {
  Box,
  Fade,
  Flex,
  IconButton,
  useDisclosure,
  Spacer
} from "@chakra-ui/react";
import React, { Fragment, useState } from "react";
import { SettingsModal } from "./Settings";
import { TaskManager } from "./TaskManager";

const BottomIconBar = () => {
  const { isOpen, onToggle } = useDisclosure();

  const [settingsIsOpen, setSettingsIsOpen] = useState(false);

  const toggleSettings = () => {
    setSettingsIsOpen(!settingsIsOpen);
  }

  return (
    <Fragment>
      <Flex
        height="30px"
        pos="fixed"
        bottom="0"
        w="100%"
        bg="blue.600"
        boxShadow="inner"
        paddingLeft="10px"
        paddingRight="10px"
      >
        <Fade in={isOpen}></Fade>
        <Spacer />
        <Box pos="relative">
          <TaskManager hidden={isOpen} />
          <IconButton
            aria-label="Show queued tasks"
            icon={<RepeatIcon />}
            onClick={onToggle}
            size="xs" />
          <IconButton
            aria-label="Show settings modal"
            icon={<SettingsIcon />}
            onClick={toggleSettings}
            size="xs" />
          <SettingsModal isOpen={settingsIsOpen} onClose={toggleSettings}/>

        </Box>
      </Flex>
    </Fragment>
  );
};

export { BottomIconBar };