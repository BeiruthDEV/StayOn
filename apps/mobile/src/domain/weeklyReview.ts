import {
  focusByDay,
  focusByLabel,
  sessionsBetween,
  totalFocusSeconds,
  type FocusSessionRecord,
} from './session';
import { completedBlocks, type TimeBlock } from './timeBlock';

/** Texto livre que a pessoa escreve no fim da semana. */
export type Reflection = {
  worked: string;
  toChange: string;
};

export const emptyReflection: Reflection = { worked: '', toChange: '' };

/** Métricas da semana, todas derivadas do que foi registrado no aplicativo. */
export type WeeklyReview = {
  /** Segundos focados no período. */
  focusSeconds: number;
  /** Sessões encerradas no período. */
  sessionCount: number;
  /** Percentual de sessões levadas até o fim. */
  completionRate: number;
  /** Dia de maior foco, ex.: "qua". Vazio quando não houve sessão. */
  bestDayLabel: string;
  bestDaySeconds: number;
  /** Área ou tarefa que mais consumiu foco. Vazio sem sessões. */
  topArea: string;
  topAreaSeconds: number;
  /** Blocos da agenda já concluídos. */
  blocksDone: number;
  blocksTotal: number;
};

/** Meta semanal padrão de foco, em segundos (10 horas). */
export const WEEKLY_FOCUS_TARGET = 10 * 60 * 60;

/** Monta a revisão de um intervalo de datas a partir das sessões e da agenda. */
export function buildWeeklyReview(
  sessions: readonly FocusSessionRecord[],
  blocks: readonly TimeBlock[],
  dates: readonly string[],
): WeeklyReview {
  const from = dates[0] ?? '';
  const to = dates[dates.length - 1] ?? '';
  const weekSessions = sessionsBetween(sessions, from, to);

  const days = focusByDay(weekSessions, dates);
  const bestDay = days.reduce<(typeof days)[number] | undefined>(
    (best, day) => (best === undefined || day.seconds > best.seconds ? day : best),
    undefined,
  );

  const areas = focusByLabel(weekSessions);
  const topArea = areas[0];

  const completed = weekSessions.filter((session) => session.outcome === 'completed').length;

  return {
    focusSeconds: totalFocusSeconds(weekSessions),
    sessionCount: weekSessions.length,
    completionRate:
      weekSessions.length === 0 ? 0 : Math.round((100 * completed) / weekSessions.length),
    bestDayLabel: bestDay !== undefined && bestDay.seconds > 0 ? bestDay.label : '',
    bestDaySeconds: bestDay?.seconds ?? 0,
    topArea: topArea?.label ?? '',
    topAreaSeconds: topArea?.seconds ?? 0,
    blocksDone: completedBlocks(blocks).length,
    blocksTotal: blocks.length,
  };
}

/** Percentual da meta semanal de foco já cumprido, de 0 a 100. */
export function targetProgress(review: WeeklyReview): number {
  return Math.min(100, Math.round((100 * review.focusSeconds) / WEEKLY_FOCUS_TARGET));
}

/** Percentual de blocos da agenda concluídos. */
export function planningAccuracy(review: WeeklyReview): number {
  if (review.blocksTotal === 0) return 0;
  return Math.round((100 * review.blocksDone) / review.blocksTotal);
}

/** Sugestão de ajuste, escolhida pelo ponto mais fraco da semana. */
export function recommendation(review: WeeklyReview): string {
  if (review.sessionCount === 0) {
    return 'Nenhuma sessão nesta semana. Comece com um bloco curto amanhã — 25 minutos já contam.';
  }

  if (review.completionRate < 60) {
    return `Você abandonou mais de um terço das sessões. Experimente reduzir a duração padrão em Perfil e ver se a taxa sobe.`;
  }

  if (review.focusSeconds < WEEKLY_FOCUS_TARGET / 2) {
    return 'O volume ficou abaixo da metade da meta. Reserve blocos fixos na agenda em vez de decidir na hora.';
  }

  if (review.bestDayLabel !== '') {
    return `Seu melhor dia foi ${review.bestDayLabel}. Replique o horário desse dia nos demais para estabilizar o ritmo.`;
  }

  return 'Semana consistente. Mantenha os blocos onde estão.';
}
