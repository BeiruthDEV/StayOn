/**
 * Conversão texto <-> bytes UTF-8 sem depender de `TextEncoder`/`TextDecoder`,
 * que variam conforme o motor JavaScript do aparelho. Se faltassem, a
 * criptografia falharia e nada seria salvo.
 *
 * O resultado é idêntico ao da implementação padrão (validado nos testes):
 * caracteres isolados de par substituto viram U+FFFD, como no TextEncoder.
 */

export function utf8Encode(text: string): Uint8Array {
  const out: number[] = [];

  for (let i = 0; i < text.length; i += 1) {
    let cp = text.charCodeAt(i);

    if (cp >= 0xd800 && cp <= 0xdbff && i + 1 < text.length) {
      const next = text.charCodeAt(i + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        cp = 0x10000 + ((cp - 0xd800) << 10) + (next - 0xdc00);
        i += 1;
      }
    }
    if (cp >= 0xd800 && cp <= 0xdfff) cp = 0xfffd;

    if (cp < 0x80) {
      out.push(cp);
    } else if (cp < 0x800) {
      out.push(0xc0 | (cp >> 6), 0x80 | (cp & 0x3f));
    } else if (cp < 0x10000) {
      out.push(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
    } else {
      out.push(
        0xf0 | (cp >> 18),
        0x80 | ((cp >> 12) & 0x3f),
        0x80 | ((cp >> 6) & 0x3f),
        0x80 | (cp & 0x3f),
      );
    }
  }

  return Uint8Array.from(out);
}

function isContinuation(byte: number | undefined): byte is number {
  return byte !== undefined && (byte & 0xc0) === 0x80;
}

/** Decodifica UTF-8. Sequência inválida vira U+FFFD (o dado já vem autenticado, então é raro). */
export function utf8Decode(bytes: Uint8Array): string {
  const parts: string[] = [];
  let i = 0;

  while (i < bytes.length) {
    const first = bytes[i] as number;
    let cp = 0xfffd;
    let length = 1;

    if (first < 0x80) {
      cp = first;
    } else if (first >= 0xc2 && first <= 0xdf && isContinuation(bytes[i + 1])) {
      cp = ((first & 0x1f) << 6) | ((bytes[i + 1] as number) & 0x3f);
      length = 2;
    } else if (
      first >= 0xe0 &&
      first <= 0xef &&
      isContinuation(bytes[i + 1]) &&
      isContinuation(bytes[i + 2])
    ) {
      const value =
        ((first & 0x0f) << 12) |
        (((bytes[i + 1] as number) & 0x3f) << 6) |
        ((bytes[i + 2] as number) & 0x3f);
      // Recusa sequência longa demais para o valor (overlong) e pares substitutos.
      if (value >= 0x800 && !(value >= 0xd800 && value <= 0xdfff)) {
        cp = value;
        length = 3;
      }
    } else if (
      first >= 0xf0 &&
      first <= 0xf4 &&
      isContinuation(bytes[i + 1]) &&
      isContinuation(bytes[i + 2]) &&
      isContinuation(bytes[i + 3])
    ) {
      const value =
        ((first & 0x07) << 18) |
        (((bytes[i + 1] as number) & 0x3f) << 12) |
        (((bytes[i + 2] as number) & 0x3f) << 6) |
        ((bytes[i + 3] as number) & 0x3f);
      if (value >= 0x10000 && value <= 0x10ffff) {
        cp = value;
        length = 4;
      }
    }

    parts.push(String.fromCodePoint(cp));
    i += length;
  }

  return parts.join('');
}
