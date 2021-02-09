import { MinusIcon, DeleteIcon } from "@chakra-ui/icons";
import {
  Box,
  Progress,
  Fade,
  Flex,
  IconButton,
  CloseButton,
  HStack,
  VStack,
  Text,
  Center,
  Spacer,
  Tag,
  TagLabel,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import React, { useCallback, useEffect, useState } from "react";
import { Message, PythonTask, taskManager, TaskStatus } from "../PythonCommands";

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
  
  const toast = useToast();

  useEffect(() => {
    setTaskList((oldList) => oldList.sort((a, b) => a.task.getQueuePosition() - b.task.getQueuePosition()))
  },[taskList])

  useEffect(() => {
    console.log(taskList);
  },[taskList])

  useEffect(() => {
    if (reversed) {
      setHide(!props.hidden);
    } else {
      setHide(props.hidden);
    }
  }, [props.hidden, reversed]);

  const CancelTask = useCallback((task: PythonTask, showToast: boolean) => {
    task.cancel();
    setTaskList((oldList) => oldList.filter((t) => t.task.getID() != task.getID()));

    if (showToast) {
      toast({
        title: `Task: ${task.getCommand()} cancelled`,
        status: "error",
        duration: 2000,
        isClosable: true
      })
    }
  },[toast])

  useEffect(() => {
    const addTask = (task: PythonTask) => {
      const taskProp = {
        task: task,
        task_detail: "",
        progress: 0,
        onCancelButton: () => CancelTask(task, true)
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
        if (message.status !== "OK") return;
        prop.progress = message.task.progress;
        prop.task_detail = message.task.details;
        setDirty(true);       
      });
      task.subscribeToBeginTask(() => {
        prop.progress = 0.1;
        prop.task_detail = "Starting up"
        setTaskList((oldList) => oldList.sort((a, b) => a.task.getQueuePosition() - b.task.getQueuePosition()));
      })
    };

    

    if (!started) {
      console.log("LOCKED AND LOADED!");
      taskManager.subscribeToAnyTaskStart(onAnyTaskStart);
      setStarted(true);
    }

    if (dirty) {setDirty(false);}
  }, [started, taskList, dirty, CancelTask]);

  const clearAllTasks = () => {
    for (let i = taskList.length - 1; i >= 0; i--) {
      CancelTask(taskList[i].task, false);
    }

    if (taskList.length === 0) return; 
    toast({
      title: "Canceling all tasks",
      description: "Clearing both the queue and all active tasks!",
      status: "info",
      duration: 2000,
      isClosable: true,
    })
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

const Task = ({task, task_detail, progress, onCancelButton }: TaskProp) => {
  const [showCloseBtn, setShowCloseBtn] = useState(false);

  const generateLabel = () => {
    if (progress > 0) return progress.toFixed(0).toString() + "%"
    return <Spinner size="sm" />
  }

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
          <Tag variant="outline" width="100%" justifyContent="center">
            <TagLabel  >{generateLabel()}</TagLabel>
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

export { TaskManager };
