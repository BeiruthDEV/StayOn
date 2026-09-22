import { createContext, useCallback, useContext, useMemo } from 'react';

import { initialHabits } from '@/data/habits';
import {
  addHabit,
  createHabit,
  editHabit,
  removeHabit,
  setHabitDone,
  toggleHabitDone,
  togglePaused,
  type Habit,
} from '@/domain/habit';
import { storageKeys, usePersistentState } from '@/storage';

type HabitsContextValue = {
  habits: readonly Habit[];
  toggleHabit: (id: string) => void;
  /** Restaura um estado de conclusão anterior (ação de desfazer). */
  restoreHabit: (id: string, done: boolean) => void;
  /** Cria um hábito e devolve o que foi criado. */
  add: (name: string, goal: string) => Habit;
  edit: (id: string, name: string, goal: string) => void;
  remove: (id: string) => void;
  /** Recoloca um hábito removido na lista (ação de desfazer). */
  restoreRemoved: (habit: Habit) => void;
  /** Alterna entre pausado e ativo. */
  togglePause: (id: string) => void;
  replaceAll: (habits: readonly Habit[]) => void;
};

const HabitsContext = createContext<HabitsContextValue | null>(null);

export function HabitsProvider({ children }: { children: React.ReactNode }) {
  const { value: habits, setValue } = usePersistentState<readonly Habit[]>(
    storageKeys.habits,
    initialHabits,
  );

  const toggleHabit = useCallback(
    (id: string) => setValue((current) => toggleHabitDone(current, id)),
    [setValue],
  );

  const restoreHabit = useCallback(
    (id: string, done: boolean) => setValue((current) => setHabitDone(current, id, done)),
    [setValue],
  );

  const add = useCallback(
    (name: string, goal: string) => {
      const habit = createHabit(name, goal);
      setValue((current) => addHabit(current, habit));
      return habit;
    },
    [setValue],
  );

  const edit = useCallback(
    (id: string, name: string, goal: string) =>
      setValue((current) => editHabit(current, id, name, goal)),
    [setValue],
  );

  const remove = useCallback(
    (id: string) => setValue((current) => removeHabit(current, id)),
    [setValue],
  );

  const restoreRemoved = useCallback(
    (habit: Habit) => setValue((current) => addHabit(current, habit)),
    [setValue],
  );

  const togglePause = useCallback(
    (id: string) => setValue((current) => togglePaused(current, id)),
    [setValue],
  );

  const replaceAll = useCallback(
    (next: readonly Habit[]) => setValue(() => next),
    [setValue],
  );

  const value = useMemo(
    () => ({
      habits,
      toggleHabit,
      restoreHabit,
      add,
      edit,
      remove,
      restoreRemoved,
      togglePause,
      replaceAll,
    }),
    [
      habits,
      toggleHabit,
      restoreHabit,
      add,
      edit,
      remove,
      restoreRemoved,
      togglePause,
      replaceAll,
    ],
  );

  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>;
}

export function useHabits(): HabitsContextValue {
  const context = useContext(HabitsContext);
  if (context === null) {
    throw new Error('useHabits precisa estar dentro de HabitsProvider.');
  }
  return context;
}
