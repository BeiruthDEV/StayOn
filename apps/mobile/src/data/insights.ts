import type { Distraction, HourlyUsage, ScreenTime } from '@/domain/usage';

/** Tempo de tela de hoje — mock equivalente ao do protótipo. */
export const todayScreenTime: ScreenTime = {
  productiveMinutes: 230,
  distractedMinutes: 154,
  deltaMinutes: 42,
};

/** Insight principal destacado no topo da tela. */
export const keyInsight =
  'Você usou redes sociais por 2h11 hoje. 46 minutos aconteceram dentro de blocos de estudo planejados.';

/** Uso por faixa de duas horas, das 8h às 20h. */
export const hourlyUsage: readonly HourlyUsage[] = [
  { label: '8h', minutes: 22 },
  { label: '10h', minutes: 38 },
  { label: '12h', minutes: 51 },
  { label: '14h', minutes: 96 },
  { label: '16h', minutes: 64 },
  { label: '18h', minutes: 45 },
  { label: '20h', minutes: 68 },
];

/** Tentativas de abrir aplicativos bloqueados no dia. */
export const blockedAttemptsToday = 14;

/** Aplicativos que mais consumiram tempo. */
export const topDistractions: readonly Distraction[] = [
  {
    id: 'distraction-1',
    name: 'Rede social',
    totalMinutes: 131,
    duringFocusMinutes: 46,
    icon: 'globe',
  },
  {
    id: 'distraction-2',
    name: 'Streaming de vídeo',
    totalMinutes: 80,
    duringFocusMinutes: 0,
    icon: 'video',
  },
  {
    id: 'distraction-3',
    name: 'Mensagens',
    totalMinutes: 34,
    duringFocusMinutes: 12,
    icon: 'phone',
  },
];
