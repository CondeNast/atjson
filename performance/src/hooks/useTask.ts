import { Reducer, useReducer, useDebugValue } from "react";

export type ParameterType<T extends (...args: any[]) => any> = T extends (
  ...args: infer R
) => any
  ? R
  : undefined;

type TaskRunner = (...args: any[]) => IterableIterator<any>;

const startTask = (task: TaskRunner, ...params: ParameterType<TaskRunner>) => {
  return {
    action: "START_TASK",
    task,
    params
  } as const;
};

const startWork = () => {
  return {
    action: "START_WORK"
  } as const;
};

const continueWork = (task: Task, value: any) => {
  return {
    action: "CONTINUE_WORK",
    task,
    value
  } as const;
};

const cancelTasks = (tasks: Task[]) => {
  return {
    action: "CANCEL_TASKS",
    tasks
  } as const;
};

const trackWork = (tasks: Task[]) => {
  return {
    action: "TRACK_WORK",
    tasks
  } as const;
};

type Actions = ReturnType<
  | typeof startTask
  | typeof startWork
  | typeof continueWork
  | typeof cancelTasks
  | typeof trackWork
>;

type TaskStatus =
  | "queued"
  | "ready"
  | "dropped"
  | "working"
  | "working*"
  | "finishing"
  | "finishing*"
  | "cancelled"
  | "finished";
interface Task {
  run: TaskRunner;
  params: ParameterType<TaskRunner>;
  status: TaskStatus;
  iterator?: ReturnType<TaskRunner>;
  promise?: Promise<any>;
  value?: any;
  error?: Error;
}

interface State {
  strategy: "restart" | "drop" | "queue";
  maxConcurrency: number;
  tasks: Task[];
  completed: Array<{ value?: any; error?: Error }>;
}

function compact(tasks: Task[]) {
  let minimalTasks: Task[] = [];
  for (let i = 0, len = tasks.length; i < len; i++) {
    let task = tasks[i];
    if (
      task.status !== "dropped" &&
      task.status !== "cancelled" &&
      task.status !== "finished"
    ) {
      minimalTasks.push(task);
    } else if (i === len - 1) {
      minimalTasks.push(task);
    }
  }
  return minimalTasks;
}

const reducer: Reducer<State, Actions> = (state, action) => {
  let runningTasks = state.tasks.filter(isRunning);

  switch (action.action) {
    case "START_TASK": {
      if (runningTasks.length === state.maxConcurrency) {
        switch (state.strategy) {
          case "restart": {
            let tasks = state.tasks.map(task => {
              if (task === runningTasks[0]) {
                if (
                  task.status !== "ready" &&
                  task.iterator &&
                  task.iterator.return
                ) {
                  task.iterator.return();
                }
                return {
                  ...task,
                  status: "cancelled" as TaskStatus
                };
              }
              return task;
            });
            return {
              strategy: state.strategy,
              maxConcurrency: state.maxConcurrency,
              tasks: compact([
                ...tasks,
                {
                  run: action.task,
                  params: action.params,
                  status: "ready" as TaskStatus
                }
              ]),
              completed: state.completed
            };
          }
          case "drop": {
            return {
              strategy: state.strategy,
              maxConcurrency: state.maxConcurrency,
              tasks: [
                ...state.tasks,
                {
                  run: action.task,
                  params: action.params,
                  status: "dropped" as TaskStatus
                }
              ],
              completed: state.completed
            };
          }
          case "queue": {
            return {
              strategy: state.strategy,
              maxConcurrency: state.maxConcurrency,
              tasks: [
                ...state.tasks,
                {
                  run: action.task,
                  params: action.params,
                  status: "queued" as TaskStatus
                }
              ],
              completed: state.completed
            };
          }
        }
      }
      // We can start running the task
      return {
        strategy: state.strategy,
        maxConcurrency: state.maxConcurrency,
        tasks: [
          ...state.tasks,
          {
            run: action.task,
            params: action.params,
            status: "ready" as TaskStatus
          }
        ],
        completed: state.completed
      };
    }
    case "START_WORK": {
      let readySlots =
        state.strategy === "queue"
          ? state.maxConcurrency - runningTasks.length
          : Infinity;
      let tasks = compact(state.tasks).map(task => {
        let { status, iterator, value, ...rest } = task;
        if (task.status === "ready") {
          let iterator = task.run(...rest.params);
          let next = iterator.next();
          return {
            ...rest,
            status: (next.done ? "finishing" : "working") as TaskStatus,
            promise: Promise.resolve(next.value),
            iterator
          };
        } else if (task.status === "queued" && readySlots > 0) {
          readySlots -= 1;
          let iterator = task.run(...rest.params);
          let next = iterator.next();
          return {
            ...rest,
            status: (next.done ? "finishing" : "working") as TaskStatus,
            promise: Promise.resolve(next.value),
            iterator
          };
        }
        return task;
      });

      return {
        strategy: state.strategy,
        maxConcurrency: state.maxConcurrency,
        tasks,
        completed: state.completed
      };
    }
    case "CONTINUE_WORK": {
      let completed = [...state.completed];
      let tasks = compact(state.tasks).map(task => {
        if (task.iterator === action.task.iterator) {
          // The only valid state is from working*
          if (task.status === "working*" && task.iterator) {
            let { promise, ...rest } = task;
            let next = task.iterator.next(action.value);
            return {
              ...rest,
              status: (next.done ? "finishing" : "working") as TaskStatus,
              promise: Promise.resolve(next.value)
            };
          } else if (task.status === "finishing*") {
            completed.push({
              value: action.value
            });
            return {
              ...task,
              value: action.value,
              status: "finished" as TaskStatus
            };
          }
        }
        return task;
      });

      return {
        strategy: state.strategy,
        maxConcurrency: state.maxConcurrency,
        tasks,
        completed
      };
    }
    case "CANCEL_TASKS": {
      let tasks = compact(state.tasks).map(task => {
        if (action.tasks.indexOf(task) !== -1) {
          if (task.status === "ready" || task.status === "queued") {
            return {
              ...task,
              status: "dropped" as TaskStatus
            };
          } else if (
            task.status === "working*" ||
            task.status === "finishing*"
          ) {
            if (task.iterator && task.iterator.return) {
              task.iterator.return();
            }
            return {
              ...task,
              status: "cancelled" as TaskStatus
            };
          }
        }
        return task;
      });

      return {
        strategy: state.strategy,
        maxConcurrency: state.maxConcurrency,
        tasks,
        completed: state.completed
      };
    }
    case "TRACK_WORK": {
      let tasks = compact(state.tasks).map(task => {
        if (action.tasks.indexOf(task) !== -1) {
          let status = task.status;
          if (status === "finishing") {
            status = "finishing*";
          } else if (status === "working") {
            status = "working*";
          }
          return {
            ...task,
            status: status as TaskStatus
          };
        }
        return task;
      });

      return {
        strategy: state.strategy,
        maxConcurrency: state.maxConcurrency,
        tasks,
        completed: state.completed
      };
    }
  }
  return state;
};

