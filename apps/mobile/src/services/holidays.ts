import { isValidHolidayYear, parseHolidays, type Holiday } from '@/domain/holiday';

import { cached } from '@/storage';

import { ApiError, getJson } from './api';

/** Feriados nacionais de um ano, vindos da BrasilAPI. */
export function fetchHolidays(year: number, signal?: AbortSignal): Promise<Holiday[]> {
  // O ano entra na URL: só número inteiro dentro do intervalo da API passa.
  if (!isValidHolidayYear(year)) {
    return Promise.reject(new ApiError('http', 'Ano fora do intervalo disponível.', 404));
  }

  return getJson(`/feriados/v1/${year}`, parseHolidays, signal ? { signal } : {});
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Feriados com cache de 24 h: mudam raramente, então não vale gastar rede a
 * cada abertura, e a lista continua disponível sem internet.
 */
export function getHolidays(year: number, options: { force?: boolean; signal?: AbortSignal } = {}) {
  return cached({
    name: `holidays:${year}`,
    ttlMs: ONE_DAY_MS,
    force: options.force ?? false,
    fetcher: () => fetchHolidays(year, options.signal),
    validate: parseHolidays,
  });
}
