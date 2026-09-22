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
  /** Minutos efetivamente focados. */
  minutes: number;
  outcome: SessionOutcome;
};

/** Cria o registro de uma sessão encerrada. */
export function createSession(
  date: string,
  label: string,
  minutes: number,
  outcome: SessionOutcome,
): FocusSessionRecord {
  return { id: createId('session'), date, label, minutes: Math.max(0, minutes), outcome };
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

/** Soma dos minutos focados. */
export function totalFocusMinutes(sessions: readonly FocusSessionRecord[]): number {
  return sessions.reduce((total, session) => total + session.minutes, 0);
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
