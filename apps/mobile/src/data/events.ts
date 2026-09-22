import type { CalendarEvent } from '@/domain/event';

/** Mês aberto no calendário da tela de datas. */
export const calendarMonth = { year: 2024, month: 7 } as const;

/** Dia selecionado ao abrir a tela. */
export const selectedDate = '2024-08-06';

/** Dia de hoje no cenário do protótipo. */
export const todayDate = '2024-08-05';

/** Destaque "a seguir" exibido acima da lista. */
export const upNextEvent = {
  title: 'Entrevista final: Acme Corp',
  when: 'Amanhã',
  timeRange: '10:00 – 11:30',
  place: 'Google Meet',
};

/** Compromissos do mês — mock equivalente ao do protótipo. */
export const initialEvents: readonly CalendarEvent[] = [
  {
    id: 'event-1',
    title: 'Prova de Banco de Dados',
    date: '2024-08-10',
    dateLabel: '10 de ago',
    meta: 'Sala B',
    countdown: 'em 5 dias',
    category: 'study',
    icon: 'database',
  },
  {
    id: 'event-2',
    title: 'Entrega do portfólio',
    date: '2024-08-11',
    dateLabel: '11 de ago (sexta)',
    countdown: 'em 6 dias',
    category: 'study',
    icon: 'folder',
  },
  {
    id: 'event-3',
    title: 'Renovação da academia',
    date: '2024-08-12',
    dateLabel: '12 de ago',
    meta: 'R$ 145,00',
    countdown: 'semana que vem',
    category: 'payment',
    icon: 'money',
  },
  {
    id: 'event-4',
    title: 'Consulta médica',
    date: '2024-08-15',
    dateLabel: '15 de ago',
    meta: 'Clínica Sul',
    countdown: 'em 10 dias',
    category: 'personal',
    icon: 'heart',
  },
];
