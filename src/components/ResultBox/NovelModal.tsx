import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  HStack,
  Box,
  Collapse,
  Icon,
} from "@chakra-ui/react";
import { FaMinus, FaPlus } from "react-icons/fa";
import React, { useState } from "react";
import { Novel } from "../AppData";
import { DownloadOptions, DownloadOptionsGrid } from "./DownloadOptionsGrid";
import { NovelInfoGrid } from "./NovelInfoGrid";
import { downloadNovel } from "../PythonCommands";



function isNovelEmpty(ob: Novel) {
  for (const i in ob) {
    return false;
  }
  return true;
}

const NovelModal = (props: {
  novel: Novel;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const hostname = !isNovelEmpty(props.novel)
    ? new URL(props.novel.url).hostname
    : "";

  const { isOpen, onToggle } = useDisclosure();
  const [overrides, setOverrides] = useState({} as DownloadOptions);

  const startDownload = () => {
    downloadNovel(props.novel.url, overrides);
    props.onClose();
  }

  return (
    <Modal onClose={props.onClose} isOpen={props.isOpen} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{hostname}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Collapse in={!isOpen} animateOpacity>
            <NovelInfoGrid novel={props.novel} />
          </Collapse>

          <Button
            onClick={onToggle}
            variant="outline"
            size="sm"
            w="100%"
            marginTop="10px"
            marginBottom="5px"
          >
            Download Options
            <Box pos="absolute" right="10px">
              <Icon as={!isOpen ? FaPlus : FaMinus} />
            </Box>
          </Button>

          <Collapse in={isOpen} animateOpacity>
            <DownloadOptionsGrid onOptionChange={(options) => setOverrides(options)}/>
          </Collapse>
        </ModalBody>
        <ModalFooter>
          <HStack spacing={4}>
            <Button onClick={startDownload}>Download</Button>
            <Button onClick={props.onClose}>Close</Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export { NovelModal };
