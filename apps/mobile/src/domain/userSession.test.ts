import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { MAX_NAME_LENGTH, normalizeName, parseSession } from './userSession';

describe('normalizeName', () => {
  it('apara e junta espaços repetidos', () => {
    assert.equal(normalizeName('  Ana   Maria  '), 'Ana Maria');
  });

  it('troca caracteres de controle por espaço', () => {
    assert.equal(normalizeName('Ana\u0000\nMaria\t'), 'Ana Maria');
  });

  it('recusa vazio e só espaços', () => {
    assert.equal(normalizeName(''), null);
    assert.equal(normalizeName('   \n\t '), null);
  });

  it(`aceita até ${MAX_NAME_LENGTH} caracteres e recusa mais que isso`, () => {
    assert.equal(normalizeName('a'.repeat(MAX_NAME_LENGTH)), 'a'.repeat(MAX_NAME_LENGTH));
    assert.equal(normalizeName('a'.repeat(MAX_NAME_LENGTH + 1)), null);
  });

  it('mantém acentos e emoji', () => {
    assert.equal(normalizeName('José 🚀'), 'José 🚀');
  });
});

describe('parseSession', () => {
  it('aceita uma sessão bem formada', () => {
    assert.deepEqual(parseSession({ name: 'Ana', signedInAt: 1 }), { name: 'Ana', signedInAt: 1 });
  });

  it('trata dado corrompido ou adulterado como "sem sessão"', () => {
    for (const value of [
      null,
      undefined,
      'Ana',
      42,
      [],
      {},
      { name: 'Ana' },
      { name: 7, signedInAt: 1 },
      { name: 'Ana', signedInAt: '1' },
      { name: '', signedInAt: 1 },
      { name: '  Ana  ', signedInAt: 1 },
      { name: 'a'.repeat(500), signedInAt: 1 },
    ]) {
      assert.equal(parseSession(value), null, JSON.stringify(value));
    }
  });
});
