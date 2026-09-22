/** Conteúdo fixo da Home no protótipo. Vira dado de servidor em fase futura. */

export type NextAction = {
  timeRange: string;
  title: string;
  goal: string;
};

export type UpcomingEvent = {
  title: string;
  schedule: string;
  countdown: string;
};

export type DistractionSummary = {
  /** Trechos alternando texto neutro e texto destacado. */
  totalTime: string;
  duringFocus: string;
};

export const homeGreetingDate = 'Segunda-feira, 4 de agosto';

export const defaultUserName = 'João';

export const nextAction: NextAction = {
  timeRange: '14:30 – 16:00',
  title: 'Estudar Spring Boot',
  goal: 'Meta: finalizar a autenticação JWT e testar os endpoints.',
};

export const upcomingEvent: UpcomingEvent = {
  title: 'Prova de Banco de Dados',
  schedule: 'Sáb, 9 de ago · 09:00',
  countdown: 'em 5 dias',
};

export const distractionSummary: DistractionSummary = {
  totalTime: '2h11',
  duringFocus: '46 min',
};
