import { createId } from './id';

/** Como uma sessão de foco terminou. */
export type SessionOutcome = 'completed' | 'abandoned';

/** Registro de uma sessão de foco já encerrada. */
export type FocusSessionRecord = {
  id: string;
  /** Data da sessão no formato YYYY-MM-DD. */
  date: string;
  /** Tarefa ou bloco em que a pessoa trabalhou. */
  label: string;
  /** Tempo efetivamente focado, em segundos. */
  seconds: number;
  outcome: SessionOutcome;
};

/** Cria o registro de uma sessão encerrada. */
export function createSession(
  date: string,
  label: string,
  seconds: number,
  outcome: SessionOutcome,
): FocusSessionRecord {
  return { id: createId('session'), date, label, seconds: Math.max(0, Math.round(seconds)), outcome };
}

/** Sessões de um dia específico. */
export function sessionsOn(
  sessions: readonly FocusSessionRecord[],
  date: string,
): FocusSessionRecord[] {
  return sessions.filter((session) => session.date === date);
}

/** Sessões dentro de um intervalo de datas, inclusive nas pontas. */
export function sessionsBetween(
  sessions: readonly FocusSessionRecord[],
  from: string,
  to: string,
): FocusSessionRecord[] {
  return sessions.filter((session) => session.date >= from && session.date <= to);
}

/** Soma dos segundos focados. */
export function totalFocusSeconds(sessions: readonly FocusSessionRecord[]): number {
  return sessions.reduce((total, session) => total + session.seconds, 0);
}

/** Quantas sessões chegaram ao fim, sem abandono. */
export function completedCount(sessions: readonly FocusSessionRecord[]): number {
  return sessions.filter((session) => session.outcome === 'completed').length;
}

/**
 * Percentual de sessões levadas até o fim, de 0 a 100.
 * Sem sessões registradas, devolve 0.
 */
export function completionRate(sessions: readonly FocusSessionRecord[]): number {
  if (sessions.length === 0) return 0;
  return Math.round((100 * completedCount(sessions)) / sessions.length);
}

/** Uma barra do gráfico de foco por dia. */
export type DailyFocus = {
  /** Data no formato YYYY-MM-DD. */
  date: string;
  /** Rótulo curto do eixo, ex.: "seg". */
  label: string;
  seconds: number;
};

const WEEKDAY_ABBREVIATIONS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'] as const;

/** Segundos focados em cada uma das datas informadas, na mesma ordem. */
export function focusByDay(
  sessions: readonly FocusSessionRecord[],
  dates: readonly string[],
): DailyFocus[] {
  return dates.map((date) => {
    const parsed = new Date(`${date}T12:00:00`);
    const label = WEEKDAY_ABBREVIATIONS[parsed.getDay()] ?? '';
    return { date, label, seconds: totalFocusSeconds(sessionsOn(sessions, date)) };
  });
}

/** Onde o tempo foi: segundos somados por tarefa ou bloco, do maior para o menor. */
export function focusByLabel(
  sessions: readonly FocusSessionRecord[],
): { label: string; seconds: number }[] {
  const totals = new Map<string, number>();

  for (const session of sessions) {
    totals.set(session.label, (totals.get(session.label) ?? 0) + session.seconds);
  }

  return [...totals.entries()]
    .map(([label, seconds]) => ({ label, seconds }))
    .sort((a, b) => b.seconds - a.seconds);
}

/** Maior valor do conjunto, usado para escalar as barras. */
export function peakSeconds(entries: readonly { seconds: number }[]): number {
  return entries.reduce((peak, entry) => Math.max(peak, entry.seconds), 0);
}

/** Altura relativa de uma barra, de 0 a 100. */
export function barPercent(seconds: number, peak: number): number {
  if (peak <= 0) return 0;
  return (100 * seconds) / peak;
}
