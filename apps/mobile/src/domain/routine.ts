import { shiftDate, weekRange } from './clock';
import { createId } from './id';
import { isValidRange, isValidTime, toMinutes } from './timeBlock';

/** Dia da semana como em `Date.getDay()`: 0 = domingo, 6 = sábado. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Bloco fixo da rotina, que se repete toda semana no mesmo dia e horário. */
export type RoutineItem = {
  id: string;
  weekday: Weekday;
  /** Início no formato HH:MM. */
  start: string;
  /** Fim no formato HH:MM. */
  end: string;
  title: string;
  /** Área do bloco, exibida como etiqueta (Concurso, TCC, Treino...). */
  tag: string;
};

/**
 * Registro do que foi cumprido: para cada data (YYYY-MM-DD), os ids dos blocos
 * marcados como feitos naquele dia. Cada dia começa sem nada marcado, e os dias
 * anteriores ficam guardados como histórico.
 */
export type RoutineLog = Readonly<Record<string, readonly string[]>>;

/** Dias na ordem da semana usada no app, de segunda a domingo. */
export const WEEK_ORDER: readonly Weekday[] = [1, 2, 3, 4, 5, 6, 0];

const SHORT_NAMES: Record<Weekday, string> = {
  0: 'Dom',
  1: 'Seg',
  2: 'Ter',
  3: 'Qua',
  4: 'Qui',
  5: 'Sex',
  6: 'Sáb',
};

/** Nome curto do dia: "Seg", "Ter"... */
export function weekdayShort(weekday: Weekday): string {
  return SHORT_NAMES[weekday];
}

/** Dia da semana de uma data YYYY-MM-DD. */
export function weekdayOf(date: string): Weekday {
  return new Date(`${date}T12:00:00`).getDay() as Weekday;
}

/** As sete datas da semana (segunda a domingo) que contém `date`. */
export function weekDates(date: string): string[] {
  const { from } = weekRange(date);
  return Array.from({ length: 7 }, (_, index) => shiftDate(from, index));
}

/** Blocos de um dia da semana, em ordem de horário. */
export function itemsForWeekday(items: readonly RoutineItem[], weekday: Weekday): RoutineItem[] {
  return items
    .filter((item) => item.weekday === weekday)
    .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
}

/** Verdadeiro se o bloco foi marcado como feito na data. */
export function isDone(log: RoutineLog, date: string, id: string): boolean {
  return log[date]?.includes(id) ?? false;
}

/** Marca ou desmarca um bloco na data, sem tocar nos outros dias. */
export function toggleDone(log: RoutineLog, date: string, id: string): RoutineLog {
  const current = log[date] ?? [];
  const next = current.includes(id) ? current.filter((doneId) => doneId !== id) : [...current, id];

  return { ...log, [date]: next };
}

export type Score = { done: number; total: number };

/** Percentual inteiro de um placar; zero quando não há nada planejado. */
export function percentOf(score: Score): number {
  if (score.total === 0) return 0;
  return Math.round((100 * score.done) / score.total);
}

/** Feitos e planejados de um dia. Só conta blocos que ainda existem na rotina. */
export function dayScore(items: readonly RoutineItem[], log: RoutineLog, date: string): Score {
  const planned = itemsForWeekday(items, weekdayOf(date));
  const done = planned.filter((item) => isDone(log, date, item.id)).length;
  return { done, total: planned.length };
}

/**
 * Placar da semana até `today`, inclusive. Dias que ainda não chegaram ficam
 * de fora, para que terça de manhã não mostre a semana como 10% cumprida.
 */
export function weekScoreUntil(
  items: readonly RoutineItem[],
  log: RoutineLog,
  today: string,
): Score {
  return weekDates(today)
    .filter((date) => date <= today)
    .reduce<Score>(
      (sum, date) => {
        const score = dayScore(items, log, date);
        return { done: sum.done + score.done, total: sum.total + score.total };
      },
      { done: 0, total: 0 },
    );
}

export type WeekHistoryRow = { from: string; to: string; score: Score };

