import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
} from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import React, { useEffect, useRef, useState } from "react";
import { OverflowTooltip } from "../OverflowTooltip";

import { taskManager } from "../PythonCommands";
import {
  Novel,
  NovelResult,
  useSearchDataContext,
} from "../AppData";
import { ViewManager } from "../modules/ViewManager";
import { SearchResultTable } from "./SearchResultTable";
import { SiteTable } from "./SiteTable";
import { NovelModal } from "./NovelModal";

export enum ResultBoxState {
  None,
  SelectNovel,
  SelectSite,
}

export const ResultBox = () => {
  const [novels, setNovels] = useState([] as Novel[]);
  const [novelTitle, setNovelTitle] = useState("");
  const [novel, setNovel] = useState({} as Novel);
  const [isOpen, setIsOpen] = useState(false);
  const [currentState, setState] = useState(ResultBoxState.None);

  const searchResults = useSearchDataContext();

  useEffect(() => {
    const onSearch = function (event: Event) {
      setState(ResultBoxState.SelectNovel);
    }
    ViewManager.subscribe("search", onSearch)
  }, []);

  const selectedNovel = (novel: NovelResult) => {
    setNovels(novel.novels as Novel[]);

    setNovelTitle(novel.title);
    setState(ResultBoxState.SelectSite);

    taskManager.clearQueue("search", true); // cancel ongoing search on novel selection
  };

  const openNovelModal = (novel: Novel) => {
    setNovel(novel);
    setIsOpen(true);
  };

  const populateTable = () => {
    switch (currentState) {
      case ResultBoxState.None:
        return null;
      case ResultBoxState.SelectNovel: {
        return (
          <SearchResultTable
            searchResults={searchResults}
            selected={selectedNovel}
          />
        );
      }
      case ResultBoxState.SelectSite: {
        return <SiteTable novelsites={novels} selected={openNovelModal} />;
      }
      default:
        return null;
    }
  };

  return (
    <Box minWidth="100%" maxWidth="100%">
      <Box>
        <TopBar
          resultState={currentState}
          novelTitle={novelTitle}
          onClickHandle={() => setState(ResultBoxState.SelectNovel)}
        ></TopBar>
      </Box>
      <Box>{populateTable()}</Box>
      <NovelModal novel={novel} isOpen={isOpen} onClose={() => setIsOpen(false)}/>
    </Box>
  );
};

const TopBar = (props: {
  resultState: ResultBoxState;
  onClickHandle?: () => void;
  novelTitle: string;
}) => {
  const currentBreadcrumb = (state: ResultBoxState) => {
    switch (state) {
      case ResultBoxState.None:
        return [];
      case ResultBoxState.SelectNovel:
        return [{ isCurrentPage: true, text: "Results" }];
      case ResultBoxState.SelectSite:
        return [
          { isCurrentPage: false, text: "Results" },
          { isCurrentPage: true, text: props.novelTitle },
        ];
    }
  };

  const shouldClick = (shouldClick: boolean) => {
    if (shouldClick) {
      props.onClickHandle();
    }
  };

  return (
    <Flex p="4px">
      <Breadcrumb
        spacing="8px"
        separator={<ChevronRightIcon color="gray.500" />}
      >
        {currentBreadcrumb(props.resultState).map((item, index) => (
          <BreadcrumbItem isCurrentPage={item.isCurrentPage} key={index}>
            <BreadcrumbLink
              onClick={() => {
                shouldClick(!item.isCurrentPage);
              }}
              key={index}
            >
              <OverflowTooltip
                color="gray.400"
                fontsize="0.75rem"
                message={item.text}
                maxW="200px"
              />
            </BreadcrumbLink>
          </BreadcrumbItem>
        ))}
      </Breadcrumb>
    </Flex>
  );
};
