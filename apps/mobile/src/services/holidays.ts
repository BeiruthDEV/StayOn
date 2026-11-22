import { isValidHolidayYear, parseHolidays, type Holiday } from '@/domain/holiday';

import { ApiError, getJson } from './api';

/** Feriados nacionais de um ano, vindos da BrasilAPI. */
export function fetchHolidays(year: number, signal?: AbortSignal): Promise<Holiday[]> {
  // O ano entra na URL: só número inteiro dentro do intervalo da API passa.
  if (!isValidHolidayYear(year)) {
    return Promise.reject(new ApiError('http', 'Ano fora do intervalo disponível.', 404));
  }

  return getJson(`/feriados/v1/${year}`, parseHolidays, signal ? { signal } : {});
}
