import {
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Spinner,
  Td,
  Box,
} from "@chakra-ui/react";
import React, { useState, useEffect, Fragment } from "react";
import { Novel, useNovelDataContext } from "../AppData";
import { getInfoPython } from "../PythonCommands";

const SiteTable = (props: {
  novelsites: Novel[];
  selected: (novel: Novel) => void;
}) => {
  const rows = props.novelsites.map((novel: Novel, index: number) => (
    <Fragment key={index}>
      <SiteTableRow novel={novel} selected={props.selected} />
    </Fragment>
  ));

  return (
    <Box
      display="block"
      overflowY="scroll"
      h="calc(((100vh - 1.5rem) - 64px) - 110px)"
      border="1px solid"
      borderColor="gray.700"
      rounded="md"
      minW="50%"
    >
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th position="sticky" top="0" layerStyle="justbg">
              Site
            </Th>
            <Th position="sticky" top="0" layerStyle="justbg" isNumeric>
              Chapters
            </Th>
          </Tr>
        </Thead>
        <Tbody>{rows}</Tbody>
      </Table>
    </Box>
  );
};

const SiteTableRow = (props: {
  selected: (novel: Novel) => void;
  novel: Novel;
}) => {
  const [bgColor, setBGColor] = useState("base");
  const data = useNovelDataContext();
  const [isRunning, setIsRunning] = useState(false);

  const hoverColor = () => {
    setBGColor("selected");
  };

  const normalColor = () => {
    setBGColor("base");
  };

  const select = () => {
    props.selected(props.novel);
  };

  const url = new URL(props.novel.url);

  useEffect(() => {
    const url = new URL(props.novel.url);
    const title = props.novel.title.toLowerCase();
    if (!data[title] || !data[title][url.hostname]) {
      setIsRunning(true);
      const task = getInfoPython(url.href);
      const setRun = () => {
        setIsRunning(false);
      };
      task.subscribeToEnd(setRun);

      return () => task.unsubscribeToEnd(setRun);
    }
  }, [props.novel, data]);

  const getChapterInfo = () => {
    if (isRunning) {
      return <Spinner size="sm" />;
    }
    const title = props.novel.title.toLowerCase();
    if (!data[title]) {
      return <div>X</div>;
    }
    if (!data[title][url.hostname]) {
      return <div>X2</div>;
    }
    if (data[title][url.hostname].chapters) {
      return <div>{data[title][url.hostname].chapters}</div>;
    }
    return <div>X</div>;
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
        <Td>{url.hostname}</Td>
        <Td isNumeric>{getChapterInfo()}</Td>
      </Tr>
    </Fragment>
  );
};

export { SiteTable };
