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
