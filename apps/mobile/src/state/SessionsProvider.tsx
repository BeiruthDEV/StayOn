import { createContext, useCallback, useContext, useMemo } from 'react';

import { todayIso } from '@/domain/clock';
import { createSession, type FocusSessionRecord, type SessionOutcome } from '@/domain/session';
import { storageKeys, usePersistentState } from '@/storage';

type SessionsContextValue = {
  /** Histórico de sessões de foco, da mais antiga para a mais recente. */
  sessions: readonly FocusSessionRecord[];
  /** Registra uma sessão encerrada e devolve o registro criado. */
  record: (label: string, seconds: number, outcome: SessionOutcome) => FocusSessionRecord;
  replaceAll: (sessions: readonly FocusSessionRecord[]) => void;
};

const SessionsContext = createContext<SessionsContextValue | null>(null);

/** O histórico começa vazio: só entra o que a pessoa realmente fez. */
const NO_SESSIONS: readonly FocusSessionRecord[] = [];

export function SessionsProvider({ children }: { children: React.ReactNode }) {
  const { value: sessions, setValue } = usePersistentState<readonly FocusSessionRecord[]>(
    storageKeys.sessions,
    NO_SESSIONS,
  );

  const record = useCallback(
    (label: string, seconds: number, outcome: SessionOutcome) => {
      const session = createSession(todayIso(), label, seconds, outcome);
      setValue((current) => [...current, session]);
      return session;
    },
    [setValue],
  );

  const replaceAll = useCallback(
    (next: readonly FocusSessionRecord[]) => setValue(() => next),
    [setValue],
  );

  const value = useMemo(
    () => ({ sessions, record, replaceAll }),
    [sessions, record, replaceAll],
  );

  return <SessionsContext.Provider value={value}>{children}</SessionsContext.Provider>;
}

export function useSessions(): SessionsContextValue {
  const context = useContext(SessionsContext);
  if (context === null) {
    throw new Error('useSessions precisa estar dentro de SessionsProvider.');
  }
  return context;
}
