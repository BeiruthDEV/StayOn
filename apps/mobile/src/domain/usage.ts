/** Duração legível: "6h 24m", "3h" ou "46m". */
export function minutesLabel(minutes: number): string {
  const safe = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safe / 60);
  const rest = safe % 60;

  if (hours === 0) return `${rest}m`;
  if (rest === 0) return `${hours}h`;
  return `${hours}h ${rest}m`;
}

/** Variação com sinal, ex.: "+42m" ou "-15m". */
export function signedMinutesLabel(minutes: number): string {
  const sign = minutes >= 0 ? '+' : '-';
  return `${sign}${minutesLabel(Math.abs(minutes))}`;
}
