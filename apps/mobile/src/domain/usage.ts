import type { IconName } from '@/icons';

/** Uso de tela do dia, separado entre produtivo e distraído. */
export type ScreenTime = {
  /** Minutos em atividades produtivas. */
  productiveMinutes: number;
  /** Minutos em distração. */
  distractedMinutes: number;
  /** Variação em minutos em relação a ontem (positiva = piorou). */
  deltaMinutes: number;
};

/** Uma barra do gráfico de uso por hora. */
export type HourlyUsage = {
  /** Rótulo do eixo, ex.: "14h". */
  label: string;
  /** Minutos de uso na faixa. */
  minutes: number;
};

/** Aplicativo que mais consumiu tempo. */
export type Distraction = {
  id: string;
  name: string;
  totalMinutes: number;
  /** Minutos consumidos durante blocos de foco planejados. */
  duringFocusMinutes: number;
  icon: IconName;
};

/** Minutos totais de tela. */
export function totalMinutes(screenTime: ScreenTime): number {
  return screenTime.productiveMinutes + screenTime.distractedMinutes;
}

/** Duração legível: "6h 24m", "3h" ou "46m". */
export function minutesLabel(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (hours === 0) return `${rest}m`;
  if (rest === 0) return `${hours}h`;
  return `${hours}h ${rest}m`;
}

/** Variação em relação a ontem, com sinal: "+42m" ou "-15m". */
export function deltaLabel(screenTime: ScreenTime): string {
  const sign = screenTime.deltaMinutes >= 0 ? '+' : '-';
  return `${sign}${minutesLabel(Math.abs(screenTime.deltaMinutes))}`;
}

/** Fatia produtiva do tempo de tela, de 0 a 100. */
export function productivePercent(screenTime: ScreenTime): number {
  const total = totalMinutes(screenTime);
  if (total === 0) return 0;
  return (100 * screenTime.productiveMinutes) / total;
}

/** Faixa de maior uso do dia, usada como rótulo de pico. */
export function peakWindow(usage: readonly HourlyUsage[]): HourlyUsage | undefined {
  return usage.reduce<HourlyUsage | undefined>(
    (peak, entry) => (peak === undefined || entry.minutes > peak.minutes ? entry : peak),
    undefined,
  );
}

/** Altura relativa de uma barra em relação à maior do conjunto, de 0 a 100. */
export function barPercent(entry: HourlyUsage, usage: readonly HourlyUsage[]): number {
  const peak = peakWindow(usage);
  if (peak === undefined || peak.minutes === 0) return 0;
  return (100 * entry.minutes) / peak.minutes;
}
