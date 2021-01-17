import {
  Button,
  Input,
  InputGroup,
  FormControl,
  Progress,
  HStack,
  Flex,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Grid,
  SlideFade,
  Box,
  InputLeftElement,
} from "@chakra-ui/react";
import { PythonShell } from "python-shell";
import React, { Fragment, useEffect, useState } from "react";
import { NovelResult } from "./ResultBox";

import { searchPython, PythonTask } from "./PythonCommands";
import { SearchIcon } from "@chakra-ui/icons";

type SearchProp = {
  onDataChange: (results: NovelResult[]) => void;
  onSearchEnd?: () => void;
  onSearchStart?: () => void;
};

export const SearchField = ({
  onDataChange,
  onSearchEnd,
  onSearchStart,
}: SearchProp) => {
  const [value, setValue] = useState("");
  const handleChange = (event: any) => setValue(event.target.value);

  const handleClick = () => {
    const task = searchPython(value);
    task.subscribeToMessage((message: any) => {
      console.log(message.task_detail);

      if (message.novels) {
        setData(message.novels);
      }
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

  const [data, setData] = useState([]);

  useEffect(() => {
    onDataChange(data as NovelResult[]);
  }, [data, onDataChange]);

  return (
    <Fragment>
      <form onSubmit={formSubmit} className={"searchBar"}>
        <InputGroup
          spacing="10px"
          paddingTop="20px"
          minWidth="100%"
          
        >
          <InputLeftElement
            pointerEvents="none"
            children={<SearchIcon color="gray.300" />}
            top="false"
          />
          <Input borderRadius="full" placeholder="Search for a novel" onChange={handleChange} />
        </InputGroup>
      </form>
    </Fragment>
  );
};
