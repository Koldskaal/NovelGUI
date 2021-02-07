import { PythonShell, Options } from "python-shell";
import { v4 as uuidv4 } from "uuid";
import { DownloadOptions } from "./ResultBox/DownloadOptionsGrid";

const pythonfile = "./novel_commands.py";

export interface Task {
  name: string;
  progress: number;
  details: string;
}

export interface Message {
  status: string;
  task: Task;
  data: { [key: string]: any };
}

export enum TaskStatus {
  OK,
  CANCEL,
  ERROR
}

class PythonTask {
  pyshell: PythonShell;

  private onEndSubscribers: { (): void }[] = [];
  private onMessageSubscribers: { (message: Message): void }[] = [];

  private command: string;
  private queueKey: string;
  private uid: string;

  private position: number;
  status: TaskStatus;

  constructor(command: string, queueKey: string) {
    this.command = command;
    this.queueKey = queueKey;
    taskManager.addToQueue(this.queueKey, this);

    this.uid = uuidv4();
  }

  getQueuePosition(): number {
    return this.position;
  }

  setQueuePosition(position: number): void {
    this.position = position;
  }

  getID(): string {
    return this.uid;
  }

  getCommand(): string {
    return JSON.parse(this.command).command;
  }

  getFullCommand(): JSON {
    return JSON.parse(this.command);
  }

  beginTask(): void {
    const options: Options = {
      mode: "json",
      args: [this.command],
    };

    const handleMessage = function (message: any) {
      this.onMessageSubscribers.map((listener: (m: Message) => void) => {
        listener(message as Message);
      });
    }.bind(this);

    const handleEnd = function () {
      this.onEndSubscribers.map((listener: () => void) => {
        listener();
      });
    }.bind(this);

    const handleError = function () {
      this.status = TaskStatus.ERROR
    }.bind(this)

    this.status = TaskStatus.OK;

    this.pyshell = new PythonShell(pythonfile, options);
    this.pyshell.on("message", handleMessage);
    this.pyshell.on("error", handleError);
    this.pyshell.on("close", handleEnd);
  }

  subscribeToMessage(listener: (message: Message) => void): void {
    this.onMessageSubscribers.push(listener);
  }

  unsubscribeToMessage(listener: (message: Message) => void): void {
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
    this.status = TaskStatus.CANCEL;
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

const maxRunning = 3;

class TaskManager {
  allQueues: { [id: string]: PythonTask[] } = {};
  subscribers: { (task: PythonTask): void }[] = [];

  runningQueue: { [id: string]: PythonTask[] } = {};

  currentQueue: number;

  addToQueue(queueId: string, task: PythonTask) {
    if (!this.allQueues[queueId]) {
      this.allQueues[queueId] = [] as PythonTask[];
      this.runningQueue[queueId] = [] as PythonTask[];
    }

    this.allQueues[queueId].push(task);
    task.setQueuePosition(this.allQueues[queueId].length);
    this.startNextInQueue();
    this.noticeSubscribers(task);
  }

  removeFromQueue(queueId: string, task: PythonTask) {
    if (!this.allQueues[queueId]) return;

    this.allQueues[queueId] = removeItem(this.allQueues[queueId], task);
  }

  subscribeToAnyTaskStart(listener: (task: PythonTask) => void) {
    this.subscribers.push(listener);
  }

  unsubscribeToAnyTaskStart(listener: (task: PythonTask) => void) {
    this.subscribers = removeItem(this.subscribers, listener);
  }

  startNextInQueue() {
    for (const id in this.allQueues) {
      if (this.runningQueue[id].length >= maxRunning) continue;
      if (this.allQueues[id].length > 0) {
        const task = this.allQueues[id].shift();
        task.beginTask();
        this.runningQueue[id].push(task);

        task.subscribeToEnd(() => {
          this.runningQueue[id] = this.removeItem(
            this.runningQueue[id],
            task
          ).sort((a, b) => a.getQueuePosition() - b.getQueuePosition());
          this.startNextInQueue();
        });
      }

      for (let i = 0; i < this.allQueues[id].length; i++) {
        this.allQueues[id][i].setQueuePosition(i);
      }
    }
  }

  clearQueue(queueId: string, cancelRunning = false) {
    if (!this.allQueues[queueId]) {
      return;
    }
    this.allQueues[queueId] = [] as PythonTask[];

    if (cancelRunning) {
      this.runningQueue[queueId].forEach((task) => task.cancel());
    }
  }

  private noticeSubscribers(task: PythonTask) {
    this.subscribers.map((listener) => {
      listener(task);
    });
  }

  private removeItem(arr: PythonTask[], value: PythonTask) {
    const index = arr.indexOf(value);
    if (index > -1) {
      arr.splice(index, 1);
    }
    return arr;
  }
}

const taskManager = new TaskManager();

function searchPython(query: string): PythonTask {
  const command = {
    command: "search",
    data: {
      query: query,
    },
  };

  const task = new PythonTask(JSON.stringify(command), "search");
  return task;
}

function getInfoPython(url: string): PythonTask {
  const command = {
    command: "get_novel_info",
    data: {
      url: url,
    },
  };

  const task = new PythonTask(JSON.stringify(command), "get_novel_info");
  return task;
}

function downloadNovel(url: string, options: DownloadOptions): PythonTask {
  const command = {
    command: "download_novel",
    data: {
      url: url,
      options: options,
    },
  };

  const task = new PythonTask(JSON.stringify(command), "download_novel");
  return task;
}

export { downloadNovel, getInfoPython, searchPython, PythonTask, taskManager };
