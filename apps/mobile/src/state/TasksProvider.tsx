import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { initialTasks } from '@/data/tasks';
import { setTaskDone, toggleTaskDone, type Task } from '@/domain/task';

type TasksContextValue = {
  tasks: readonly Task[];
  toggleTask: (id: string) => void;
  /** Restaura um estado de conclusão anterior (ação de desfazer). */
  restoreTask: (id: string, done: boolean) => void;
};

const TasksContext = createContext<TasksContextValue | null>(null);

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<readonly Task[]>(initialTasks);

  const toggleTask = useCallback((id: string) => {
    setTasks((current) => toggleTaskDone(current, id));
  }, []);

  const restoreTask = useCallback((id: string, done: boolean) => {
    setTasks((current) => setTaskDone(current, id, done));
  }, []);

  const value = useMemo(
    () => ({ tasks, toggleTask, restoreTask }),
    [tasks, toggleTask, restoreTask],
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
