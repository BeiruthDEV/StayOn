import { createContext, useCallback, useContext, useMemo } from 'react';

import {
  addTask,
  createTask,
  editTask,
  removeTask,
  setTaskDone,
  toggleTaskDone,
  type Task,
} from '@/domain/task';
import { storageKeys, usePersistentState } from '@/storage';

type TasksContextValue = {
  tasks: readonly Task[];
  toggleTask: (id: string) => void;
  /** Restaura um estado de conclusão anterior (ação de desfazer). */
  restoreTask: (id: string, done: boolean) => void;
  /** Cria uma tarefa e devolve a que foi criada. */
  add: (title: string, tag: string) => Task;
  edit: (id: string, title: string, tag: string) => void;
  remove: (id: string) => void;
  /** Recoloca uma tarefa removida na lista (ação de desfazer). */
  restoreRemoved: (task: Task) => void;
  replaceAll: (tasks: readonly Task[]) => void;
};

const TasksContext = createContext<TasksContextValue | null>(null);

/** A lista começa vazia: só entra o que a pessoa criar. */
const NO_TASKS: readonly Task[] = [];

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const { value: tasks, setValue } = usePersistentState<readonly Task[]>(
    storageKeys.tasks,
    NO_TASKS,
  );

  const toggleTask = useCallback(
    (id: string) => setValue((current) => toggleTaskDone(current, id)),
    [setValue],
  );

  const restoreTask = useCallback(
    (id: string, done: boolean) => setValue((current) => setTaskDone(current, id, done)),
    [setValue],
  );

  const add = useCallback(
    (title: string, tag: string) => {
      const task = createTask(title, tag);
      setValue((current) => addTask(current, task));
      return task;
    },
    [setValue],
  );

  const edit = useCallback(
    (id: string, title: string, tag: string) =>
      setValue((current) => editTask(current, id, title, tag)),
    [setValue],
  );

  const remove = useCallback(
    (id: string) => setValue((current) => removeTask(current, id)),
    [setValue],
  );

  const restoreRemoved = useCallback(
    (task: Task) => setValue((current) => addTask(current, task)),
    [setValue],
  );

  const replaceAll = useCallback(
    (next: readonly Task[]) => setValue(() => next),
    [setValue],
  );

  const value = useMemo(
    () => ({ tasks, toggleTask, restoreTask, add, edit, remove, restoreRemoved, replaceAll }),
    [tasks, toggleTask, restoreTask, add, edit, remove, restoreRemoved, replaceAll],
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks(): TasksContextValue {
  const context = useContext(TasksContext);
  if (context === null) {
    throw new Error('useTasks precisa estar dentro de TasksProvider.');
  }
  return context;
}
