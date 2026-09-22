/** Hábito acompanhado diariamente. */
export type Habit = {
  id: string;
  name: string;
  /** Meta declarada do hábito, ex.: "20 min/dia". */
  goal: string;
  /** Dias consecutivos cumpridos. */
  streak: number;
  done: boolean;
  /** Progresso do dia em texto, ex.: "34/60 min". */
  progressLabel: string;
  paused: boolean;
};

/** Hábitos pausados não podem ser concluídos — regra do protótipo. */
export function canToggleHabit(habit: Habit): boolean {
  return !habit.paused;
}

/** Alterna a conclusão de um hábito ativo, devolvendo uma nova lista. */
export function toggleHabitDone(habits: readonly Habit[], id: string): Habit[] {
  return habits.map((habit) =>
    habit.id === id && canToggleHabit(habit) ? { ...habit, done: !habit.done } : habit,
  );
}

/** Define explicitamente a conclusão de um hábito (usado ao desfazer). */
export function setHabitDone(habits: readonly Habit[], id: string, done: boolean): Habit[] {
  return habits.map((habit) => (habit.id === id ? { ...habit, done } : habit));
}

/** Hábitos ativos exibidos na Home — o protótipo mostra os dois primeiros. */
export function habitsForToday(habits: readonly Habit[], limit = 2): Habit[] {
  return habits.filter((habit) => !habit.paused).slice(0, limit);
}
