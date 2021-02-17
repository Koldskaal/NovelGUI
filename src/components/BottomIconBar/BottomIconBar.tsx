import { RepeatIcon, SettingsIcon } from "@chakra-ui/icons";
import {
  Box,
  Fade,
  Flex,
  IconButton,
  useDisclosure,
  Spacer
} from "@chakra-ui/react";
import React, { Fragment, useEffect, useState } from "react";
import { SettingsModal } from "./Settings";
import { TaskManager } from "./TaskManager";

const BottomIconBar = () => {
  const [taskManagerIsOpen, setTaskManagerIsOpen] = useState(false);
  const [settingsIsOpen, setSettingsIsOpen] = useState(false);

  const toggleTasakManager = () => {
    setTaskManagerIsOpen(!taskManagerIsOpen);
  }

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
        <Spacer />
        <Box pos="relative">
          <TaskManager isOpen={taskManagerIsOpen} onClose={toggleTasakManager} />
          <IconButton
            aria-label="Show queued tasks"
            icon={<RepeatIcon />}
            onClick={toggleTasakManager}
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