/** Minutos acrescentados a cada toque em "estender". */
export const EXTENSION_MINUTES = 5;

/** Formata segundos restantes como MM:SS (ou HH:MM:SS acima de uma hora). */
export function formatRemaining(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const rest = safe % 60;

  const pad = (value: number) => String(value).padStart(2, '0');

  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(rest)}`;
  return `${pad(minutes)}:${pad(rest)}`;
}

/** Percentual já decorrido da sessão, de 0 a 100. */
export function elapsedPercent(totalSeconds: number, remainingSeconds: number): number {
  if (totalSeconds <= 0) return 0;
  const elapsed = totalSeconds - remainingSeconds;
  return Math.min(100, Math.max(0, (100 * elapsed) / totalSeconds));
}
