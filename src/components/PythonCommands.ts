import { SelectFieldProps } from "@chakra-ui/react";
import { PythonShell, Options } from "python-shell";

interface Message {
  status: string;
  progress: number;
  payload: any;
}
class PythonTask {
  pyshell: PythonShell;

  private onEndSubscribers: { (): void }[] = [];
  private onMessageSubscribers: { (message: any): void }[] = [];

  private command: string;
  private queueKey: string;

  constructor(command: string, queueKey: string) {
    this.command = command;
    this.queueKey = queueKey;
    taskManager.addToQueue(this.queueKey, this);
  }

  beginTask(): void {
    const options: Options = {
      mode: "json",
      args: [this.command],
    };

    const handleMessage = function (message: any) {
      this.onMessageSubscribers.map((listener: (m: any) => void) => {
        listener(message);
      });
    }.bind(this);

    const handleEnd = function () {
      this.onEndSubscribers.map((listener: () => void) => {
        listener();
      });
    }.bind(this);

    this.pyshell = new PythonShell("./tryout.py", options);
    this.pyshell.on("message", handleMessage);
    this.pyshell.on("close", handleEnd);
  }

  subscribeToMessage(listener: (message: any) => void): void {
    this.onMessageSubscribers.push(listener);
  }

  unsubscribeToMessage(listener: (message: any) => void): void {
    this.onMessageSubscribers = removeItem(this.onMessageSubscribers, listener);
  }

  subscribeToEnd(listener: () => void): void {
    this.onEndSubscribers.push(listener);
  }

  unsubscribeToEnd(listener: () => void): void {
    this.onEndSubscribers = removeItem(this.onEndSubscribers, listener);
  }

  send(message: any): void {
    if (typeof this.pyshell === "undefined") return;
    this.pyshell.send(message);
  }

  cancel(): void {
    taskManager.removeFromQueue(this.queueKey, this);

    if (typeof this.pyshell === "undefined") return;
    this.pyshell.kill();
  }
}

function removeItem(arr: any[], value: any) {
  const index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

class TaskManager {
  allQueues: { [id: string]: PythonTask[] } = {};
  subscribers: { (task: PythonTask): void }[] = []

  addToQueue(queueId: string, task: PythonTask) {
    if (!this.allQueues[queueId]) {
      this.allQueues[queueId] = [] as PythonTask[];
    }

    this.allQueues[queueId].push(task);
  }

  removeFromQueue(queueId: string, task: PythonTask) {
    if (!this.allQueues[queueId]) return;

    this.allQueues[queueId] = removeItem(this.allQueues[queueId], task);
  }

  subscribeToAnyTaskStart(listener: (task: PythonTask) => void) {
    this.subscribers.push(listener)
  }

  unsubscribeToAnyTaskStart(listener: (task: PythonTask) => void) {
    this.subscribers = removeItem(this.subscribers, listener);
  }
}

const taskManager = new TaskManager();

function searchPython(query: string): PythonTask {
  const pp = {
    command: "search",
    data: {
      query: query,
    },
  };
  const options: Options = {
    mode: "json",
    args: [JSON.stringify(pp)],
  };
  const task = new PythonTask(JSON.stringify(pp), "search");
  task.beginTask();
  return task;
}

export { searchPython, PythonTask };
