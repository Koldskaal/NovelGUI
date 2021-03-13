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
import { getFromSession, usePersistedState } from "../AppData";
import { Novel, NovelInfo } from "../dataTypes";
import { DownloadOptions, DownloadOptionsGrid } from "./DownloadOptionsGrid";
import { NovelInfoGrid } from "./NovelInfoGrid";
import { downloadNovel, getInfoPython, TaskStatus } from "../PythonCommands";
import { RefreshButton } from "./NovelIconBar";
import { isEmpty } from "../../modules/helpers";
import { ViewManager } from "../../modules/ViewManager";
import { RangeType } from "../OptionComponents/ChapterRangeOption";

const NovelModal = (props: {
  novel: Novel;
  isOpen: boolean;
  novelInfo?: NovelInfo;
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
  const [canDownload, setCanDownload] = useState(false);
  const [novelInfo, setNovelInfo] = useState({} as NovelInfo);
  
  const toast = useToast();

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

  

  useEffect(() => {
    if (props.novelInfo) setNovelInfo(props.novelInfo);
  }, [props.novelInfo]);

  useEffect(() => {
    const updateNovelInfo = () => {
      if (!props.novel.url) return;
      const cache = getFromSession("cache");
      const url = new URL(props.novel.url);
      if (cache[props.novel.title.toLowerCase()]) {
        const info = cache[props.novel.title.toLowerCase()][url.hostname];
        if (!isEmpty(info)) {
          setNovelInfo(info);
        }
      }
    };

    const handleCacheChange = (e: CustomEvent) => {
      if (!e.detail.payload && e.detail.payload.key !== "cache") return;

      // notice! it updates on any cache change even if irrelevant
      updateNovelInfo();
    };

    updateNovelInfo();
    ViewManager.subscribe("storage", handleCacheChange);

    return function cleanup() {
      ViewManager.unsubscribe("storage", handleCacheChange);
    };
  }, [props.novel.title, props.novel.url]);

  useEffect(() => {
    
    const validateOptions = () => {
      if (!overrides || !overrides.rangeOption) return;
      if (overrides.rangeOption.radio === RangeType.Chapters) {
        const chapters = overrides.rangeOption.input.split("-").join(",").split(",").map((x) => +x);
        const biggestCh = Math.max(
          ...chapters
        );
        if (biggestCh > novelInfo.chapters) {
          // about to find out if range is possible
          return false;
        }
      }
      else if (overrides.rangeOption.radio === RangeType.Volumes)
      {
        const volumes = overrides.rangeOption.input.split("-").join(",").split(",").map((x) => +x);
        const biggestVol = Math.max(
          ...volumes
        );

        if (biggestVol * 100 > novelInfo.chapters){
          return false;
        }
      }

      return true;
    };

    setCanDownload(validateOptions());
  },[novelInfo.chapters, overrides]);

  return (
    <Modal onClose={closeModal} isOpen={props.isOpen} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{hostname}</ModalHeader>
        <RefreshButton
          insetInlineEnd="3.75rem"
          top="0.5rem"
          onRefreshPress={refreshData}
          isRunning={isRunning}
        />
        <ModalCloseButton />
        <ModalBody>
          <Collapse in={!isOpen} animateOpacity>
            <NovelInfoGrid
              author={novelInfo.author}
              title={novelInfo.title}
              cover={novelInfo.cover}
              chapters={novelInfo.chapters}
              volumes={novelInfo.volumes}
            />
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
            <Button isDisabled={!canDownload} onClick={startDownload}>
              Download
            </Button>
            <Button onClick={closeModal}>Close</Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export { NovelModal };
