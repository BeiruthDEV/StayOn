import type { TimeBlock } from '@/domain/timeBlock';

/** Data exibida no cabeçalho da linha do tempo. */
export const plannerDate = 'Quinta-feira, 26 de outubro';

/** Horário atual simulado — posiciona o marcador "agora" na linha do tempo. */
export const currentTime = '13:15';

/** Horário sugerido pelo sistema para o bloco perdido. */
export const suggestedReplanTime = '17:00';

/** Blocos do dia — mock equivalente à agenda do protótipo. */
export const initialBlocks: readonly TimeBlock[] = [
  {
    id: 'block-1',
    title: 'Aulas em vídeo',
    start: '08:00',
    end: '10:00',
    tag: 'Aprendizado',
    icon: 'play',
    status: 'done',
  },
  {
    id: 'block-2',
    title: 'Leitura',
    start: '10:15',
    end: '10:45',
    tag: 'Crescimento',
    icon: 'bookmark',
    status: 'done',
  },
  {
    id: 'block-3',
    title: 'Estudar Spring Boot',
    start: '14:30',
    end: '16:00',
    tag: 'Dev',
    icon: 'code',
    status: 'missed',
  },
  {
    id: 'block-4',
    title: 'Portfólio',
    start: '16:30',
    end: '18:00',
    tag: 'Carreira',
    icon: 'layout',
    status: 'upcoming',
  },
  {
    id: 'block-5',
    title: 'Candidaturas',
    start: '19:00',
    end: '20:00',
    tag: 'Carreira',
    icon: 'clipboard',
    status: 'upcoming',
  },
];
