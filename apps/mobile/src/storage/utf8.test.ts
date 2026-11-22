import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { utf8Decode, utf8Encode } from './utf8';

const reference = new TextEncoder();
const referenceDecoder = new TextDecoder();

// Gerador pseudoaleatório fixo: o teste é reproduzível.
let seed = 123456789;
const next = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff);

function randomText(maxLength: number): string {
  let text = '';
  const length = next() % maxLength;
  for (let i = 0; i < length; i += 1) {
    const kind = next() % 6;
    if (kind === 0) text += String.fromCharCode(32 + (next() % 95));
    else if (kind === 1) text += String.fromCharCode(0xa0 + (next() % 0x500));
    else if (kind === 2) text += String.fromCodePoint(0x4e00 + (next() % 0x2000));
    else if (kind === 3) text += String.fromCodePoint(0x1f300 + (next() % 0x300));
    else if (kind === 4) text += String.fromCharCode(0xd800 + (next() % 0x800)); // par substituto solto
    else text += '\n\t"\\';
  }
  return text;
}

describe('utf8Encode', () => {
  it('é idêntico ao TextEncoder em casos conhecidos', () => {
    for (const text of ['', 'a', 'José', 'çãõ', '€', '日本語', '🚀', 'a🚀b', '\u0000', '\ud800', 'x\udc00y']) {
      assert.deepEqual(utf8Encode(text), reference.encode(text), JSON.stringify(text));
    }
  });

  it('é idêntico ao TextEncoder em 3000 textos aleatórios, inclusive com pares substitutos soltos', () => {
    for (let i = 0; i < 3000; i += 1) {
      const text = randomText(40);
      assert.deepEqual(utf8Encode(text), reference.encode(text), JSON.stringify(text));
    }
  });
});

describe('utf8Decode', () => {
  it('desfaz o utf8Encode em textos válidos', () => {
    for (let i = 0; i < 3000; i += 1) {
      const text = randomText(40).toWellFormed();
      assert.equal(utf8Decode(utf8Encode(text)), text);
    }
  });

  it('é idêntico ao TextDecoder em textos válidos', () => {
    for (const text of ['', 'José 🚀 café', '日本語', JSON.stringify([{ t: 'ação' }])]) {
      const bytes = reference.encode(text);
      assert.equal(utf8Decode(bytes), referenceDecoder.decode(bytes));
    }
  });

  it('bytes inválidos viram U+FFFD em vez de lançar', () => {
    assert.equal(utf8Decode(Uint8Array.from([0xff, 0x41])), '�A');
    assert.equal(utf8Decode(Uint8Array.from([0xe2, 0x82])), '��');
    assert.equal(utf8Decode(Uint8Array.from([0xc0, 0x80])), '��');
  });

  it('aguenta textos grandes (500 mil caracteres)', () => {
    const text = 'ação 🚀 '.repeat(62_500);
    assert.equal(utf8Decode(utf8Encode(text)), text);
  });
});
