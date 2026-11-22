import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  daysBetween,
  distanceLabel,
  isIsoDate,
  isValidHolidayYear,
  nextHoliday,
  parseHolidays,
} from './holiday';

const carnaval1 = { date: '2026-02-16', name: 'Carnaval', type: 'national', weekday: 'segunda-feira' };
const carnaval2 = { date: '2026-02-17', name: 'Carnaval', type: 'national', weekday: 'terça-feira' };
const natal = { date: '2026-12-25', name: 'Natal', type: 'national', weekday: 'sexta-feira' };

describe('isIsoDate', () => {
  it('aceita datas reais, inclusive 29/02 de ano bissexto', () => {
    assert.equal(isIsoDate('2026-09-07'), true);
    assert.equal(isIsoDate('2024-02-29'), true);
  });

  it('recusa datas impossíveis e formatos diferentes', () => {
    for (const value of ['2026-02-31', '2025-02-29', '2026-13-01', '2026-00-10', '26-09-07', '2026-9-7', '2026-09-07T10:00', '', '2026-09-07; DROP TABLE']) {
      assert.equal(isIsoDate(value), false, value);
    }
  });

  it('recusa o que não é texto', () => {
    for (const value of [undefined, null, 20260907, {}, ['2026-09-07']]) {
      assert.equal(isIsoDate(value), false);
    }
  });
});

describe('isValidHolidayYear', () => {
  it('respeita o intervalo da API (1900 a 2199) e só aceita inteiros', () => {
    assert.equal(isValidHolidayYear(1900), true);
    assert.equal(isValidHolidayYear(2199), true);
    assert.equal(isValidHolidayYear(1899), false);
    assert.equal(isValidHolidayYear(2200), false);
    assert.equal(isValidHolidayYear(2026.5), false);
    assert.equal(isValidHolidayYear(Number.NaN), false);
  });
});

describe('parseHolidays', () => {
  it('lê o formato da API e ordena por data', () => {
    const parsed = parseHolidays([natal, carnaval2, carnaval1]);
    assert.deepEqual(parsed?.map((holiday) => holiday.date), ['2026-02-16', '2026-02-17', '2026-12-25']);
  });

  it('mantém feriados com o mesmo nome, porque a data é o identificador', () => {
    assert.equal(parseHolidays([carnaval1, carnaval2])?.length, 2);
  });

  it('ignora campos extras e apara espaços do nome', () => {
    const parsed = parseHolidays([{ ...natal, name: '  Natal  ', extra: 'x' }]);
    assert.equal(parsed?.[0]?.name, 'Natal');
    assert.equal('extra' in (parsed?.[0] ?? {}), false);
  });

  it('falha fechada: qualquer item inválido recusa a resposta inteira', () => {
    assert.equal(parseHolidays([natal, { ...natal, date: '2026-02-31' }]), null);
    assert.equal(parseHolidays([natal, { date: '2026-01-01' }]), null);
    assert.equal(parseHolidays([natal, null]), null);
    assert.equal(parseHolidays([{ ...natal, name: '' }]), null);
    assert.equal(parseHolidays([{ ...natal, name: 'x'.repeat(81) }]), null);
  });

  it('recusa o que não é lista ou é grande demais', () => {
    assert.equal(parseHolidays({ message: 'erro' }), null);
    assert.equal(parseHolidays('texto'), null);
    assert.equal(parseHolidays(null), null);
    assert.equal(parseHolidays(Array.from({ length: 101 }, () => natal)), null);
  });

  it('aceita lista vazia (a tela mostra o estado vazio)', () => {
    assert.deepEqual(parseHolidays([]), []);
  });
});

describe('nextHoliday', () => {
  const list = [carnaval1, carnaval2, natal];

  it('devolve o primeiro de hoje em diante, contando o próprio dia', () => {
    assert.equal(nextHoliday(list, '2026-02-17')?.date, '2026-02-17');
    assert.equal(nextHoliday(list, '2026-03-01')?.date, '2026-12-25');
  });

  it('devolve undefined quando o ano acabou', () => {
    assert.equal(nextHoliday(list, '2026-12-26'), undefined);
  });
});

describe('daysBetween e distanceLabel', () => {
  it('conta dias sem se confundir com horário de verão ou ano bissexto', () => {
    assert.equal(daysBetween('2026-03-01', '2026-03-02'), 1);
    assert.equal(daysBetween('2024-02-28', '2024-03-01'), 2);
    assert.equal(daysBetween('2026-12-31', '2027-01-01'), 1);
    assert.equal(daysBetween('2026-09-07', '2026-09-07'), 0);
  });

  it('descreve a distância em português', () => {
    assert.equal(distanceLabel('2026-09-07', '2026-09-07'), 'Hoje');
    assert.equal(distanceLabel('2026-09-06', '2026-09-07'), 'Amanhã');
    assert.equal(distanceLabel('2026-09-08', '2026-09-07'), 'Ontem');
    assert.equal(distanceLabel('2026-09-01', '2026-09-07'), 'Em 6 dias');
    assert.equal(distanceLabel('2026-09-10', '2026-09-07'), 'Há 3 dias');
  });
});
