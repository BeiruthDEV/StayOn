import { createContext, useCallback, useContext, useMemo } from 'react';

import {
  createRoutineItem,
  toggleDone,
  type RoutineItem,
  type RoutineLog,
  type Weekday,
} from '@/domain/routine';
import { storageKeys, usePersistentState } from '@/storage';

type RoutineContextValue = {
  items: readonly RoutineItem[];
  log: RoutineLog;
  /** Falso até a rotina e o registro serem lidos do aparelho. */
  hydrated: boolean;
  add: (weekday: Weekday, title: string, start: string, end: string, tag: string) => void;
  edit: (id: string, title: string, start: string, end: string, tag: string) => void;
  remove: (id: string) => void;
  /** Recoloca um bloco removido (ação de desfazer). */
  restore: (item: RoutineItem) => void;
  /** Troca a rotina inteira, usado na importação por texto. */
  replaceAll: (items: readonly RoutineItem[]) => void;
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

  const add = useCallback(
    (weekday: Weekday, title: string, start: string, end: string, tag: string) =>
      setItems((current) => [...current, createRoutineItem(weekday, title, start, end, tag)]),
    [setItems],
  );

  const edit = useCallback(
    (id: string, title: string, start: string, end: string, tag: string) =>
      setItems((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                title: title.trim(),
                start,
                end,
                tag: tag.trim() || item.tag,
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
    (item: RoutineItem) => setItems((current) => [...current, item]),
    [setItems],
  );

  const replaceAll = useCallback(
    (next: readonly RoutineItem[]) => setItems(() => [...next]),
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
      add,
      edit,
      remove,
      restore,
      replaceAll,
      toggle,
    }),
    [
      routine.value,
      history.value,
      routine.hydrated,
      history.hydrated,
      add,
      edit,
      remove,
      restore,
      replaceAll,
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
