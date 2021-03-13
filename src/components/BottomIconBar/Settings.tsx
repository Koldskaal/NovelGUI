import {
  Text,
  Button,
  Collapse,
  HStack,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast,
  Grid,
  Box,
  VStack,
} from "@chakra-ui/react";
import { read } from "fs";
import React, { useEffect, useState } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";
import { usePersistedState } from "../AppData";
import { ViewManager } from "../../modules/ViewManager";
import { FolderPathInputPrompt } from "../OptionComponents";
import { getMetaPaths, readMetaFiles } from "../../modules/scanFolders";

interface GeneralSettings {
  outputPath: string;
  pythonPath: string;
}

const SettingsModal = (props: { isOpen: boolean; onClose: () => void }) => {
  const { isOpen, onToggle } = useDisclosure();

  const [prevOptions, setPrevOptions] = usePersistedState(
    "defaultOptions",
    {} as GeneralSettings
  );

  const [downloadOptions, setDownloadOptions] = useState({} as GeneralSettings);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    console.log(downloadOptions);
    setPrevOptions(downloadOptions);
  }, [downloadOptions, setPrevOptions]);

  useEffect(() => {
    if (!started) {
      setDownloadOptions(prevOptions);
      setStarted(true);
    }
  }, [prevOptions, started]);

  const toast = useToast();

  const closeModal = () => {
    props.onClose();
  };

  return (
    <Modal onClose={closeModal} isOpen={props.isOpen} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Settings</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <Box>
              <Text>Default output folder</Text>
              <FolderPathInputPrompt
                defaultValue={prevOptions.outputPath}
                onChange={(option) => {
                  setDownloadOptions((prev) => ({
                    ...prev,
                    outputPath: option,
                  }));
                }}
              />
            </Box>
            <Button
              onClick={() => {
                localStorage.removeItem("track");
                ViewManager.broadcast("track", {});
              }}
            >
              Clear tracked data!
            </Button>
            <Button
              // onClick={() =>
              //   getMetaPaths(prevOptions.outputPath).then(files => {
              //     console.log(files);
              //   })}
            >
              Scan Folder
            </Button>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack spacing={4}>
            <Button onClick={closeModal}>Close</Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export { SettingsModal, GeneralSettings };
