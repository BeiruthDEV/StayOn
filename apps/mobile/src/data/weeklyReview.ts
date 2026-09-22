import type { WeeklyReview } from '@/domain/weeklyReview';

/** Revisão da semana corrente — mock equivalente ao do protótipo. */
export const currentWeekReview: WeeklyReview = {
  range: '23 – 29 de outubro',
  executionRate: 81,
  executionTarget: 80,
  executionDelta: 2,
  deepFocusHours: 24,
  peakWindow: '08:00 – 11:00',
  completedBlocks: 42,
  rescheduledBlocks: 8,
  topDistraction: 'Rede social',
  topDistractionShare: 42,
  recommendation:
    'Bloqueie aplicativos sociais entre 13:30 e 18:00 na próxima semana para conter a queda de foco da tarde.',
};
