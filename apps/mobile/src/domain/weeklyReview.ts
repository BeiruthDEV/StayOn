/** Métricas consolidadas de uma semana. */
export type WeeklyReview = {
  /** Intervalo exibido no cabeçalho, ex.: "23 – 29 de outubro". */
  range: string;
  /** Percentual do que foi planejado e executado. */
  executionRate: number;
  /** Meta de execução acordada. */
  executionTarget: number;
  /** Variação em pontos percentuais em relação à semana anterior. */
  executionDelta: number;
  /** Horas de foco profundo acumuladas. */
  deepFocusHours: number;
  /** Faixa de maior produtividade, ex.: "08:00 – 11:00". */
  peakWindow: string;
  /** Blocos concluídos no período. */
  completedBlocks: number;
  /** Blocos reagendados no período. */
  rescheduledBlocks: number;
  /** Aplicativo que mais consumiu tempo de distração. */
  topDistraction: string;
  /** Fatia que esse aplicativo representa no tempo de distração. */
  topDistractionShare: number;
  /** Sugestão automática exibida no fim da revisão. */
  recommendation: string;
};

/** Percentual de blocos cumpridos sobre o total planejado. */
export function planningAccuracy(review: WeeklyReview): number {
  const total = review.completedBlocks + review.rescheduledBlocks;
  if (total === 0) return 0;
  return Math.round((100 * review.completedBlocks) / total);
}

/** Variação da execução com sinal, ex.: "+2%". */
export function executionDeltaLabel(review: WeeklyReview): string {
  const sign = review.executionDelta >= 0 ? '+' : '-';
  return `${sign}${Math.abs(review.executionDelta)}%`;
}

/** Verdadeiro quando a meta de execução foi atingida. */
export function metTarget(review: WeeklyReview): boolean {
  return review.executionRate >= review.executionTarget;
}
