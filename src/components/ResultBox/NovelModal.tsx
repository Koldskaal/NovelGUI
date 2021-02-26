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
  useToast,
} from "@chakra-ui/react";
import { FaMinus, FaPlus } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import { usePersistedState } from "../AppData";
import { Novel } from "../dataTypes";
import { DownloadOptions, DownloadOptionsGrid } from "./DownloadOptionsGrid";
import { NovelInfoGrid } from "./NovelInfoGrid";
import { downloadNovel, getInfoPython, TaskStatus } from "../PythonCommands";
import { NovelIconBar } from "./NovelIconBar";
import { isEmpty } from "../modules/helpers";

const NovelModal = (props: {
  novel: Novel;
  isOpen: boolean;
  onClose: () => void;
}): JSX.Element => {
  const hostname = !isEmpty(props.novel)
    ? new URL(props.novel.url).hostname
    : "";

  const { isOpen, onToggle } = useDisclosure();
  const [overrides, setOverrides] = useState({} as DownloadOptions);

  const [prevOptions, setPrevOptions] = usePersistedState(
    "options",
    {} as DownloadOptions
  );

  const [isRunning, setIsRunning] = useState(false);

  const toast = useToast();

  useEffect(() => {
    console.log(props.novel.title);
    console.log(prevOptions);
  }, [prevOptions, props.novel.title]);

  const closeModal = () => {
    const options = {} as DownloadOptions;
    options.openFolder = overrides.openFolder;
    options.outputFormats = overrides.outputFormats;
    options.folderPathOption = overrides.folderPathOption;
    setPrevOptions(options);

    props.onClose();
  };

  const startDownload = () => {
    const task = downloadNovel(
      props.novel.url,
      props.novel.title.toLowerCase(),
      overrides
    );
    task.subscribeToMessage((message) => {
      task.send({}); // need to ping back to get continuous updates
    });

    toast({
      title: `${props.novel.title}`,
      description: "The novel will download shortly!",
      status: "success",
      duration: 2000,
      isClosable: true,
    });

    task.subscribeToEnd(() => {
      if (task.status !== TaskStatus.SUCCESS) return;
      toast({
        title: `${props.novel.title}`,
        description: "The novel finished downloading.",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    });

    closeModal();
  };

  const refreshData = () => {
    setIsRunning(true);
    const task = getInfoPython(props.novel.url);
    const setRun = () => {
      setIsRunning(false);
      task.unsubscribeToEnd(setRun);
    };
    task.subscribeToEnd(setRun);
  };

  return (
    <Modal onClose={closeModal} isOpen={props.isOpen} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{hostname}</ModalHeader>
        <NovelIconBar
          novel={props.novel}
          insetInlineEnd="3.75rem"
          top="0.5rem"
          onRefreshPress={refreshData}
          isRunning={isRunning}
        />
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
            <DownloadOptionsGrid
              defaultOptions={prevOptions}
              onOptionChange={(options) => setOverrides(options)}
            />
          </Collapse>
        </ModalBody>
        <ModalFooter>
          <HStack spacing={4}>
            <Button onClick={startDownload}>Download</Button>
            <Button onClick={closeModal}>Close</Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export { NovelModal };
