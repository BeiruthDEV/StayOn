import type { Task } from '@/domain/task';

/** Prioridades do dia — mock idêntico ao `state.tasks` do protótipo. */
export const initialTasks: readonly Task[] = [
  { id: 'task-1', title: 'Aula em vídeo (System Design)', tag: 'Aprendizado', done: false },
  { id: 'task-2', title: 'Estudar documentação da API', tag: 'Dev', done: false },
  { id: 'task-3', title: 'Atualizar repositório do portfólio', tag: 'Carreira', done: false },
];
