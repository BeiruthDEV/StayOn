/** Dia exibido na grade do calendário. */
export type CalendarDay = {
  /** Data no formato YYYY-MM-DD. */
  date: string;
  /** Número do dia exibido na célula. */
  day: number;
  /** Falso para os dias de preenchimento do mês anterior ou seguinte. */
  inMonth: boolean;
};

/** Iniciais dos dias da semana, começando no domingo. */
export const weekdayInitials = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'] as const;

const MONTH_NAMES = [
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

/** Rótulo do mês, ex.: "Agosto de 2024". */
export function monthLabel(year: number, month: number): string {
  const name = MONTH_NAMES[month] ?? '';
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} de ${year}`;
}

function toIsoDate(year: number, month: number, day: number): string {
  const date = new Date(Date.UTC(year, month, day));
  return date.toISOString().slice(0, 10);
}

/**
 * Monta a grade do mês em semanas de sete dias, completando o início e o fim
 * com os dias vizinhos para a grade ficar retangular.
 * `month` é o índice do mês (0 = janeiro), como em `Date`.
 */
export function buildMonthGrid(year: number, month: number, weeks = 3): CalendarDay[][] {
  const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const start = 1 - firstWeekday;
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  const grid: CalendarDay[][] = [];

  for (let week = 0; week < weeks; week += 1) {
    const row: CalendarDay[] = [];

    for (let weekday = 0; weekday < 7; weekday += 1) {
      const dayNumber = start + week * 7 + weekday;
      const inMonth = dayNumber >= 1 && dayNumber <= daysInMonth;
      const cell = new Date(Date.UTC(year, month, dayNumber));

      row.push({
        date: toIsoDate(cell.getUTCFullYear(), cell.getUTCMonth(), cell.getUTCDate()),
        day: cell.getUTCDate(),
        inMonth,
      });
    }

    grid.push(row);
  }

  return grid;
}
