import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { initialHabits } from '@/data/habits';
import { setHabitDone, toggleHabitDone, type Habit } from '@/domain/habit';

type HabitsContextValue = {
  habits: readonly Habit[];
  toggleHabit: (id: string) => void;
  /** Restaura um estado de conclusão anterior (ação de desfazer). */
  restoreHabit: (id: string, done: boolean) => void;
};

const HabitsContext = createContext<HabitsContextValue | null>(null);

export function HabitsProvider({ children }: { children: React.ReactNode }) {
  const [habits, setHabits] = useState<readonly Habit[]>(initialHabits);

  const toggleHabit = useCallback((id: string) => {
    setHabits((current) => toggleHabitDone(current, id));
  }, []);

  const restoreHabit = useCallback((id: string, done: boolean) => {
    setHabits((current) => setHabitDone(current, id, done));
  }, []);

  const value = useMemo(
    () => ({ habits, toggleHabit, restoreHabit }),
    [habits, toggleHabit, restoreHabit],
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
