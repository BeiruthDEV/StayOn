/**
 * Duração legível a partir de segundos: "45s", "12m" ou "1h 5m".
 * Sessões curtas não viram "0m" — o app guarda segundos justamente para isso.
 */
export function durationLabel(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds));

  if (safe < 60) return `${safe}s`;

  const totalMinutes = Math.floor(safe / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

/** Variação com sinal, ex.: "+12m" ou "-45s". */
export function signedDurationLabel(seconds: number): string {
  const sign = seconds >= 0 ? '+' : '-';
  return `${sign}${durationLabel(Math.abs(seconds))}`;
}
