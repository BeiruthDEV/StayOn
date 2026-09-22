import { createId } from './id';

/** Tarefa priorizada do dia. */
export type Task = {
  id: string;
  title: string;
  /** Área a que a tarefa pertence — exibida à direita da linha. */
  tag: string;
  done: boolean;
};

/** Alterna a conclusão de uma tarefa, devolvendo uma nova lista. */
export function toggleTaskDone(tasks: readonly Task[], id: string): Task[] {
  return tasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task));
}

/** Define explicitamente a conclusão de uma tarefa (usado ao desfazer). */
export function setTaskDone(tasks: readonly Task[], id: string, done: boolean): Task[] {
  return tasks.map((task) => (task.id === id ? { ...task, done } : task));
}

/** Cria uma tarefa a partir do que foi digitado. */
export function createTask(title: string, tag: string): Task {
  return { id: createId('task'), title: title.trim(), tag: tag.trim(), done: false };
}

/** Acrescenta uma tarefa ao fim da lista. */
export function addTask(tasks: readonly Task[], task: Task): Task[] {
  return [...tasks, task];
}

/** Remove uma tarefa. */
export function removeTask(tasks: readonly Task[], id: string): Task[] {
  return tasks.filter((task) => task.id !== id);
}

/** Altera o título e a área de uma tarefa existente. */
export function editTask(
  tasks: readonly Task[],
  id: string,
  title: string,
  tag: string,
): Task[] {
  return tasks.map((task) =>
    task.id === id ? { ...task, title: title.trim(), tag: tag.trim() } : task,
  );
}

/** Tarefas ainda em aberto, na ordem em que foram criadas. */
export function pendingTasks(tasks: readonly Task[]): Task[] {
  return tasks.filter((task) => !task.done);
}
