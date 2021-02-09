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
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";
import { usePersistedState } from "../AppData";
import { FolderPathInputPrompt } from "../OptionComponents";

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
    if (started) {
      setPrevOptions(downloadOptions);
    } else {
      setDownloadOptions(prevOptions);
      setStarted(true);
    }
  }, [downloadOptions, started, prevOptions, setPrevOptions]);

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
          <Text>Default output folder</Text>
          <FolderPathInputPrompt
            defaultValue={prevOptions.outputPath}
            onChange={(option) => {
              setDownloadOptions((prev) => ({ ...prev, outputPath: option }));
            }}
          />
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
