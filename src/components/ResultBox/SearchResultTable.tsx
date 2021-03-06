import React, { Fragment, useEffect, useState } from "react";

import { Box, Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { NovelResult } from "../dataTypes";

const SearchResultTable = (props: {
  searchResults: NovelResult[];
  selected: (novel: NovelResult) => void;
}): JSX.Element => {
  const rows = props.searchResults.map(
    (results: NovelResult, index: number) => (
      <Fragment key={index}>
        <SearchResultTableRow
          selected={props.selected}
          results={results}
          key={results.id}
        />
      </Fragment>
    )
  );

  return (
    <Box
      h="calc(((100vh - 1.5rem) - 64px) - 110px)"
      display="block"
      overflowY="scroll"
      border="1px solid"
        borderColor="gray.700"
        rounded="md"
        minW="50%"
      
    >
      <Table variant="simple" size="sm">
        <Thead>
          <Tr padding="0.5rem">
            <Th position="sticky" top="0" layerStyle="justbg">Title</Th>
          </Tr>
        </Thead>
        <Tbody>{rows}</Tbody>
      </Table>
    </Box>
  );
};

const SearchResultTableRow = (props: {
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
    props.selected(props.results);
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
        <Td>{props.results.title}</Td>
      </Tr>
    </Fragment>
  );
};

export { SearchResultTable };
