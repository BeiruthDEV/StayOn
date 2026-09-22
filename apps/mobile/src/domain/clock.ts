const WEEKDAYS = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
] as const;

const MONTHS = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
] as const;

/** Data de hoje no formato YYYY-MM-DD, no fuso do aparelho. */
export function todayIso(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Hora atual no formato HH:MM. */
export function currentTime(now: Date = new Date()): string {
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

/** Data por extenso a partir de YYYY-MM-DD, ex.: "Quinta-feira, 26 de outubro". */
export function longDateLabel(date: string): string {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return '';

  const weekday = WEEKDAYS[parsed.getDay()] ?? '';
  const month = MONTHS[parsed.getMonth()] ?? '';
  return `${weekday}, ${parsed.getDate()} de ${month}`;
}

/** Saudação conforme a hora: "Bom dia", "Boa tarde" ou "Boa noite". */
export function greeting(now: Date = new Date()): string {
  const hour = now.getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

/** Desloca uma data em dias, devolvendo YYYY-MM-DD. */
export function shiftDate(date: string, days: number): string {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  parsed.setDate(parsed.getDate() + days);
  return todayIso(parsed);
}

/**
 * Intervalo da semana que contém a data, de segunda a domingo.
 * A revisão semanal usa esse recorte.
 */
export function weekRange(date: string): { from: string; to: string } {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return { from: date, to: date };

  // getDay(): 0 = domingo. Segunda é o início da semana.
  const offsetToMonday = (parsed.getDay() + 6) % 7;
  const from = shiftDate(date, -offsetToMonday);

  return { from, to: shiftDate(from, 6) };
}

/** Intervalo legível, ex.: "23 – 29 de outubro". */
export function rangeLabel(from: string, to: string): string {
  const start = new Date(`${from}T12:00:00`);
  const end = new Date(`${to}T12:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '';

  const endMonth = MONTHS[end.getMonth()] ?? '';

  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()} – ${end.getDate()} de ${endMonth}`;
  }

  const startMonth = MONTHS[start.getMonth()] ?? '';
  return `${start.getDate()} de ${startMonth} – ${end.getDate()} de ${endMonth}`;
}
