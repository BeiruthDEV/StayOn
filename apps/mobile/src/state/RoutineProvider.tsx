import { createContext, useCallback, useContext, useMemo } from 'react';

import {
  createRoutineItem,
  reuseIds,
  toggleDone,
  type RoutineItem,
  type RoutineLog,
  type Weekday,
} from '@/domain/routine';
import { storageKeys, usePersistentState } from '@/storage';

/** Campos de um bloco que a pessoa preenche. */
export type RoutineDraft = {
  title: string;
  start: string;
  end: string;
  tag: string;
};

type RoutineContextValue = {
  items: readonly RoutineItem[];
  log: RoutineLog;
  /** Falso até a rotina e o registro serem lidos do aparelho. */
  hydrated: boolean;
  /** Cria o mesmo bloco em cada um dos dias e devolve os criados. */
  addToDays: (days: readonly Weekday[], draft: RoutineDraft) => RoutineItem[];
  /** Altera um bloco, inclusive o dia. */
  edit: (id: string, weekday: Weekday, draft: RoutineDraft) => void;
  remove: (id: string) => void;
  /** Recoloca blocos removidos (ação de desfazer). */
  restore: (items: readonly RoutineItem[]) => void;
  /** Tira blocos criados (ação de desfazer). */
  removeMany: (ids: readonly string[]) => void;
  /** Troca a rotina inteira (importação com substituição, copiar dia). */
  replaceAll: (items: readonly RoutineItem[]) => void;
  /** Soma blocos à rotina (importação sem substituição). */
  addMany: (items: readonly RoutineItem[]) => void;
  /** Marca ou desmarca um bloco numa data. */
  toggle: (date: string, id: string) => void;
};

const RoutineContext = createContext<RoutineContextValue | null>(null);

/** A rotina começa vazia: só entra o que a pessoa criar ou importar. */
const NO_ITEMS: readonly RoutineItem[] = [];
const NO_LOG: RoutineLog = {};

export function RoutineProvider({ children }: { children: React.ReactNode }) {
  const routine = usePersistentState<readonly RoutineItem[]>(storageKeys.routine, NO_ITEMS);
  const history = usePersistentState<RoutineLog>(storageKeys.routineLog, NO_LOG);
  const setItems = routine.setValue;
  const setLog = history.setValue;

  const addToDays = useCallback(
    (days: readonly Weekday[], draft: RoutineDraft) => {
      const created = days.map((day) =>
        createRoutineItem(day, draft.title, draft.start, draft.end, draft.tag),
      );
      setItems((current) => [...current, ...created]);
      return created;
    },
    [setItems],
  );

  const edit = useCallback(
    (id: string, weekday: Weekday, draft: RoutineDraft) =>
      setItems((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                weekday,
                title: draft.title.trim(),
                start: draft.start,
                end: draft.end,
                tag: draft.tag.trim() || item.tag,
              }
            : item,
        ),
      ),
    [setItems],
  );

  const remove = useCallback(
    (id: string) => setItems((current) => current.filter((item) => item.id !== id)),
    [setItems],
  );

  const restore = useCallback(
    (removed: readonly RoutineItem[]) =>
      setItems((current) => [
        ...current.filter((item) => !removed.some((back) => back.id === item.id)),
        ...removed,
      ]),
    [setItems],
  );

  const removeMany = useCallback(
    (ids: readonly string[]) =>
      setItems((current) => current.filter((item) => !ids.includes(item.id))),
    [setItems],
  );

  const replaceAll = useCallback(
    (next: readonly RoutineItem[]) => setItems((current) => reuseIds(current, next)),
    [setItems],
  );

  const addMany = useCallback(
    (more: readonly RoutineItem[]) => setItems((current) => [...current, ...more]),
    [setItems],
  );

  const toggle = useCallback(
    (date: string, id: string) => setLog((current) => toggleDone(current, date, id)),
    [setLog],
  );

  const value = useMemo(
    () => ({
      items: routine.value,
      log: history.value,
      hydrated: routine.hydrated && history.hydrated,
      addToDays,
      edit,
      remove,
      restore,
      removeMany,
      replaceAll,
      addMany,
      toggle,
    }),
    [
      routine.value,
      history.value,
      routine.hydrated,
      history.hydrated,
      addToDays,
      edit,
      remove,
      restore,
      removeMany,
      replaceAll,
      addMany,
      toggle,
    ],
  );

  return <RoutineContext.Provider value={value}>{children}</RoutineContext.Provider>;
}

export function useRoutine(): RoutineContextValue {
  const context = useContext(RoutineContext);
  if (context === null) {
    throw new Error('useRoutine precisa estar dentro de RoutineProvider.');
  }
  return context;
}
