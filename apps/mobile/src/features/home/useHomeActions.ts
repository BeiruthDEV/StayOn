import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { canToggleHabit, type Habit } from '@/domain/habit';
import type { Task } from '@/domain/task';
import { useHabits, useTasks, useToast } from '@/state';

/**
 * Handlers da Home: conclusão com desfazer e navegação.
 * Mantém as telas livres de regra de negócio.
 */
export function useHomeActions() {
  const router = useRouter();
  const { showToast } = useToast();
  const { toggleTask, restoreTask } = useTasks();
  const { toggleHabit, restoreHabit } = useHabits();

  const completeTask = useCallback(
    (task: Task) => {
      toggleTask(task.id);
      if (!task.done) {
        showToast('Tarefa concluída', () => restoreTask(task.id, false));
      }
    },
    [toggleTask, restoreTask, showToast],
  );

  const completeHabit = useCallback(
    (habit: Habit) => {
      if (!canToggleHabit(habit)) return;
      toggleHabit(habit.id);
      if (!habit.done) {
        showToast('Hábito concluído', () => restoreHabit(habit.id, false));
      }
    },
    [toggleHabit, restoreHabit, showToast],
  );

  const goToFocus = useCallback(() => router.navigate('/focus'), [router]);
  const goToPlanner = useCallback(() => router.navigate('/planner'), [router]);
  const goToInsights = useCallback(() => router.navigate('/insights'), [router]);

  /** Telas ainda não migradas (fases 3 a 6) avisam em vez de navegar. */
  const notifyPending = useCallback(
    (feature: string) => showToast(`${feature} chega em breve`),
    [showToast],
  );

  return {
    completeTask,
    completeHabit,
    goToFocus,
    goToPlanner,
    goToInsights,
    notifyPending,
  };
}
