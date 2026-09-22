import type { CalendarEvent } from '@/domain/event';

/**
 * Compromissos de exemplo da primeira abertura, para a agenda não nascer
 * vazia. A contagem regressiva é recalculada contra a data de hoje.
 */
export const initialEvents: readonly CalendarEvent[] = [
  {
    id: 'event-1',
    title: 'Prova de Banco de Dados',
    date: '2026-10-10',
    dateLabel: '10 de out',
    meta: 'Sala B',
    countdown: '',
    category: 'study',
    icon: 'database',
  },
  {
    id: 'event-2',
    title: 'Entrega do portfólio',
    date: '2026-10-16',
    dateLabel: '16 de out',
    countdown: '',
    category: 'study',
    icon: 'folder',
  },
  {
    id: 'event-3',
    title: 'Renovação da academia',
    date: '2026-10-20',
    dateLabel: '20 de out',
    meta: 'R$ 145,00',
    countdown: '',
    category: 'payment',
    icon: 'money',
  },
];
