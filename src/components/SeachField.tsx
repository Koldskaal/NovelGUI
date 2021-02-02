import { Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import React, { Fragment, useState } from "react";

import { searchPython, taskManager } from "./PythonCommands";
import { SearchIcon } from "@chakra-ui/icons";

type SearchProp = {
  onSearchEnd?: () => void;
  onSearchStart?: () => void;
};

export const SearchField = ({
  onSearchEnd,
  onSearchStart,
}: SearchProp): JSX.Element => {
  const [value, setValue] = useState("");
  const handleChange = (event: any) => setValue(event.target.value);

  const handleClick = () => {
    taskManager.clearQueue("search", true);

    const task = searchPython(value);
    task.subscribeToMessage(() => {
      task.send({}); // need to ping back to get continuous updates
    });

    if (onSearchEnd) {
      task.subscribeToEnd(onSearchEnd);
    }

    if (onSearchStart) {
      onSearchStart();
    }
  };

  const formSubmit = (event: any) => {
    handleClick();
    event.preventDefault();
  };

  return (
    <Fragment>
      <form onSubmit={formSubmit} className={"searchBar"}>
        <InputGroup spacing="10px" paddingTop="20px" minWidth="50%">
          <InputLeftElement
            pointerEvents="none"
            children={<SearchIcon color="gray.300" />}
            top="false"
          />
          <Input
            borderRadius="full"
            placeholder="Search for a novel"
            onChange={handleChange}
          />
        </InputGroup>
      </form>
    </Fragment>
  );
};
