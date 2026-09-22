import type { IconName } from '@/icons';

/** Categoria usada para filtrar a agenda de compromissos. */
export type EventCategory = 'study' | 'personal' | 'payment';

/** Compromisso com data marcada. */
export type CalendarEvent = {
  id: string;
  title: string;
  /** Data no formato YYYY-MM-DD, usada para marcar o calendário. */
  date: string;
  /** Data legível exibida na linha, ex.: "10 de ago". */
  dateLabel: string;
  /** Local, valor ou outra informação de apoio. */
  meta?: string;
  /** Contagem regressiva, ex.: "em 5 dias". */
  countdown: string;
  category: EventCategory;
  icon: IconName;
};

/** Rótulos das categorias, na ordem exibida nos filtros. */
export const categoryLabels: Readonly<Record<EventCategory, string>> = {
  study: 'Trabalho e estudo',
  personal: 'Pessoal',
  payment: 'Pagamentos',
};

/** Aplica o filtro de categorias. Conjunto vazio significa "todos". */
export function filterEvents(
  events: readonly CalendarEvent[],
  categories: ReadonlySet<EventCategory>,
): CalendarEvent[] {
  if (categories.size === 0) return [...events];
  return events.filter((event) => categories.has(event.category));
}

/** Datas que recebem marcador no calendário. */
export function markedDates(events: readonly CalendarEvent[]): Set<string> {
  return new Set(events.map((event) => event.date));
}
