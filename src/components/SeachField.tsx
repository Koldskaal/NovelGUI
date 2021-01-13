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
  Grid, Slide, Box
} from "@chakra-ui/react";
import { PythonShell } from "python-shell";
import React, { Fragment, useEffect, useState } from "react";
import { NovelResult} from "./ResultBox"

import { searchPython, PythonTask } from "./PythonCommands";

type SearchProp = {
  onDataChange: (results: NovelResult[]) => void;
  onSearchEnd: () => void;
}

export const SearchField = ({onDataChange, onSearchEnd}: SearchProp) => {
  const [value, setValue] = useState("");
  const [task, setTask] = useState<PythonTask>();
  const handleChange = (event: any) => setValue(event.target.value);

  const handleClick = () => {
    setProgress(0)
    const task = searchPython(value);
    task.subscribeToMessage((message:any) => {
      if (message.status != "ONGOING") {
        onClose();
        return;
      }
      onOpen();
      setMax(message.max);
      setProgress(message.current);
      setPct((message.current / message.max) * 100);
      if (message.novels) {
        setData(message.novels);
      }
      task.send({ confirmed: 1 });
    })

    task.subscribeToEnd(onSearchEnd);
    
    setTask(task);
  };

  const handleCancel = () => {
    onClose();
    task.cancel();
    onSearchEnd();
  };

  const formSubmit = (event: any) => {
    handleClick();
    event.preventDefault();
  };

  const [data, setData] = useState([]);
  const [pct, setPct] = useState(0);
  const [progress, setProgress] = useState(0);
  const [max, setMax] = useState(0);

  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    onDataChange(data as NovelResult[]);
  }, [data, onDataChange]);


  return (
    <Fragment>
        <form onSubmit={formSubmit} className={"searchBar"}>
          <HStack spacing="10px" paddingTop="20px" paddingBottom="20px" minWidth="100%">
            <Input placeholder="Basic usage" onChange={handleChange} />
            <Button onClick={handleClick} colorScheme="green">Search</Button>
          </HStack>
        </form>
        <Slide direction="bottom" in={isOpen}>
          <Box p="40px" bg="teal.500" color="white"
          mt="1"
          rounded="md"
          shadow="md">
        <Button onClick={handleCancel} >close</Button>
        <div><Progress value={pct} size="xs" /></div>
        </Box>
        </Slide>
{/* 
        <Drawer placement="bottom" onClose={onClose} isOpen={isOpen} closeOnOverlayClick={false} blockScrollOnMount={false} scrollBehavior="outside">
          <DrawerContent>
            <DrawerHeader borderBottomWidth="1px">Searching sites: {progress}/{max}</DrawerHeader>
            
            <DrawerBody>
            <div><Progress value={pct} size="xs" /></div>
            </DrawerBody>
          </DrawerContent>
      </Drawer> */}
    </Fragment>
  );
};