function isRunning(task: Task) {
  return (
    task.status === "ready" ||
    task.status === "working" ||
    task.status === "working*" ||
    task.status === "finishing" ||
    task.status === "finishing*"
  );
}

interface TaskAPI {
  status: "queued" | "dropped" | "running" | "cancelled" | "finished";
  value?: any;
  error?: Error;
  cancel(): void;
}

export function useTask<T extends TaskRunner>(
  task: T,
  options?: {
    strategy: "restart" | "drop" | "queue";
    maxConcurrency?: number;
  }
): [
  {
    isRunning: boolean;
    last: TaskAPI | null;
    completed: Array<{ value?: any; error?: Error }>;
  },
  (...args: ParameterType<T>) => void
] {
  let maxConcurrency = Infinity;
  if (options) {
    maxConcurrency = options.maxConcurrency || 1;
  }

  let [state, dispatch] = useReducer(reducer, {
    strategy: options ? options.strategy : "restart",
    maxConcurrency,
    tasks: [],
    completed: []
  });

  // Find all working tasks and schedule more work to be done!
  let tracked: Task[] = [];
  state.tasks
    .filter(task => ["working", "finishing"].indexOf(task.status) !== -1)
    .forEach(task => {
      if (task.promise) {
        tracked.push(task);
        task.promise.then(result => {
          dispatch(continueWork(task, result));
        });
      }
    });

  if (tracked.length > 0) {
    dispatch(trackWork(tracked));
  }

  let runningTasks = state.tasks.filter(isRunning);
  let areAnyReady = state.tasks.some(task => task.status === "ready");
  let areAnyQueued = state.tasks.some(task => task.status === "queued");
  let areAnyRunning = runningTasks.length > 0;

  // Do any work that's necessary
  if (areAnyReady || (areAnyQueued && runningTasks.length < maxConcurrency)) {
    dispatch(startWork());
  }

  useDebugValue(areAnyRunning ? "Running" : "Idle");

  const run = (...args: ParameterType<typeof task>) => {
    dispatch(startTask(task, ...args));
  };

  let lastTask = state.tasks[state.tasks.length - 1];
  let last = lastTask
    ? ({
        status: isRunning(lastTask) ? "running" : lastTask.status,
        value: lastTask.value,
        error: lastTask.error,
        cancel() {
          dispatch(cancelTasks([lastTask]));
        }
      } as TaskAPI)
    : null;

  return [
    {
      isRunning: areAnyRunning,
      last,
      completed: state.completed
    },
    run
  ];
}
