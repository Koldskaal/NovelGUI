import {
  Box,
  Tr,
  Td,
  Text,
  Table,
  Tbody,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  Flex,
  Spacer,
  VStack,
} from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import React, { Component, Fragment, useEffect, useState } from "react";
import { OverflowTooltip } from "./OverflowTooltip";

type Novel = {
  info: string;
  title: string;
  url: string;
};

export type NovelResult = {
  id: string;
  novels: Novel[];
  title: string;
};

export enum ResultBoxState {
  None,
  SelectNovel,
  SelectSite,
}

export const ResultBox = (prop: {
  results: NovelResult[];
  state: ResultBoxState;
}) => {
  const [canUseData, setCanUse] = useState(false);
  const [hasSelected, setSelected] = useState(false);
  const [novels, setNovels] = useState([] as Novel[]);
  const [novelTitle, setNovelTitle] = useState("");
  const [currentState, setState] = useState(ResultBoxState.None);

  useEffect(() => {
    switch (currentState) {
      case ResultBoxState.None:
        return;
      case ResultBoxState.SelectNovel: {
        if (typeof prop.results === "undefined") {
          setState(ResultBoxState.None);
          return;
        }
        
        return;
      }
      case ResultBoxState.SelectSite: {
        return;
      }
    }
  }, [currentState, prop.results]);

  useEffect(() => {
    setState(prop.state);
  },[prop.state])

  const selectedNovel = (novel: NovelResult) => {
    setNovels(novel.novels as Novel[]);
    setSelected(true);
    console.log(novel.novels);
    setNovelTitle(novel.title);
    setState(ResultBoxState.SelectSite);
  };

  const emptySelect = (novel: Novel) => {
    console.log(novel);
  };

  const populateTable = () => {
    switch (currentState) {
      case ResultBoxState.None:
        return null;
      case ResultBoxState.SelectNovel: {
        const components = [] as JSX.Element[];
        const rows = prop.results.map((results: NovelResult, index: number) => (
          <Fragment key={index}>
            <NovelResultTab
              selected={selectedNovel}
              results={results}
              key={results.id}
            />
          </Fragment>
        ));
        return rows;
      }
      case ResultBoxState.SelectSite: {
        const components = [] as JSX.Element[];
        const rows = novels.map((novel: Novel, index:number) => (
          <Fragment key={index}>
            <NovelSelectedTab
              novel={novel}
              selected={emptySelect}
              key={novel.url}
            />
          </Fragment>
        ));

        return rows;
      }
      default:
        return null;
    }
  };

  return (
    <Box minWidth="100%" maxWidth="100%">
      <Box p="10px">
        <TopBar
          resultState={currentState}
          novelTitle={novelTitle}
          onClickHandle={() => setSelected(false)}
        ></TopBar>
      </Box>
      <Box
        border="1px solid"
        borderColor="gray.700"
        rounded="md"
        minW="50%"
        zIndex="10"
      >
        <Table variant="simple" display="flex">
          <Tbody
            h="calc(((100vh - 1.5rem) - 64px) - 60px)"
            display="block"
            overflowY="scroll"
            flex="1 1 auto"
          >
            {populateTable()}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

const NovelSelectedTab = (prop: {
  selected: (novel: Novel) => void;
  novel: Novel;
}) => {
  const [bgColor, setBGColor] = useState("base");
  const hoverColor = () => {
    setBGColor("selected");
  };

  const normalColor = () => {
    setBGColor("base");
  };

  const select = () => {
    prop.selected(prop.novel);
  };

  const url = new URL(prop.novel.url);


  return (
    <Fragment>
      <Tr
        onMouseEnter={hoverColor}
        layerStyle={bgColor}
        onMouseLeave={normalColor}
        onMouseDown={select}
        className={"pointer"}
        zIndex="-1"
        // display="table"
        width="100%"
      >
        <Td>{url.hostname}</Td>
        {/* <Td>{prop.novel.info}</Td> */}
      </Tr>
    </Fragment>
  );
};

const NovelResultTab = (prop: {
  selected: (novel: NovelResult) => void;
  results: NovelResult;
}) => {
  const [bgColor, setBGColor] = useState("base");
  const hoverColor = () => {
    setBGColor("selected");
  };

  const normalColor = () => {
    setBGColor("base");
  };

  const select = () => {
    prop.selected(prop.results);
  };

  return (
    <Fragment>
      <Tr
        onMouseEnter={hoverColor}
        layerStyle={bgColor}
        onMouseLeave={normalColor}
        onMouseDown={select}
        className={"pointer"}
        zIndex="-1"
        // display="table"
        width="100%"
      >
        <Td>{prop.results.title}</Td>
      </Tr>
    </Fragment>
  );
};

const TopBar = (props: {
  resultState: ResultBoxState;
  onClickHandle?: () => void;
  novelTitle: string;
}) => {
  const currentInstruction = (state: ResultBoxState) => {
    switch (state) {
      case ResultBoxState.None:
        return "";
      case ResultBoxState.SelectNovel:
        return "Select a novel";
      case ResultBoxState.SelectSite:
        return "Select a site";
    }
  };

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
      props.onClickHandle;
    }
  };

  return (
    <Flex>
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
              <OverflowTooltip message={item.text} maxW="100%" />
            </BreadcrumbLink>
          </BreadcrumbItem>
        ))}
      </Breadcrumb>
      <Spacer />
      <Text>{currentInstruction(props.resultState)}</Text>
    </Flex>
  );
};
