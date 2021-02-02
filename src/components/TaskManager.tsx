import { RepeatIcon, MinusIcon, DeleteIcon } from "@chakra-ui/icons";
import {
  Box,
  Progress,
  Fade,
  Flex,
  IconButton,
  useDisclosure,
  CloseButton,
  HStack,
  VStack,
  Text,
  Center,
  Spacer,
  Tag,
  TagLabel,
} from "@chakra-ui/react";
import React, { Fragment, useEffect, useState } from "react";
import { Message, PythonTask, taskManager } from "./PythonCommands";

type TaskProp = {
  task: PythonTask;
  task_detail: string,
  progress: number;
  onCancelButton: () => void;
};

const TaskManager = (props: { hidden?: boolean }) => {
  const [hide, setHide] = useState(true);
  const [reversed, setReverse] = useState(false);
  const [taskList, setTaskList] = useState([] as TaskProp[]);
  const [started, setStarted] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setTaskList((oldList) => oldList.sort((a, b) => a.task.getQueuePosition() - b.task.getQueuePosition()))
  },[taskList])

  useEffect(() => {
    if (reversed) {
      setHide(!props.hidden);
    } else {
      setHide(props.hidden);
    }
  }, [props.hidden, reversed]);

  const CancelTask = (task: PythonTask) => {
    task.cancel();
    setTaskList((oldList) => oldList.filter((t) => t.task.getID() != task.getID()));
  };

  useEffect(() => {
    const addTask = (task: PythonTask) => {
      const taskProp = {
        task: task,
        task_detail: "",
        progress: 0,
        onCancelButton: () => CancelTask(task)
      };
      setTaskList((oldList) => [...oldList, taskProp]);
      console.log(taskList.length)

      return taskProp;
    };

    const removeTask = (task: PythonTask) => {
      setTaskList((oldList) => oldList.filter((t) => t.task.getID() != task.getID()));
    };

    const onAnyTaskStart = (task: PythonTask) => {
      const prop = addTask(task);
      task.subscribeToEnd(() => {
        // prop.progress=100; 
        setTaskList((oldList) => [...oldList]); 
        setTimeout(() => removeTask(task), 200)
      });
      task.subscribeToMessage((message: Message) => {
        prop.progress = message.task.progress;
        prop.task_detail = message.task.details;
        setDirty(true);       
      });
    };

    

    if (!started) {
      console.log("LOCKED AND LOADED!");
      taskManager.subscribeToAnyTaskStart(onAnyTaskStart);
      setStarted(true);
    }

    if (dirty) {setDirty(false);}
  }, [started, taskList, dirty]);

  const clearAllTasks = () => {
    for (let i = taskList.length - 1; i >= 0; i--) {
      CancelTask(taskList[i].task);
    }
  }

  return (
    <VStack
      pos="absolute"
      bottom="30px"
      right="30px"
      // rounded="md"
      backgroundColor="blue.600"
      width="300px"
      overflow="hidden"
      spacing={0}
      cursor="default"
      hidden={hide}
    >
      <Flex
        pos="relative"
        top="0"
        w="100%"
        backgroundColor="blue.700"
        p="5px"
        textAlign="center"
        borderBottom="0.5px solid"
        borderColor="gray.700"
      >
        <Center>
          <Text paddingLeft="5px" fontSize="xs">
            {taskList.length} tasks left
          </Text>
        </Center>
        <Spacer />
        <IconButton
          bg="none"
          aria-label="Clear all"
          icon={<DeleteIcon />}
          size="xs"
          onClick={clearAllTasks}
        />
        <IconButton
          bg="none"
          aria-label="Minimize"
          icon={<MinusIcon />}
          size="xs"
          onClick={() => {
            setHide(true);
            setReverse(!reversed);
          }}
        />
      </Flex>
      <VStack
        paddingBottom="10px"
        spacing={0}
        w="100%"
        height="200px"
        overflowY="scroll"
      >
        {taskList.map((taskProp: TaskProp, index: number) => (
          <Task
            key={index}
            task={taskProp.task}
            task_detail = {taskProp.task_detail}
            progress={taskProp.progress}
            onCancelButton={taskProp.onCancelButton}
          />
        ))}
      </VStack>
    </VStack>
  );
};

const Task = ({ task_detail, progress, onCancelButton }: TaskProp) => {
  const [showCloseBtn, setShowCloseBtn] = useState(false);

  return (
    <Box
      height="30px"
      w="100%"
      onMouseEnter={() => setShowCloseBtn(true)}
      onMouseLeave={() => setShowCloseBtn(false)}
      spacing={0}
      borderBottom="0.5px solid"
      borderColor="gray.700"
    >
      <Box pos="relative" w="100%" h="100%">
        <Box
          pos="absolute"
          width="100%"
          h="100%"
          bg="#2d3748a6"
          left="0"
          zIndex="1"
          hidden={showCloseBtn ? false : true}
        >
          <Center h="100%">
            <Text isTruncated h="20px" maxW="180px" left="0px" fontSize="xs">
              {task_detail ? task_detail : "Waiting..."}
            </Text>
          </Center>
        </Box>
      </Box>

      <HStack w="100%" pos="relative">
        <Center position="absolute" top="-26px" left="5px" w="50px" zIndex="2">
          <Tag colorScheme={progress > 0 ? "green" : "red"} variant="solid">
            <TagLabel >{progress.toFixed(0)}%</TagLabel>
          </Tag>
        </Center>
        <Center>
          <Progress
            value={progress}
            position="absolute"
            size="xs"
            w="75%"
            left="60px"
            top="-15px"
          />
        </Center>
      </HStack>

      <Box pos="relative" w="100%" zIndex="2">
        <Fade in={showCloseBtn}>
          <Box pos="absolute" h="100%" right="5px" top="-27px">
            {/* <Circle bg="tomato" color="white"> */}
            <CloseButton size="sm" onClick={onCancelButton} />
            {/* </Circle> */}
          </Box>
        </Fade>
      </Box>
    </Box>
  );
};

const BottomIconBar = () => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Fragment>
      <Flex
        height="30px"
        pos="fixed"
        bottom="0"
        w="100%"
        bg="blue.600"
        boxShadow="inner"
        paddingLeft="10px"
        paddingRight="10px"
      >
        <Fade in={isOpen}></Fade>
        <Spacer />
        <Box pos="relative">
          <TaskManager hidden={isOpen} />
          <IconButton
            aria-label="Show queued tasks"
            icon={<RepeatIcon />}
            onClick={onToggle}
            size="xs"
          />
        </Box>
      </Flex>
    </Fragment>
  );
};

export { TaskManager, BottomIconBar };
