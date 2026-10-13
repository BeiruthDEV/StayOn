import { shiftDate, weekRange } from './clock';
import { createId } from './id';
import { isValidRange, toMinutes } from './timeBlock';

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

/** Limites da importação, para um arquivo grande ou estranho não travar o app. */
export const IMPORT_LIMITS = {
  maxLines: 1000,
  maxItems: 300,
  maxTitle: 60,
  maxTag: 24,
} as const;

const WEEKDAY_WORDS: Record<string, Weekday> = {
  dom: 0,
  domingo: 0,
  seg: 1,
  segunda: 1,
  'segunda-feira': 1,
  ter: 2,
  terca: 2,
  'terca-feira': 2,
  qua: 3,
  quarta: 3,
  'quarta-feira': 3,
  qui: 4,
  quinta: 4,
  'quinta-feira': 4,
  sex: 5,
  sexta: 5,
  'sexta-feira': 5,
  sab: 6,
  sabado: 6,
};

/** Expressões que valem por vários dias. */
const DAY_GROUPS: readonly (readonly [RegExp, readonly Weekday[]])[] = [
  [/^(todos os dias|todo dia|todo o dia|diariamente|diario)\b/, [1, 2, 3, 4, 5, 6, 0]],
  [/^(dias uteis|dia util)\b/, [1, 2, 3, 4, 5]],
  [/^(fim de semana|fins de semana|final de semana)\b/, [6, 0]],
];

const ACCENTS: Record<string, string> = {
  á: 'a',
  à: 'a',
  â: 'a',
  ã: 'a',
  ä: 'a',
  é: 'e',
  è: 'e',
  ê: 'e',
  ë: 'e',
  í: 'i',
  ì: 'i',
  î: 'i',
  ï: 'i',
  ó: 'o',
  ò: 'o',
  ô: 'o',
  õ: 'o',
  ö: 'o',
  ú: 'u',
  ù: 'u',
  û: 'u',
  ü: 'u',
  ç: 'c',
};

/**
 * Minúsculas e sem acento, trocando letra por letra para que cada posição
 * continue apontando para a mesma letra do texto original.
 */
function normalize(text: string): string {
  return text.toLowerCase().replace(/[^\u0000-\u007f]/g, (ch) => ACCENTS[ch] ?? ch);
}

/** Junta acentos que vieram separados da letra (comum em texto de PDF). */
function composeAccents(text: string): string {
  try {
    return text.normalize('NFC');
  } catch {
    return text;
  }
}

/** Dias na ordem seg → dom entre dois dias, inclusive ("seg a sex"). */
function dayRange(from: Weekday, to: Weekday): Weekday[] {
  const order = WEEK_ORDER;
  const start = order.indexOf(from);
  const end = order.indexOf(to);
  if (start <= end) return order.slice(start, end + 1);
  return [...order.slice(start), ...order.slice(0, end + 1)];
}

function dayWord(word: string): Weekday | undefined {
  const clean = word.replace(/[.:;]+$/, '');
  return WEEKDAY_WORDS[clean];
}

/**
 * Lê os dias no começo da linha já normalizada. Aceita "seg", "segunda-feira",
 * "seg, ter e qua", "seg/qua", "seg a sex", "seg-sex", "todos os dias",
 * "dias úteis" e "fim de semana". Devolve os dias e quantos caracteres usou.
 */
function readDays(line: string): { days: Weekday[]; used: number } | undefined {
  for (const [pattern, days] of DAY_GROUPS) {
    const match = pattern.exec(line);
    if (match) return { days: [...days], used: match[0].length };
  }

  const days: Weekday[] = [];
  let pos = 0;
  let pendingRange = false;

  for (;;) {
    const rest = line.slice(pos);
    const word = /^\s*([a-z]+(?:-feira)?\.?)/.exec(rest);
    if (!word) break;
    const day = dayWord(word[1] ?? '');
    if (day === undefined) break;

    if (pendingRange && days.length > 0) {
      const from = days.pop() as Weekday;
      days.push(...dayRange(from, day));
      pendingRange = false;
    } else {
      days.push(day);
    }
    pos += word[0].length;

    const joiner = /^\s*(,|\/|\be\b|\ba\b|\bate\b|-|–)\s*/.exec(line.slice(pos));
    if (!joiner) break;
    const next = /^\s*([a-z]+(?:-feira)?\.?)/.exec(line.slice(pos + joiner[0].length));
    if (!next || dayWord(next[1] ?? '') === undefined) break;
    pendingRange = ['a', 'ate', '-', '–'].includes((joiner[1] ?? '').trim());
    pos += joiner[0].length;
  }

  if (days.length === 0) return undefined;
  const unique = Array.from(new Set(days));
  return { days: unique, used: pos };
}

