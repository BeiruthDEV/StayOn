/** Momento de gravação do cache, ex.: "04/11/2026 21:30". */
export function formatSavedAt(savedAt: number): string {
  const date = new Date(savedAt);
  const pad = (value: number) => String(value).padStart(2, '0');

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
