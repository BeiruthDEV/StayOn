import { xchacha20poly1305 } from '@noble/ciphers/chacha.js';
import { bytesToHex, hexToBytes } from '@noble/ciphers/utils.js';

import { utf8Decode, utf8Encode } from './utf8';

/**
 * Criptografia autenticada dos dados guardados no aparelho.
 *
 * Usa XChaCha20-Poly1305 (biblioteca @noble/ciphers, auditada): além de
 * esconder o conteúdo, detecta qualquer alteração no texto cifrado. O nonce de
 * 24 bytes é aleatório a cada gravação, o que esse algoritmo permite com
 * segurança. O nome da chave de armazenamento entra como dado associado (AAD):
 * um texto cifrado copiado para outra chave deixa de ser aceito.
 *
 * Aqui não há acesso a disco nem a SecureStore, só a função pura.
 */

/** Marca de versão do formato: permite trocar o algoritmo no futuro sem ambiguidade. */
export const ENVELOPE_PREFIX = 'enc1:';

const KEY_BYTES = 32;
const NONCE_BYTES = 24;
const KEY_PATTERN = /^[0-9a-f]{64}$/;
const BODY_PATTERN = /^[0-9a-f]+$/;

/** Fonte de bytes aleatórios criptograficamente seguros (no app: expo-crypto). */
export type RandomBytes = (count: number) => Uint8Array;

function randomOrThrow(random: RandomBytes, count: number): Uint8Array {
  const bytes = random(count);
  if (bytes.length !== count) throw new Error('Gerador aleatório devolveu tamanho errado.');
  return bytes;
}

function keyBytes(keyHex: string): Uint8Array {
  if (!KEY_PATTERN.test(keyHex)) throw new Error('Chave de criptografia inválida.');
  return hexToBytes(keyHex);
}

/** Nova chave de 256 bits, em hexadecimal (64 caracteres). */
export function generateKey(random: RandomBytes): string {
  return bytesToHex(randomOrThrow(random, KEY_BYTES));
}

/** Verdadeiro se o texto tem a marca do formato cifrado (não garante que seja válido). */
export function isEncrypted(stored: string): boolean {
  return stored.startsWith(ENVELOPE_PREFIX);
}

/** Cifra `plain`. `context` é o nome da chave de armazenamento (autenticado, não secreto). */
export function encryptText(
  plain: string,
  keyHex: string,
  context: string,
  random: RandomBytes,
): string {
  const key = keyBytes(keyHex);
  const nonce = randomOrThrow(random, NONCE_BYTES);

  const sealed = xchacha20poly1305(key, nonce, utf8Encode(context)).encrypt(utf8Encode(plain));
  return `${ENVELOPE_PREFIX}${bytesToHex(nonce)}${bytesToHex(sealed)}`;
}

/**
 * Decifra. Devolve `null` para qualquer problema com o dado: formato errado,
 * adulterado, chave errada ou contexto diferente. Chave malformada é erro de
 * configuração e lança.
 */
export function decryptText(stored: string, keyHex: string, context: string): string | null {
  const key = keyBytes(keyHex);
  if (!isEncrypted(stored)) return null;

  const body = stored.slice(ENVELOPE_PREFIX.length);
  // Nonce + pelo menos o selo de autenticação (16 bytes).
  if (body.length % 2 !== 0 || !BODY_PATTERN.test(body) || body.length < (NONCE_BYTES + 16) * 2) {
    return null;
  }

  try {
    const bytes = hexToBytes(body);
    const nonce = bytes.slice(0, NONCE_BYTES);
    const sealed = bytes.slice(NONCE_BYTES);

    return utf8Decode(xchacha20poly1305(key, nonce, utf8Encode(context)).decrypt(sealed));
  } catch {
    return null;
  }
}