/**
 * Semanas completas anteriores à atual, da mais recente para a mais antiga.
 * Para no primeiro dia que tem algo registrado, para não listar semanas de
 * antes de a pessoa começar a usar a rotina.
 */
export function pastWeeks(
  items: readonly RoutineItem[],
  log: RoutineLog,
  today: string,
  count: number,
): WeekHistoryRow[] {
  const loggedDates = Object.keys(log).filter((date) => (log[date]?.length ?? 0) > 0);
  if (loggedDates.length === 0) return [];
  const firstLogged = loggedDates.sort()[0] ?? today;

  const rows: WeekHistoryRow[] = [];
  let { from } = weekRange(today);

  for (let index = 0; index < count; index += 1) {
    from = shiftDate(from, -7);
    const to = shiftDate(from, 6);
    if (to < weekRange(firstLogged).from) break;

    const score = weekDates(from).reduce<Score>(
      (sum, date) => {
        const day = dayScore(items, log, date);
        return { done: sum.done + day.done, total: sum.total + day.total };
      },
      { done: 0, total: 0 },
    );
    rows.push({ from, to, score });
  }

  return rows;
}

/** Cria um bloco de rotina a partir do formulário. */
export function createRoutineItem(
  weekday: Weekday,
  title: string,
  start: string,
  end: string,
  tag: string,
): RoutineItem {
  return {
    id: createId('routine'),
    weekday,
    title: title.trim(),
    start,
    end,
    tag: tag.trim() || 'Rotina',
  };
}

const WEEKDAY_TOKENS: Record<string, Weekday> = {
  dom: 0,
  domingo: 0,
  seg: 1,
  segunda: 1,
  ter: 2,
  terca: 2,
  qua: 3,
  quarta: 3,
  qui: 4,
  quinta: 4,
  sex: 5,
  sexta: 5,
  sab: 6,
  sabado: 6,
};

function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export type ParseResult = {
  items: RoutineItem[];
  /** Linhas que não puderam ser lidas, com o número da linha (a partir de 1). */
  errors: { line: number; text: string; reason: string }[];
};

/**
 * Lê uma rotina escrita em texto, um bloco por linha:
 *
 *     seg 09:00-12:00 Concurso | Específicos: teoria
 *
 * Dia, horário de início e fim, área e título separados por "|". Sem "|", a
 * linha inteira vira o título e a área fica "Rotina". Linhas vazias e linhas
 * que começam com # são ignoradas.
 */
export function parseRoutineText(text: string): ParseResult {
  const items: RoutineItem[] = [];
  const errors: ParseResult['errors'] = [];

  text.split(/\r?\n/).forEach((raw, index) => {
    const line = raw.trim();
    if (line === '' || line.startsWith('#')) return;

    const match = /^(\S+)\s+(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})\s+(.+)$/.exec(line);
    if (!match) {
      errors.push({
        line: index + 1,
        text: line,
        reason: 'Formato: dia HH:MM-HH:MM Área | Título',
      });
      return;
    }

    const [, dayToken = '', rawStart = '', rawEnd = '', rest = ''] = match;
    const weekday = WEEKDAY_TOKENS[normalize(dayToken).replace(/\.$/, '')];
    const start = rawStart.padStart(5, '0');
    const end = rawEnd.padStart(5, '0');

    if (weekday === undefined) {
      errors.push({
        line: index + 1,
        text: line,
        reason: `Dia "${dayToken}" não reconhecido`,
      });
      return;
    }
    if (!isValidTime(start) || !isValidTime(end) || !isValidRange(start, end)) {
      errors.push({
        line: index + 1,
        text: line,
        reason: 'Horário inválido ou fim antes do início',
      });
      return;
    }

    const [first = '', ...others] = rest.split('|');
    const hasTag = others.length > 0;
    const tag = hasTag ? first.trim() : 'Rotina';
    const title = hasTag ? others.join('|').trim() : first.trim();

    if (title === '') {
      errors.push({
        line: index + 1,
        text: line,
        reason: 'Falta o título do bloco',
      });
      return;
    }

    items.push(createRoutineItem(weekday, title, start, end, tag));
  });

  return { items, errors };
}
