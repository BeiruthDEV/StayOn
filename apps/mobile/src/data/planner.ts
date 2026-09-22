import type { TimeBlock } from '@/domain/timeBlock';

/**
 * Agenda de exemplo da primeira abertura, para a tela não nascer vazia.
 * A partir daí tudo vem do que a pessoa criar.
 */
export const initialBlocks: readonly TimeBlock[] = [
  {
    id: 'block-1',
    title: 'Aulas em vídeo',
    start: '08:00',
    end: '10:00',
    tag: 'Estudos',
    icon: 'graduation',
    status: 'done',
  },
  {
    id: 'block-2',
    title: 'Leitura',
    start: '10:15',
    end: '10:45',
    tag: 'Leitura',
    icon: 'book',
    status: 'done',
  },
  {
    id: 'block-3',
    title: 'Estudar Spring Boot',
    start: '14:30',
    end: '16:00',
    tag: 'Estudos',
    icon: 'graduation',
    status: 'upcoming',
  },
  {
    id: 'block-4',
    title: 'Portfólio',
    start: '16:30',
    end: '18:00',
    tag: 'Carreira',
    icon: 'briefcase',
    status: 'upcoming',
  },
  {
    id: 'block-5',
    title: 'Candidaturas',
    start: '19:00',
    end: '20:00',
    tag: 'Carreira',
    icon: 'briefcase',
    status: 'upcoming',
  },
];
