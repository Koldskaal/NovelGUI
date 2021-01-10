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
  Grid
} from "@chakra-ui/react";
import { PythonShell } from "python-shell";
import React, { Fragment, useEffect, useState } from "react";

import { searchPython, quitCommand } from "./PythonCommands";

export const SearchField = () => {
  const [value, setValue] = useState("");

  const handleChange = (event: any) => setValue(event.target.value);

  const handleClick = () => {
    setProgress(0)

    const pyshell: PythonShell = searchPython(value);
    pyshell.on("message", function (message) {
      if (message["status"] != "ONGOING") {
        onClose();
        return;
      }
      onOpen();
      setMax(message["max"]);
      setProgress(message["current"]);
      setPct((message["current"] / message["max"]) * 100);
      if (message["novels"]) {
        setData(message["novels"]);
      }
      pyshell.send({ confirmed: 1 });
    });
  };

  const handleCancel = () => {
    onClose();
    quitCommand();
  };

  const formSubmit = (event: any) => {
    handleClick();
    event.preventDefault();
  };

  const [data, setData] = useState({});
  const [pct, setPct] = useState(0);
  const [progress, setProgress] = useState(0);
  const [max, setMax] = useState(0);

  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    console.log(data);
  }, [data]);


  return (
    <Fragment>
        <form onSubmit={formSubmit} className={"searchBar"}>
          <HStack spacing="10px" paddingTop="20px" paddingBottom="20px" minWidth="100%">
            <Input placeholder="Basic usage" onChange={handleChange} />
            <Button onClick={handleClick}>Search</Button>
          </HStack>
        </form>
        <Drawer placement="bottom" onClose={onClose} isOpen={isOpen} closeOnOverlayClick={false}>
        {/* <DrawerOverlay> */}
          <DrawerContent>
            <DrawerHeader borderBottomWidth="1px">Searching sites: {progress}/{max}</DrawerHeader>
            <DrawerCloseButton onClick={handleCancel} />
            <DrawerBody>
            <div><Progress value={pct} size="xs" /></div>
            </DrawerBody>
          </DrawerContent>
        {/* </DrawerOverlay> */}
      </Drawer>
    </Fragment>
  );
};
