import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { describe, it } from 'node:test';

import { decryptText, encryptText, ENVELOPE_PREFIX, generateKey, isEncrypted } from './crypto';

const random = (count: number) => new Uint8Array(randomBytes(count));
const key = generateKey(random);
const other = generateKey(random);
const CTX = 'stayon:tasks';

describe('generateKey', () => {
  it('gera 256 bits em hexadecimal e uma chave diferente a cada vez', () => {
    assert.match(key, /^[0-9a-f]{64}$/);
    assert.notEqual(key, other);
  });

  it('recusa um gerador aleatório que devolve tamanho errado', () => {
    assert.throws(() => generateKey(() => new Uint8Array(8)), /tamanho errado/);
  });
});

describe('encryptText / decryptText', () => {
  it('devolve o texto original, inclusive acentos, emoji e JSON', () => {
    for (const plain of ['', 'Estudar Spring Boot', 'José 🚀 café', JSON.stringify([{ id: 'a', done: true }])]) {
      const sealed = encryptText(plain, key, CTX, random);
      assert.equal(decryptText(sealed, key, CTX), plain);
    }
  });

  it('não deixa o conteúdo legível no texto cifrado', () => {
    const sealed = encryptText('minha reflexão secreta', key, CTX, random);
    assert.ok(sealed.startsWith(ENVELOPE_PREFIX));
    assert.equal(sealed.includes('reflexão'), false);
    assert.equal(sealed.includes(Buffer.from('minha reflexão secreta').toString('hex')), false);
  });

  it('o mesmo texto gera cifras diferentes (nonce aleatório)', () => {
    const a = encryptText('igual', key, CTX, random);
    const b = encryptText('igual', key, CTX, random);
    assert.notEqual(a, b);
  });

  it('recusa chave errada', () => {
    const sealed = encryptText('segredo', key, CTX, random);
    assert.equal(decryptText(sealed, other, CTX), null);
  });

  it('recusa o mesmo texto cifrado em outra chave de armazenamento', () => {
    const sealed = encryptText('segredo', key, 'stayon:tasks', random);
    assert.equal(decryptText(sealed, key, 'stayon:habits'), null);
  });

  it('detecta a alteração de qualquer byte', () => {
    const sealed = encryptText('segredo importante', key, CTX, random);
    for (let i = ENVELOPE_PREFIX.length; i < sealed.length; i += 7) {
      const flipped = sealed[i] === '0' ? '1' : '0';
      const tampered = sealed.slice(0, i) + flipped + sealed.slice(i + 1);
      assert.equal(decryptText(tampered, key, CTX), null, `posição ${i}`);
    }
  });

  it('recusa texto truncado, vazio, sem marca ou com caracteres fora do hexadecimal', () => {
    const sealed = encryptText('segredo', key, CTX, random);
    for (const bad of [sealed.slice(0, -2), sealed.slice(0, 20), ENVELOPE_PREFIX, '', '{"json":"puro"}', `${ENVELOPE_PREFIX}zz${'0'.repeat(100)}`, sealed + '0']) {
      assert.equal(decryptText(bad, key, CTX), null, bad.slice(0, 30));
    }
  });

  it('chave malformada é erro de configuração, não "dado corrompido"', () => {
    assert.throws(() => encryptText('x', 'curta', CTX, random), /inválida/);
    assert.throws(() => decryptText(encryptText('x', key, CTX, random), 'curta', CTX), /inválida/);
  });
});

describe('isEncrypted', () => {
  it('reconhece só a marca do formato', () => {
    assert.equal(isEncrypted(encryptText('x', key, CTX, random)), true);
    assert.equal(isEncrypted('[{"id":1}]'), false);
  });
});
