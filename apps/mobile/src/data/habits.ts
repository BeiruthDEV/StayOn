import type { Habit } from '@/domain/habit';

/** Hábitos ativos — mock idêntico ao `state.habits` do protótipo. */
export const initialHabits: readonly Habit[] = [
  {
    id: 'habit-1',
    name: 'Ler 20 min',
    goal: '20 min/dia',
    streak: 12,
    done: true,
    progressLabel: '20/20 min',
    paused: false,
  },
  {
    id: 'habit-2',
    name: 'Estudar 1h',
    goal: '60 min/dia',
    streak: 21,
    done: false,
    progressLabel: '34/60 min',
    paused: false,
  },
  {
    id: 'habit-3',
    name: 'Beber 8 copos de água',
    goal: '8 copos',
    streak: 5,
    done: false,
    progressLabel: '5/8 copos',
    paused: false,
  },
  {
    id: 'habit-4',
    name: 'Dormir antes das 23h',
    goal: 'diário',
    streak: 3,
    done: false,
    progressLabel: 'ontem: 23:40',
    paused: false,
  },
];
