import {
  HStack,
  useToast,
  useDisclosure,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Input,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { Message, PythonTask, taskManager } from "../PythonCommands";

export const LoginPrompt = () => {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [started, setStarted] = useState(false);

  const toast = useToast();

  const [currTask, setCurrTask] = useState({} as PythonTask);
  const [laterTaskLogins, setLaterTaskLogins] = useState([] as PythonTask[]);
  const [isRunning, setIsRunning] = useState(false);

  const [currHostname, setHostname] = useState("");

  useEffect(() => {
    const isEmpty = (task: PythonTask) => {
      for (const i in task) {
        return false;
      }
      return true;
    };

    setCurrTask((task) => {
      if (isEmpty(task)) return task;

      if (typeof task.getFullCommand().data !== "undefined") {
        if (currTask.getFullCommand().data.url) {
          const url = new URL(currTask.getFullCommand().data.url);
          setHostname(url.hostname);
        }
      }

      return task;
    });
  }, [currTask]);

  useEffect(() => {
    const run = function (message: Message, task: PythonTask) {
      if (message.status !== "LOGIN") return;

      setIsRunning((val) => {
        if (val) {
          setLaterTaskLogins((oldList) => [...oldList, task]);
          onOpen();
          return val;
        } else {
          setCurrTask(task);
          onOpen();
          return true;
        }
      });
    };

    const onAnyTaskStart = function (task: PythonTask) {
      task.subscribeToMessage((message: Message) => run(message, task));
    };

    if (!started) {
      taskManager.subscribeToAnyTaskStart(onAnyTaskStart);
      setStarted(true);
    }
  }, [started, onOpen, isOpen, isRunning]);

  const login = () => {
    if (username.length === 0 || password.length === 0) {
      toast({
        title: `Login failed`,
        description: "Please fill out both fields.",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    currTask.send({ username: username, password: password });
    close();
  };

  const close = () => {
    onClose();

    if (laterTaskLogins.length > 0) {
      const task = laterTaskLogins[0];
      setCurrTask(task);
      setLaterTaskLogins((oldList) =>
        oldList.filter((t) => t.getID() != task.getID())
      );

      setTimeout(onOpen, 200);
    }
  };

  return (
    <Modal
      onClose={close}
      isOpen={isOpen}
      isCentered
      closeOnOverlayClick={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Login to {currHostname} ?</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Input
            pr="4.5rem"
            placeholder="Enter usename"
            onChange={(event) => {
              setUsername(event.target.value);
            }}
          />
          <InputGroup size="md">
            <Input
              pr="4.5rem"
              type={show ? "text" : "password"}
              placeholder="Enter password"
              onChange={(event) => {
                setPassword(event.target.value);
              }}
            />
            <InputRightElement width="4.5rem">
              <Button h="1.75rem" size="sm" onClick={handleClick}>
                {show ? "Hide" : "Show"}
              </Button>
            </InputRightElement>
          </InputGroup>
        </ModalBody>
        <ModalFooter>
          <HStack spacing={4}>
            <Button onClick={login}>Login</Button>
            <Button onClick={close}>Cancel</Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
