import { PythonShell, Options } from "python-shell";
import { v4 as uuidv4 } from "uuid";
import { getFromStorage } from "./AppData";
import { DownloadOptions } from "./ResultBox/DownloadOptionsGrid";

const pythonfile = "./novel_commands.py";

export interface Command {
  command: string,
  data: { [key: string]: any }
}

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
  SUCCESS,
  CANCEL,
  ERROR,
  RUNNING,
  WAITING
}

class PythonTask {
  pyshell: PythonShell;

  private onEndSubscribers: { (): void }[] = [];
  private onMessageSubscribers: { (message: Message): void }[] = [];
  private onTaskBegin: { (): void }[] = [];
  
  private command: string;
  private queueKey: string;
  private uid: string;

  private isDone: boolean;

  private position: number;
  status: TaskStatus;

  constructor(command: string, queueKey: string) {
    this.command = command;
    this.queueKey = queueKey;
    taskManager.addToQueue(this.queueKey, this);
    this.status = TaskStatus.WAITING;

    this.uid = uuidv4();
    this.isDone = false;
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

  getFullCommand(): Command {
    return JSON.parse(this.command) as Command;
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
      this.isDone = true;
      if (this.status === TaskStatus.RUNNING)
        this.status = TaskStatus.SUCCESS;
      this.onEndSubscribers.map((listener: () => void) => {
        listener();
      });
    }.bind(this);

    const handleError = function () {
      this.status = TaskStatus.ERROR
    }.bind(this)

    this.status = TaskStatus.RUNNING;

    this.pyshell = new PythonShell(pythonfile, options);
    this.pyshell.on("message", handleMessage);
    this.pyshell.on("error", handleError);
    this.pyshell.on("close", handleEnd);

    this.position = -1;

    this.onTaskBegin.map((listener: () => void) => {
      listener();
    });
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

  subscribeToBeginTask(listener: () => void): void {
    this.onTaskBegin.push(listener);
  }

  unsubscribeToBeginTask(listener: () => void): void {
    this.onTaskBegin = removeItem(this.onTaskBegin, listener);
  }

  send(message: any): void {
    if (typeof this.pyshell === "undefined") return;
    if (this.isDone) return;

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

  queuePositions: { [id: string]: number } = {};

  addToQueue(queueId: string, task: PythonTask) {
    if (!this.allQueues[queueId]) {
      this.allQueues[queueId] = [] as PythonTask[];
      this.runningQueue[queueId] = [] as PythonTask[];
      this.queuePositions[queueId] = 1;
      
    }

    this.allQueues[queueId].push(task);
    task.setQueuePosition(this.queuePositions[queueId]);
    this.queuePositions[queueId] += 1;
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
        task.status = TaskStatus.WAITING;
        this.runningQueue[id].push(task);
        task.setQueuePosition(0);

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
  const defOpt = getFromStorage("defaultOptions");
  const data = {
    overridePath: options.folderPathOption.useCustomPath ? options.folderPathOption.path : "",
    rangeOption: options.rangeOption,
    outputFormats: options.outputFormats,
    openFolder: options.openFolder,
    basePath: defOpt.outputPath
  }

  const command = {
    command: "download_novel",
    data: {
      url: url,
      options: data,
    },
  };

  const task = new PythonTask(JSON.stringify(command), "download_novel");
  return task;
}

export { downloadNovel, getInfoPython, searchPython, PythonTask, taskManager };
