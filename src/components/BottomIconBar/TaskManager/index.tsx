import React, { useCallback, useEffect, useState } from "react";
import { MinusIcon, DeleteIcon } from "@chakra-ui/icons";
import {
  Flex,
  IconButton,
  VStack,
  Text,
  Center,
  Spacer,
  useToast,
} from "@chakra-ui/react";

import {
  Message,
  PythonTask,
  taskManager,
} from "../../PythonCommands";
import { LoginPrompt } from "../LoginPrompt";
import { Task } from "./Task";

type TaskProp = {
  task: PythonTask;
  task_detail: string;
  progress: number;
  onCancelButton: () => void;
};

const TaskManager = (props: { isOpen: boolean, onClose: () => void }) => {
  const [taskList, setTaskList] = useState([] as TaskProp[]);
  const [started, setStarted] = useState(false);
  const [dirty, setDirty] = useState(false);

  const toast = useToast();

  useEffect(() => {
    setTaskList((oldList) =>
      oldList.sort(
        (a, b) => a.task.getQueuePosition() - b.task.getQueuePosition()
      )
    );
  }, [taskList]);

  const CancelTask = useCallback(
    (task: PythonTask, showToast: boolean) => {
      task.cancel();
      setTaskList((oldList) =>
        oldList.filter((t) => t.task.getID() != task.getID())
      );

      if (showToast) {
        toast({
          title: `Task: ${task.getCommand()} cancelled`,
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      }
    },
    [toast]
  );

  useEffect(() => {
    const addTask = (task: PythonTask) => {
      const taskProp = {
        task: task,
        task_detail: "",
        progress: 0,
        onCancelButton: () => CancelTask(task, true),
      };
      setTaskList((oldList) => [...oldList, taskProp]);
      return taskProp;
    };

    const removeTask = (task: PythonTask) => {
      setTaskList((oldList) =>
        oldList.filter((t) => t.task.getID() != task.getID())
      );
    };

    const onAnyTaskStart = (task: PythonTask) => {
      const prop = addTask(task);
      task.subscribeToEnd(() => {
        // prop.progress=100;
        setTaskList((oldList) => [...oldList]);
        setTimeout(() => removeTask(task), 200);
      });
      task.subscribeToMessage((message: Message) => {
        if (message.status !== "OK") return;
        prop.progress = message.task.progress;
        prop.task_detail = message.task.details;
        setDirty(true);
      });
      task.subscribeToBeginTask(() => {
        prop.progress = 0.1;
        prop.task_detail = "Starting up";
        setTaskList((oldList) =>
          oldList.sort(
            (a, b) => a.task.getQueuePosition() - b.task.getQueuePosition()
          )
        );
      });
    };

    if (!started) {
      console.log("LOCKED AND LOADED!");
      taskManager.subscribeToAnyTaskStart(onAnyTaskStart);
      setStarted(true);
    }

    if (dirty) {
      setDirty(false);
    }
  }, [started, taskList, CancelTask, dirty]);

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
    });
  };

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
      hidden={!props.isOpen}
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
          onClick={props.onClose}
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
            task_detail={taskProp.task_detail}
            progress={taskProp.progress}
            onCancelButton={taskProp.onCancelButton}
          />
        ))}
      </VStack>
      <LoginPrompt />
    </VStack>
  );
};

export { TaskManager, TaskProp };
