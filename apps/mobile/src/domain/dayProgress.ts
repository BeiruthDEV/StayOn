import type { Habit } from './habit';
import type { Task } from './task';

export type DayProgress = {
  /** Percentual de 0 a 100. */
  percent: number;
  /** Rótulo "X de Y" exibido à direita da barra. */
  label: string;
  done: number;
  total: number;
};

/**
 * Progresso do dia a partir do que a pessoa realmente marcou:
 * tarefas concluídas mais hábitos ativos cumpridos, sobre o total de itens.
 */
export function computeDayProgress(
  tasks: readonly Task[],
  habits: readonly Habit[],
): DayProgress {
  const activeHabits = habits.filter((habit) => !habit.paused);

  const done =
    tasks.filter((task) => task.done).length + activeHabits.filter((habit) => habit.done).length;
  const total = tasks.length + activeHabits.length;

  return {
    done,
    total,
    percent: total === 0 ? 0 : Math.round((100 * done) / total),
    label: `${done} de ${total}`,
  };
}