/** "9", "9h", "09h30", "9:30", "9.30" → "09:30". */
function readTime(hours: string, minutes: string | undefined): string | undefined {
  const h = Number(hours);
  const m = minutes === undefined || minutes === '' ? 0 : Number(minutes);
  if (!Number.isInteger(h) || !Number.isInteger(m) || h > 23 || m > 59) return undefined;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

const TIME_RANGE =
  /^[\s:,-]*(\d{1,2})(?:[:h.](\d{2}))?\s*h?\s*(?:-|–|—|\ba\b|\bas\b|\bate\b|\bto\b)\s*(\d{1,2})(?:[:h.](\d{2}))?\s*h?(?:\s+|\s*[-–—:|]\s*|$)/;

export type ParseError = { line: number; text: string; reason: string };

export type ParseResult = {
  items: RoutineItem[];
  /** Linhas com cara de bloco que não puderam ser lidas, com o motivo. */
  errors: ParseError[];
  /** Linhas que não são blocos (títulos, anotações) e foram puladas. */
  ignored: number;
};

/**
 * Lê uma rotina escrita em texto, um bloco por linha. Aceita escritas comuns:
 *
 *     seg 09:00-12:00 Concurso | Específicos: teoria
 *     segunda-feira 9h às 12h Estudar
 *     seg a sex 7h30 - 9h30 Treino | Academia
 *
 * Um dia sozinho numa linha ("Terça-feira") vale para as linhas seguintes que
 * começam direto pelo horário. Área e título se separam por "|"; sem "|", a
 * área fica "Rotina". Linhas sem dia nem horário (títulos, anotações) são
 * puladas sem erro.
 *
 * O texto é tratado só como dados: nada nele é executado ou interpretado como
 * comando, e só o padrão acima vira bloco.
 */
export function parseRoutineText(text: string): ParseResult {
  const items: RoutineItem[] = [];
  const errors: ParseError[] = [];
  let ignored = 0;
  let contextDays: Weekday[] | undefined;

  const lines = text.split(/\r?\n/).slice(0, IMPORT_LIMITS.maxLines);

  lines.forEach((raw, index) => {
    if (items.length >= IMPORT_LIMITS.maxItems) return;
    const original = composeAccents(raw)
      .replace(/^[\s•·*\-–—]+/, '')
      .trim();
    if (original === '' || original.startsWith('#')) return;
    const line = normalize(original);
    const lineNumber = index + 1;
    const fail = (reason: string) => errors.push({ line: lineNumber, text: original, reason });

    const dayPart = readDays(line);
    const afterDays = dayPart ? line.slice(dayPart.used) : line;

    // linha só com o dia: vale para as próximas
    if (dayPart && /^[\s:.\-–—]*$/.test(afterDays)) {
      contextDays = dayPart.days;
      return;
    }

    const time = TIME_RANGE.exec(afterDays);
    const days = dayPart?.days ?? contextDays;

    if (!time) {
      // um intervalo de horário no meio da linha indica um bloco mal escrito;
      // sem intervalo, é título ou anotação e fica de fora sem erro
      const rangeInside =
        /\d{1,2}(?:[:h.]\d{2})?\s*h?\s*(?:-|–|—|\ba\b|\bas\b|\bate\b)\s*\d{1,2}(?:[:h.]\d{2}|h)/.test(
          afterDays,
        );
      if (dayPart) {
        fail('Faltou o horário depois do dia. Ex.: seg 09:00-12:00');
      } else if (rangeInside) {
        const firstWord = original.split(/\s+/)[0] ?? '';
        fail(`Não reconheci o dia "${firstWord}". Use seg, ter, qua, qui, sex, sáb ou dom`);
      } else {
        ignored += 1;
      }
      return;
    }
    if (!days) {
      fail('Faltou o dia. Ex.: seg 09:00-12:00');
      return;
    }

    const start = readTime(time[1] ?? '', time[2]);
    const end = readTime(time[3] ?? '', time[4]);
    if (!start || !end) {
      fail('Horário inválido. Use de 00:00 a 23:59');
      return;
    }
    if (!isValidRange(start, end)) {
      fail(
        toMinutes(end) < toMinutes(start)
          ? 'O bloco passa da meia-noite. Divida em dois blocos'
          : 'O fim precisa ser depois do início',
      );
      return;
    }

    // o título vem do texto original, com acentos, na mesma posição
    const consumed = (dayPart ? dayPart.used : 0) + time[0].length;
    const rest = original.slice(consumed).trim();
    const [first = '', ...others] = rest.split('|');
    const hasTag = others.length > 0;
    const tag = (hasTag ? first.trim() : 'Rotina').slice(0, IMPORT_LIMITS.maxTag);
    const title = (hasTag ? others.join('|').trim() : first.trim()).slice(
      0,
      IMPORT_LIMITS.maxTitle,
    );

    if (title === '') {
      fail('Faltou o nome do bloco depois do horário');
      return;
    }

    for (const day of days) {
      items.push(createRoutineItem(day, title, start, end, tag || 'Rotina'));
    }
  });

  return { items, errors, ignored };
}

/** Blocos da rotina que se sobrepõem a um horário num dia (exceto `ignoreId`). */
export function overlapping(
  items: readonly RoutineItem[],
  weekday: Weekday,
  start: string,
  end: string,
  ignoreId?: string,
): RoutineItem[] {
  const s = toMinutes(start);
  const e = toMinutes(end);
  return itemsForWeekday(items, weekday).filter(
    (item) => item.id !== ignoreId && toMinutes(item.start) < e && s < toMinutes(item.end),
  );
}

/** Soma minutos a um horário HH:MM; undefined se passar de 23:59. */
export function addMinutes(time: string, minutes: number): string | undefined {
  const total = toMinutes(time) + minutes;
  if (total > 23 * 60 + 59 || total < 0) return undefined;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/**
 * Copia os blocos de um dia para outros. Com `replace`, os blocos que já
 * existiam nos dias de destino saem; sem, os novos se somam a eles.
 */
export function copyDay(
  items: readonly RoutineItem[],
  from: Weekday,
  targets: readonly Weekday[],
  replace: boolean,
): RoutineItem[] {
  const source = itemsForWeekday(items, from);
  const destinations = targets.filter((day) => day !== from);
  const kept = replace ? items.filter((item) => !destinations.includes(item.weekday)) : [...items];
  const copies = destinations.flatMap((day) =>
    source.map((item) => createRoutineItem(day, item.title, item.start, item.end, item.tag)),
  );
  return [...kept, ...copies];
}

/** Áreas já usadas na rotina, das mais frequentes para as menos. */
export function usedTags(items: readonly RoutineItem[]): string[] {
  const count = new Map<string, number>();
  for (const item of items) count.set(item.tag, (count.get(item.tag) ?? 0) + 1);
  return Array.from(count.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag);
}

/**
 * Ao trocar a rotina, mantém o id dos blocos que continuam iguais (mesmo dia,
 * horário e título), para que as marcações já feitas neles não se percam.
 */
export function reuseIds(
  previous: readonly RoutineItem[],
  next: readonly RoutineItem[],
): RoutineItem[] {
  const key = (item: RoutineItem) =>
    `${item.weekday}|${item.start}|${item.end}|${item.title.trim().toLowerCase()}`;
  const available = new Map<string, string[]>();
  for (const item of previous) {
    const ids = available.get(key(item)) ?? [];
    ids.push(item.id);
    available.set(key(item), ids);
  }
  const used = new Set<string>();
  return next.map((item) => {
    if (previous.some((old) => old.id === item.id)) return item;
    const id = available.get(key(item))?.find((candidate) => !used.has(candidate));
    if (!id) return item;
    used.add(id);
    return { ...item, id };
  });
}
