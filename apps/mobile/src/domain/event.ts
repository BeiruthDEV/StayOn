import type { IconName } from '@/icons';

import { createId } from './id';

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

/** Ícone padrão de cada categoria, usado ao criar um compromisso. */
const CATEGORY_ICONS: Readonly<Record<EventCategory, IconName>> = {
  study: 'graduation',
  personal: 'heart',
  payment: 'money',
};

/** Cria um compromisso a partir do formulário. */
export function createEvent(
  title: string,
  date: string,
  category: EventCategory,
  meta: string,
  today: string,
): CalendarEvent {
  const trimmedMeta = meta.trim();

  return {
    id: createId('event'),
    title: title.trim(),
    date,
    dateLabel: formatDateLabel(date),
    countdown: countdownLabel(date, today),
    category,
    icon: CATEGORY_ICONS[category],
    ...(trimmedMeta === '' ? {} : { meta: trimmedMeta }),
  };
}

/** Acrescenta um compromisso mantendo a lista em ordem de data. */
export function addEvent(
  events: readonly CalendarEvent[],
  event: CalendarEvent,
): CalendarEvent[] {
  return [...events, event].sort((a, b) => a.date.localeCompare(b.date));
}

/** Remove um compromisso. */
export function removeEvent(events: readonly CalendarEvent[], id: string): CalendarEvent[] {
  return events.filter((event) => event.id !== id);
}

const MONTH_ABBREVIATIONS = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
] as const;

/** Data legível a partir de YYYY-MM-DD, ex.: "10 de ago". */
export function formatDateLabel(date: string): string {
  const [, month = '01', day = '01'] = date.split('-');
  const abbreviation = MONTH_ABBREVIATIONS[Number(month) - 1] ?? '';
  return `${Number(day)} de ${abbreviation}`;
}

/** Dias inteiros entre duas datas no formato YYYY-MM-DD. */
export function daysBetween(from: string, to: string): number {
  const start = Date.parse(`${from}T00:00:00Z`);
  const end = Date.parse(`${to}T00:00:00Z`);
  if (Number.isNaN(start) || Number.isNaN(end)) return 0;
  return Math.round((end - start) / 86400000);
}

/** Contagem regressiva legível, ex.: "hoje", "amanhã" ou "em 5 dias". */
export function countdownLabel(date: string, today: string): string {
  const days = daysBetween(today, date);

  if (days < 0) return 'passou';
  if (days === 0) return 'hoje';
  if (days === 1) return 'amanhã';
  return `em ${days} dias`;
}

/** Recalcula a contagem regressiva de todos os compromissos. */
export function refreshCountdowns(
  events: readonly CalendarEvent[],
  today: string,
): CalendarEvent[] {
  return events.map((event) => ({ ...event, countdown: countdownLabel(event.date, today) }));
}
