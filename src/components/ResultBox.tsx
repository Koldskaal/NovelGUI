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
} from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import React, { Fragment, useEffect, useState } from "react";
import { Scrollbar } from "react-scrollbars-custom";

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

export const ResultBox = (prop: { results: NovelResult[] }) => {
  const [canUseData, setCanUse] = useState(false);
  const [hasSelected, setSelected] = useState(false);
  const [novels, setNovels] = useState([] as Novel[]);
  const [novelTitle, setNovelTitle] = useState("");

  useEffect(() => {
    if (typeof prop.results === "undefined") {
      setCanUse(false);
    } else {
      setCanUse(true);
    }
  }, [prop.results]);

  const selectedNovel = (novel: NovelResult) => {
    setNovels(novel.novels as Novel[]);
    setSelected(true);
    console.log(novel.novels);
    setNovelTitle(novel.title);
  };

  const emptySelect = (novel: Novel) => {
    console.log(novel);
  };

  return (
    <div>
      <Box p="10px">
        <Breadcrumb
          spacing="8px"
          separator={<ChevronRightIcon color="gray.500" />}
        >
          {canUseData ? 
               <BreadcrumbItem isCurrentPage={!hasSelected}>
            
              <BreadcrumbLink href="#">Results</BreadcrumbLink>
            </BreadcrumbItem>
           : null}

          {novelTitle.length > 0 ? (
            <BreadcrumbItem isCurrentPage={hasSelected}>
              <BreadcrumbLink href="#">{novelTitle}</BreadcrumbLink>
            </BreadcrumbItem>
          ) : null}
        </Breadcrumb>
      </Box>
      <Box
        border="1px solid"
        borderColor="gray.700"
        rounded="md"
        minW="50%"
        zIndex="10"
      >
        <Table variant="simple">
          <Tbody
            h="calc(((100vh - 1.5rem) - 64px) - 42px)"
            display="block"
            overflowY="scroll"
          >
            {canUseData && hasSelected === false
              ? prop.results.map((results: NovelResult) => (
                  <NovelResultTab
                    selected={selectedNovel}
                    results={results}
                    key={results.id}
                  />
                ))
              : null}

            {hasSelected
              ? novels.map((novel: Novel) => (
                  <NovelSelectedTab
                    novel={novel}
                    selected={emptySelect}
                    key={novel.url}
                  />
                ))
              : null}
          </Tbody>
        </Table>
      </Box>
    </div>
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

  return (
    <Fragment>
      <Tr
        onMouseEnter={hoverColor}
        layerStyle={bgColor}
        onMouseLeave={normalColor}
        onMouseDown={select}
        className={"pointer"}
        zIndex="-1"
      >
        <Td>{prop.novel.url}</Td>
        <Td>{prop.novel.info}</Td>
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
      >
        <Td>{prop.results.title}</Td>
      </Tr>
    </Fragment>
  );
};
