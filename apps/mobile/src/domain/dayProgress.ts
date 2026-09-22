import type { Task } from './task';

/**
 * Itens do dia já concluídos antes da lista de prioridades (blocos da manhã).
 * O protótipo soma 2 ao numerador e ao denominador do progresso diário.
 */
const COMPLETED_BASELINE = 2;

export type DayProgress = {
  /** Percentual de 0 a 100. */
  percent: number;
  /** Rótulo "X de Y" exibido à direita da barra. */
  label: string;
  done: number;
  total: number;
};

/** Calcula o progresso do dia a partir das tarefas priorizadas. */
export function computeDayProgress(tasks: readonly Task[]): DayProgress {
  const done = tasks.filter((task) => task.done).length + COMPLETED_BASELINE;
  const total = tasks.length + COMPLETED_BASELINE;

  return {
    done,
    total,
    percent: total === 0 ? 0 : Math.round((100 * done) / total),
    label: `${done} de ${total}`,
  };
}
