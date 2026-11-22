/** Feriado nacional, no formato devolvido pela BrasilAPI. */
export type Holiday = {
  /** Data no formato YYYY-MM-DD. É o identificador: o nome se repete (Carnaval). */
  date: string;
  name: string;
  type: string;
  /** Dia da semana por extenso, em minúsculas ("segunda-feira"). */
  weekday: string;
};

/** Intervalo de anos aceito pela API. Fora dele ela responde 404. */
export const MIN_HOLIDAY_YEAR = 1900;
export const MAX_HOLIDAY_YEAR = 2199;

const MAX_ITEMS = 100;
const MAX_TEXT = 80;

export function isValidHolidayYear(year: number): boolean {
  return Number.isInteger(year) && year >= MIN_HOLIDAY_YEAR && year <= MAX_HOLIDAY_YEAR;
}

/** Aceita só datas reais no formato YYYY-MM-DD (rejeita 2026-02-31, por exemplo). */
export function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split('-').map(Number) as [number, number, number];
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

function isText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= MAX_TEXT;
}

function parseHoliday(item: unknown): Holiday | null {
  if (typeof item !== 'object' || item === null) return null;

  const { date, name, type, weekday } = item as Record<string, unknown>;
  if (!isIsoDate(date) || !isText(name) || !isText(type) || !isText(weekday)) return null;

  return { date, name: name.trim(), type, weekday };
}

/**
 * Valida o JSON recebido da rede antes de ele chegar à interface.
 *
 * Falha fechada: se qualquer item tiver formato inesperado, a resposta inteira
 * é recusada (`null`) em vez de exibir dado pela metade.
 */
export function parseHolidays(payload: unknown): Holiday[] | null {
  if (!Array.isArray(payload) || payload.length > MAX_ITEMS) return null;

  const holidays: Holiday[] = [];
  for (const item of payload) {
    const holiday = parseHoliday(item);
    if (holiday === null) return null;
    holidays.push(holiday);
  }

  return holidays.sort((a, b) => a.date.localeCompare(b.date));
}

/** Primeiro feriado de hoje em diante, ou `undefined` se não houver mais no ano. */
export function nextHoliday(holidays: readonly Holiday[], today: string): Holiday | undefined {
  return holidays.find((holiday) => holiday.date >= today);
}

/** Dias entre duas datas YYYY-MM-DD, sem depender do fuso do aparelho. */
export function daysBetween(from: string, to: string): number {
  const toUtc = (iso: string) => {
    const [year, month, day] = iso.split('-').map(Number) as [number, number, number];
    return Date.UTC(year, month - 1, day);
  };

  return Math.round((toUtc(to) - toUtc(from)) / 86_400_000);
}

/** Distância legível até a data: "Hoje", "Amanhã", "Em 12 dias" ou "Há 3 dias". */
export function distanceLabel(today: string, date: string): string {
  const days = daysBetween(today, date);

  if (days === 0) return 'Hoje';
  if (days === 1) return 'Amanhã';
  if (days === -1) return 'Ontem';
  return days > 0 ? `Em ${days} dias` : `Há ${-days} dias`;
}
