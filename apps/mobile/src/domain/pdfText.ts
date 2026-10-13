/**
 * Extração de texto de PDF, em JavaScript puro, para a importação da rotina.
 *
 * Segurança: o arquivo é tratado só como dados. Este módulo lê os bytes,
 * descompacta os trechos de texto e devolve uma string. Nada do arquivo é
 * executado, interpretado como comando, aberto (links, anexos, scripts,
 * formulários) ou enviado para fora do aparelho. O texto resultante passa
 * depois pelo mesmo leitor de linhas da importação por texto colado, que só
 * reconhece o padrão "dia horário título".
 *
 * Limites contra arquivos malformados ou feitos para travar o app: tamanho
 * máximo de entrada, de dados descompactados, de objetos e de texto.
 *
 * Cobre os PDFs comuns de texto (exportados do Google Docs, Word, "Salvar como
 * PDF" do navegador). PDF escaneado (imagem) não tem texto e devolve vazio.
 */
import { Inflate } from 'pako';

export const PDF_LIMITS = {
  /** Tamanho máximo do arquivo. */
  maxInputBytes: 5 * 1024 * 1024,
  /** Soma máxima de dados descompactados, contra "bomba de compressão". */
  maxInflatedBytes: 20 * 1024 * 1024,
  /** Número máximo de objetos lidos. */
  maxObjects: 20000,
  /** Tamanho máximo do texto devolvido. */
  maxTextChars: 200000,
} as const;

export class PdfTextError extends Error {}

type PdfObject = {
  dict: string;
  stream?: Uint8Array;
};

type Budget = { inflated: number };

/** Bytes → string em que cada caractere é um byte (latin1). */
function bytesToLatin1(bytes: Uint8Array, start = 0, end = bytes.length): string {
  let out = '';
  const CHUNK = 8192;
  for (let i = start; i < end; i += CHUNK) {
    const slice = bytes.subarray(i, Math.min(end, i + CHUNK));
    out += String.fromCharCode.apply(null, Array.from(slice));
  }
  return out;
}

function decodeAscii85(data: Uint8Array): Uint8Array {
  const out: number[] = [];
  let group: number[] = [];
  const flush = (count: number) => {
    let value = 0;
    for (let k = 0; k < 5; k += 1) value = value * 85 + (group[k] ?? 84);
    for (let k = 0; k < count - 1; k += 1) out.push((value >>> (24 - 8 * k)) & 0xff);
  };
  for (let i = 0; i < data.length; i += 1) {
    const c = data[i] ?? 0;
    if (c === 0x7e) break; // ~> fim
    if (c <= 0x20) continue;
    if (c === 0x7a && group.length === 0) {
      out.push(0, 0, 0, 0);
      continue;
    }
    group.push(c - 33);
    if (group.length === 5) {
      flush(5);
      group = [];
    }
  }
  if (group.length > 0) flush(group.length);
  return Uint8Array.from(out);
}

function decodeAsciiHex(data: Uint8Array): Uint8Array {
  const hex =
    bytesToLatin1(data)
      .replace(/[^0-9A-Fa-f>]/g, '')
      .split('>')[0] ?? '';
  const even = hex.length % 2 === 1 ? `${hex}0` : hex;
  const out = new Uint8Array(even.length / 2);
  for (let k = 0; k < out.length; k += 1) out[k] = parseInt(even.slice(k * 2, k * 2 + 2), 16);
  return out;
}

class InflateLimitError extends Error {}

/**
 * Descompacta em pedaços e para assim que passar do limite, sem chegar a
 * alocar o arquivo inteiro (proteção contra "bomba de compressão").
 * Dados a mais depois do fim do zlib são ignorados.
 */
function inflateLimited(data: Uint8Array, budget: Budget): Uint8Array | undefined {
  const chunks: Uint8Array[] = [];
  let size = 0;
  const inflator = new Inflate({ chunkSize: 64 * 1024 });
  inflator.onData = (chunk) => {
    const piece = chunk as Uint8Array;
    size += piece.length;
    if (budget.inflated + size > PDF_LIMITS.maxInflatedBytes) throw new InflateLimitError();
    chunks.push(piece.slice());
  };
  inflator.onEnd = () => undefined;
  try {
    inflator.push(data, true);
  } catch (error) {
    if (error instanceof InflateLimitError) {
      throw new PdfTextError('O PDF tem dados demais para ler.');
    }
  }
  if (size === 0) return undefined;
  budget.inflated += size;
  const out = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

function decodeStream(obj: PdfObject, budget: Budget): string | undefined {
  if (!obj.stream) return undefined;
  const filter = /\/Filter\s*(\[[^\]]*\]|\/\w+)/.exec(obj.dict)?.[1] ?? '';
  const filters = filter.match(/\/\w+/g) ?? [];

  let data: Uint8Array = obj.stream;
  for (const name of filters) {
    if (name === '/ASCII85Decode' || name === '/A85') {
      data = decodeAscii85(data);
    } else if (name === '/ASCIIHexDecode' || name === '/AHx') {
      data = decodeAsciiHex(data);
    } else if (name === '/FlateDecode' || name === '/Fl') {
      const inflated = inflateLimited(data, budget);
      if (!inflated) return undefined;
      data = inflated;
    } else {
      // imagens e outros filtros não têm texto
      return undefined;
    }
  }
  return bytesToLatin1(data);
}

/** Encontra o fim de um dicionário << >> começando em `start` (que aponta para "<<"). */
function matchDict(text: string, start: number): number {
  let depth = 0;
  for (let i = start; i < text.length - 1; i += 1) {
    if (text[i] === '<' && text[i + 1] === '<') {
      depth += 1;
      i += 1;
    } else if (text[i] === '>' && text[i + 1] === '>') {
      depth -= 1;
      i += 1;
      if (depth === 0) return i + 1;
    } else if (text[i] === '(') {
      // pula strings literais, que podem conter << >>
      let level = 1;
      i += 1;
      while (i < text.length && level > 0) {
        if (text[i] === '\\') i += 1;
        else if (text[i] === '(') level += 1;
        else if (text[i] === ')') level -= 1;
        i += 1;
      }
      i -= 1;
    }
  }
  return text.length;
}

/** Valor de uma chave num dicionário: referência "n g R", dicionário, array ou número. */
function dictValue(dict: string, key: string): string | undefined {
  const re = new RegExp(`\\/${key}(?![A-Za-z0-9])\\s*`, 'g');
  const match = re.exec(dict);
  if (!match) return undefined;
  const at = match.index + match[0].length;

  if (dict.startsWith('<<', at)) return dict.slice(at, matchDict(dict, at));
  if (dict[at] === '[') {
    const end = dict.indexOf(']', at);
    return dict.slice(at, end === -1 ? dict.length : end + 1);
  }
  const ref = /^(\d+)\s+(\d+)\s+R/.exec(dict.slice(at, at + 32));
  if (ref) return ref[0];
  const word = /^[^\s/<>[\]()]+/.exec(dict.slice(at, at + 64));
  return word?.[0];
}

function refNumber(value: string | undefined): number | undefined {
  const match = /^(\d+)\s+\d+\s+R/.exec(value ?? '');
  return match ? Number(match[1]) : undefined;
}

function refList(value: string | undefined): number[] {
  if (!value) return [];
  return Array.from(value.matchAll(/(\d+)\s+\d+\s+R/g), (m) => Number(m[1]));
}

/** Lê todos os objetos do arquivo, inclusive os guardados em object streams. */
function readObjects(bytes: Uint8Array, src: string, budget: Budget): Map<number, PdfObject> {
  const objects = new Map<number, PdfObject>();
  const header = /(\d+)\s+(\d+)\s+obj\b/g;
  let match: RegExpExecArray | null;

  while ((match = header.exec(src)) !== null) {
    if (objects.size >= PDF_LIMITS.maxObjects) break;
    const num = Number(match[1]);
    const bodyStart = match.index + match[0].length;
    const endObj = src.indexOf('endobj', bodyStart);
    const bodyEnd = endObj === -1 ? src.length : endObj;
    const streamAt = src.indexOf('stream', bodyStart);

    if (streamAt !== -1 && streamAt < bodyEnd && src.slice(bodyStart, streamAt).includes('<<')) {
      const dict = src.slice(bodyStart, streamAt);
      let dataStart = streamAt + 'stream'.length;
      if (src[dataStart] === '\r') dataStart += 1;
      if (src[dataStart] === '\n') dataStart += 1;
      const length = Number(/\/Length\s+(\d+)(?!\s+\d+\s+R)/.exec(dict)?.[1]);
      let dataEnd =
        Number.isFinite(length) && length > 0 && dataStart + length <= src.length
          ? dataStart + length
          : src.indexOf('endstream', dataStart);
      if (dataEnd === -1) dataEnd = bodyEnd;
      // sem /Length direto, o fim é o "endstream", que vem depois de uma quebra de linha
      if (!(Number.isFinite(length) && length > 0)) {
        if (src[dataEnd - 1] === '\n') dataEnd -= 1;
        if (src[dataEnd - 1] === '\r') dataEnd -= 1;
      }
      objects.set(num, { dict, stream: bytes.subarray(dataStart, dataEnd) });
      header.lastIndex = Math.max(header.lastIndex, dataEnd);
    } else {
      objects.set(num, { dict: src.slice(bodyStart, bodyEnd) });
    }
  }

  // Object streams (/Type /ObjStm) guardam vários objetos compactados.
  for (const obj of Array.from(objects.values())) {
    if (!/\/Type\s*\/ObjStm/.test(obj.dict)) continue;
    const content = decodeStream(obj, budget);
    if (content === undefined) continue;
    const count = Number(dictValue(obj.dict, 'N'));
    const first = Number(dictValue(obj.dict, 'First'));
    if (!Number.isFinite(count) || !Number.isFinite(first)) continue;

    const pairs = content.slice(0, first).trim().split(/\s+/).map(Number);
    for (let i = 0; i < count && i * 2 + 1 < pairs.length; i += 1) {
      const num = pairs[i * 2] ?? -1;
      const offset = first + (pairs[i * 2 + 1] ?? 0);
      const next = i + 1 < count ? first + (pairs[i * 2 + 3] ?? content.length) : content.length;
      if (!objects.has(num)) objects.set(num, { dict: content.slice(offset, next) });
      if (objects.size >= PDF_LIMITS.maxObjects) break;
    }
  }

  return objects;
}

/** Mapa de código → texto de uma fonte, a partir do CMap /ToUnicode. */
type CharMap = { bytes: 1 | 2; map: Map<number, string> };

/** O que importa de uma fonte para extrair texto: códigos → texto e larguras. */
type FontInfo = {
  bytes: 1 | 2;
  map: Map<number, string>;
  /** Largura de cada código, em milésimos do corpo da fonte. */
  widths: Map<number, number>;
  defaultWidth: number;
};

function hexToUnicode(hex: string): string {
  if (hex.length <= 2) return hex ? String.fromCharCode(parseInt(hex, 16)) : '';
  let out = '';
  for (let i = 0; i + 4 <= hex.length; i += 4) {
    out += String.fromCharCode(parseInt(hex.slice(i, i + 4), 16));
  }
  return out;
}

function parseToUnicode(cmap: string): CharMap {
  const map = new Map<number, string>();
  const codespace = /begincodespacerange\s*<([0-9A-Fa-f]+)>/.exec(cmap);
  const bytes: 1 | 2 = codespace && codespace[1] && codespace[1].length > 2 ? 2 : 1;

  for (const block of cmap.matchAll(/beginbfchar([\s\S]*?)endbfchar/g)) {
    for (const pair of (block[1] ?? '').matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]*)>/g)) {
      map.set(parseInt(pair[1] ?? '0', 16), hexToUnicode(pair[2] ?? ''));
    }
  }

  for (const block of cmap.matchAll(/beginbfrange([\s\S]*?)endbfrange/g)) {
    const body = block[1] ?? '';
    for (const range of body.matchAll(
      /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*(<([0-9A-Fa-f]*)>|\[([^\]]*)\])/g,
    )) {
      const lo = parseInt(range[1] ?? '0', 16);
      const hi = Math.min(parseInt(range[2] ?? '0', 16), lo + 0xffff);
      if (range[4] !== undefined) {
        const base = range[4];
        const head = base.length > 4 ? hexToUnicode(base.slice(0, -4)) : '';
        const last = parseInt(base.slice(-4) || '0', 16);
        for (let code = lo; code <= hi; code += 1) {
          map.set(code, head + String.fromCharCode(last + (code - lo)));
        }
      } else if (range[5] !== undefined) {
        const items = Array.from(range[5].matchAll(/<([0-9A-Fa-f]*)>/g), (m) => m[1] ?? '');
        items.forEach((hex, index) => map.set(lo + index, hexToUnicode(hex)));
      }
    }
  }

  return { bytes, map };
}

/** Números de um array PDF, resolvendo referência indireta. */
function numberArray(value: string | undefined, objects: Map<number, PdfObject>): string {
  const ref = refNumber(value);
  const raw = ref !== undefined ? (objects.get(ref)?.dict ?? '') : (value ?? '');
  return raw;
}

/** Larguras do /W de uma fonte CID: "c [w1 w2 …]" ou "cIni cFim w". */
function parseCidWidths(w: string, widths: Map<number, number>): void {
  const tokens =
    w
      .replace(/^\s*\[/, '')
      .replace(/\]\s*$/, '')
      .match(/\[[^\]]*\]|[-+]?\d*\.?\d+/g) ?? [];
  let i = 0;
  while (i < tokens.length && widths.size < 70000) {
    const first = Number(tokens[i]);
    const next = tokens[i + 1] ?? '';
    if (next.startsWith('[')) {
      const list = next.match(/[-+]?\d*\.?\d+/g) ?? [];
      list.forEach((value, index) => widths.set(first + index, Number(value)));
      i += 2;
    } else {
      const last = Number(next);
      const value = Number(tokens[i + 2]);
      for (let code = first; code <= last && code - first < 70000; code += 1)
        widths.set(code, value);
      i += 3;
    }
  }
}

function readFont(
  fontObj: PdfObject | undefined,
  objects: Map<number, PdfObject>,
  budget: Budget,
): FontInfo {
  const info: FontInfo = { bytes: 1, map: new Map(), widths: new Map(), defaultWidth: 500 };
  if (!fontObj) return info;
  const dict = fontObj.dict;

  const toUnicode = refNumber(dictValue(dict, 'ToUnicode'));
  const stream = toUnicode !== undefined ? objects.get(toUnicode) : undefined;
  const cmap = stream ? decodeStream(stream, budget) : undefined;
  if (cmap) {
    const parsed = parseToUnicode(cmap);
    info.map = parsed.map;
    info.bytes = parsed.bytes;
  }

  if (/\/Subtype\s*\/Type0/.test(dict)) {
    info.bytes = 2;
    const descendant = refList(dictValue(dict, 'DescendantFonts'))[0];
    const cid = descendant !== undefined ? objects.get(descendant)?.dict : undefined;
    if (cid) {
      info.defaultWidth = Number(dictValue(cid, 'DW') ?? 1000) || 1000;
      parseCidWidths(numberArray(dictValue(cid, 'W'), objects), info.widths);
    } else {
      info.defaultWidth = 1000;
    }
  } else {
    const firstChar = Number(dictValue(dict, 'FirstChar') ?? 0) || 0;
    const list = numberArray(dictValue(dict, 'Widths'), objects).match(/[-+]?\d*\.?\d+/g) ?? [];
    list.forEach((value, index) => info.widths.set(firstChar + index, Number(value)));
  }
  return info;
}

/** Caracteres de 0x80–0x9F do WinAnsiEncoding que diferem do latin1. */
const WIN_ANSI: Record<number, string> = {
  0x91: '‘',
  0x92: '’',
  0x93: '“',
  0x94: '”',
  0x95: '•',
  0x96: '–',
  0x97: '—',
  0x85: '…',
};

/** Texto mostrado e a largura dele, em milésimos do corpo da fonte. */
function decodeShown(raw: string, font: FontInfo | undefined): { text: string; width: number } {
  const step = font?.bytes ?? 1;
  let text = '';
  let width = 0;
  for (let i = 0; i + step - 1 < raw.length; i += step) {
    const code = step === 2 ? raw.charCodeAt(i) * 256 + raw.charCodeAt(i + 1) : raw.charCodeAt(i);
    width += font?.widths.get(code) ?? font?.defaultWidth ?? 500;
    if (font && font.map.size > 0) {
      text += font.map.get(code) ?? '';
    } else {
      text += WIN_ANSI[code] ?? (code >= 0x20 || code === 0x09 ? String.fromCharCode(code) : '');
    }
  }
  return { text, width };
}

type Token =
  | { kind: 'num'; value: number }
  | { kind: 'name'; value: string }
  | { kind: 'str'; value: string }
  | { kind: 'array'; value: Token[] }
  | { kind: 'op'; value: string };

/** Lê uma string literal ( ... ) a partir de `i` (que aponta para o "("). */
function readLiteral(text: string, i: number): [string, number] {
  let out = '';
  let level = 1;
  let j = i + 1;
  while (j < text.length && level > 0) {
    const ch = text[j] ?? '';
    if (ch === '\\') {
      const next = text[j + 1] ?? '';
      const escapes: Record<string, string> = { n: '\n', r: '\r', t: '\t', b: '\b', f: '\f' };
      if (escapes[next] !== undefined) {
        out += escapes[next];
        j += 2;
      } else if (/[0-7]/.test(next)) {
        const oct = /^[0-7]{1,3}/.exec(text.slice(j + 1, j + 4))?.[0] ?? '0';
        out += String.fromCharCode(parseInt(oct, 8) & 0xff);
        j += 1 + oct.length;
      } else if (next === '\r' || next === '\n') {
        j += next === '\r' && text[j + 2] === '\n' ? 3 : 2;
      } else {
        out += next;
        j += 2;
      }
      continue;
    }
    if (ch === '(') level += 1;
    if (ch === ')') {
      level -= 1;
      if (level === 0) break;
    }
    out += ch;
    j += 1;
  }
  return [out, j + 1];
}

function readHex(text: string, i: number): [string, number] {
  const end = text.indexOf('>', i);
  const hex = text.slice(i + 1, end === -1 ? text.length : end).replace(/\s+/g, '');
  const even = hex.length % 2 === 1 ? `${hex}0` : hex;
  let out = '';
  for (let k = 0; k < even.length; k += 2)
    out += String.fromCharCode(parseInt(even.slice(k, k + 2), 16));
  return [out, end === -1 ? text.length : end + 1];
}

/** Percorre um content stream e chama `onOp` para cada operador com seus operandos. */
function scanContent(text: string, onOp: (op: string, args: Token[]) => void): void {
  const stack: Token[][] = [[]];
  let i = 0;

  while (i < text.length) {
    const ch = text[i] ?? '';
    const current = stack[stack.length - 1] ?? [];

    if (/\s/.test(ch)) {
      i += 1;
    } else if (ch === '%') {
      const nl = text.slice(i).search(/[\r\n]/);
      i = nl === -1 ? text.length : i + nl;
    } else if (ch === '(') {
      const [value, next] = readLiteral(text, i);
      current.push({ kind: 'str', value });
      i = next;
    } else if (ch === '<' && text[i + 1] === '<') {
      i = matchDict(text, i);
    } else if (ch === '<') {
      const [value, next] = readHex(text, i);
      current.push({ kind: 'str', value });
      i = next;
    } else if (ch === '[') {
      stack.push([]);
      i += 1;
    } else if (ch === ']') {
      const items = stack.length > 1 ? (stack.pop() ?? []) : [];
      (stack[stack.length - 1] ?? []).push({ kind: 'array', value: items });
      i += 1;
    } else if (ch === '/') {
      const name = /^\/[^\s/<>[\]()]*/.exec(text.slice(i, i + 128))?.[0] ?? '/';
      current.push({ kind: 'name', value: name.slice(1) });
      i += name.length;
    } else if (/[0-9+\-.]/.test(ch)) {
      const num = /^[+-]?(\d+\.?\d*|\.\d+)/.exec(text.slice(i, i + 32))?.[0];
      if (num) {
        current.push({ kind: 'num', value: Number(num) });
        i += num.length;
      } else {
        i += 1;
      }
    } else {
      const word = /^[A-Za-z'"*]+[0-9]?/.exec(text.slice(i, i + 16))?.[0];
      if (!word) {
        i += 1;
        continue;
      }
      i += word.length;
      if (word === 'BI') {
        // imagem embutida: pula até "EI"
        const ei = text.indexOf('EI', i);
        i = ei === -1 ? text.length : ei + 2;
        stack.splice(0, stack.length, []);
        continue;
      }
      onOp(word, current.slice());
      stack.splice(0, stack.length, []);
    }
  }
}

type FontMaps = Map<string, FontInfo>;

function pageFonts(
  page: PdfObject,
  objects: Map<number, PdfObject>,
  budget: Budget,
  cache: Map<number, FontInfo>,
): FontMaps {
  // Recursos podem ser herdados do nó pai na árvore de páginas.
  let resources: string | undefined;
  let node: PdfObject | undefined = page;
  for (let depth = 0; node && depth < 32 && resources === undefined; depth += 1) {
    const value = dictValue(node.dict, 'Resources');
    if (value) {
      const ref = refNumber(value);
      resources = ref !== undefined ? objects.get(ref)?.dict : value;
    } else {
      const parent = refNumber(dictValue(node.dict, 'Parent'));
      node = parent !== undefined ? objects.get(parent) : undefined;
    }
  }

  const fonts: FontMaps = new Map();
  if (!resources) return fonts;
  let fontDict = dictValue(resources, 'Font');
  const fontRef = refNumber(fontDict);
  if (fontRef !== undefined) fontDict = objects.get(fontRef)?.dict;
  if (!fontDict) return fonts;

  for (const entry of fontDict.matchAll(/\/([^\s/<>[\]()]+)\s+(\d+)\s+\d+\s+R/g)) {
    const name = entry[1] ?? '';
    const num = Number(entry[2]);
    let info = cache.get(num);
    if (!info) {
      info = readFont(objects.get(num), objects, budget);
      cache.set(num, info);
    }
    fonts.set(name, info);
  }
  return fonts;
}

/** Texto de um content stream, quebrando linhas pela posição vertical. */
function contentText(content: string, fonts: FontMaps): string {
  const lines: string[] = [];
  let line = '';
  let font: FontInfo | undefined;
  let fontSize = 10;
  let charSpacing = 0;
  let wordSpacing = 0;
  // matriz de linha de texto: só translação e escala horizontal importam aqui
  let lineX = 0;
  let lineY = 0;
  let scaleA = 1;
  let scaleD = 1;
  let leading = 0;
  let lastY: number | undefined;
  let endX: number | undefined;

  const newLine = () => {
    if (line.trim() !== '') lines.push(line.replace(/\s+/g, ' ').trim());
    line = '';
    endX = undefined;
  };

  const moveTo = (x: number, y: number) => {
    if (
      lastY !== undefined &&
      Math.abs(y - lastY) > Math.max(1, Math.abs(fontSize * scaleD) * 0.3)
    ) {
      newLine();
    } else if (endX !== undefined && x - endX > Math.abs(fontSize * scaleA) * 0.2) {
      if (!line.endsWith(' ')) line += ' ';
    }
    lineX = x;
    lineY = y;
    lastY = y;
  };

  const show = (raw: string) => {
    const { text, width } = decodeShown(raw, font);
    if (lastY === undefined) lastY = lineY;
    line += text;
    const spaces = (text.match(/ /g) ?? []).length;
    const advance = (width / 1000) * fontSize + charSpacing * text.length + wordSpacing * spaces;
    endX = lineX + advance * scaleA;
    lineX = endX;
  };

  scanContent(content, (op, args) => {
    const nums = args.filter((a): a is { kind: 'num'; value: number } => a.kind === 'num');
    switch (op) {
      case 'BT':
        lineX = 0;
        lineY = 0;
        scaleA = 1;
        scaleD = 1;
        break;
      case 'Tf': {
        const name = args.find((a) => a.kind === 'name');
        if (name && name.kind === 'name') font = fonts.get(name.value);
        fontSize = nums[nums.length - 1]?.value ?? fontSize;
        break;
      }
      case 'Tc':
        charSpacing = nums[0]?.value ?? 0;
        break;
      case 'Tw':
        wordSpacing = nums[0]?.value ?? 0;
        break;
      case 'TL':
        leading = nums[0]?.value ?? leading;
        break;
      case 'Tm': {
        const [a, , , d, e, f] = nums.map((n) => n.value);
        scaleA = a ?? 1;
        scaleD = d ?? 1;
        moveTo(e ?? 0, f ?? 0);
        break;
      }
      case 'Td':
      case 'TD': {
        const tx = nums[0]?.value ?? 0;
        const ty = nums[1]?.value ?? 0;
        if (op === 'TD') leading = -ty;
        moveTo(lineX + tx * scaleA, lineY + ty * scaleD);
        break;
      }
      case 'T*':
        moveTo(lineX, lineY - leading * scaleD);
        break;
      case 'Tj':
        for (const a of args) if (a.kind === 'str') show(a.value);
        break;
      case "'":
      case '"':
        moveTo(lineX, lineY - leading * scaleD);
        newLine();
        for (const a of args) if (a.kind === 'str') show(a.value);
        break;
      case 'TJ': {
        const array = args.find((a) => a.kind === 'array');
        if (array && array.kind === 'array') {
          for (const item of array.value) {
            if (item.kind === 'str') {
              show(item.value);
            } else if (item.kind === 'num') {
              // número no TJ recua (positivo) ou afasta (negativo) o próximo trecho
              lineX -= (item.value / 1000) * fontSize * scaleA;
              endX = lineX;
              if (item.value < -250 && !line.endsWith(' ')) line += ' ';
            }
          }
        }
        break;
      }
      default:
        break;
    }
  });

  newLine();
  return lines.join('\n');
}

/**
 * Extrai o texto de um PDF. Devolve as linhas na ordem das páginas.
 * Lança PdfTextError com uma mensagem para a pessoa quando o arquivo não serve.
 */
export function extractPdfText(bytes: Uint8Array): string {
  if (bytes.length > PDF_LIMITS.maxInputBytes) {
    throw new PdfTextError('O PDF passa de 5 MB. Use um arquivo menor.');
  }
  const head = bytesToLatin1(bytes, 0, Math.min(1024, bytes.length));
  if (!head.includes('%PDF-')) {
    throw new PdfTextError('O arquivo não é um PDF válido.');
  }
  if (/\/Encrypt\b/.test(bytesToLatin1(bytes, Math.max(0, bytes.length - 4096)))) {
    throw new PdfTextError('O PDF tem senha ou está protegido. Exporte uma versão sem proteção.');
  }

  const src = bytesToLatin1(bytes);
  const budget: Budget = { inflated: 0 };
  const objects = readObjects(bytes, src, budget);
  const fontCache = new Map<number, FontInfo>();

  // Ordem das páginas pela árvore /Pages; se falhar, ordem dos objetos.
  const pages: PdfObject[] = [];
  const visit = (num: number, depth: number) => {
    const obj = objects.get(num);
    if (!obj || depth > 32 || pages.length > 500) return;
    if (/\/Type\s*\/Pages\b/.test(obj.dict)) {
      for (const kid of refList(dictValue(obj.dict, 'Kids'))) visit(kid, depth + 1);
    } else if (/\/Type\s*\/Page\b/.test(obj.dict)) {
      pages.push(obj);
    }
  };
  const root = Array.from(objects.entries()).find(
    ([, obj]) => /\/Type\s*\/Pages\b/.test(obj.dict) && !/\/Parent\b/.test(obj.dict),
  );
  if (root) visit(root[0], 0);
  if (pages.length === 0) {
    for (const obj of objects.values()) if (/\/Type\s*\/Page\b/.test(obj.dict)) pages.push(obj);
  }

  const parts: string[] = [];
  let total = 0;
  for (const page of pages) {
    const fonts = pageFonts(page, objects, budget, fontCache);
    for (const ref of refList(dictValue(page.dict, 'Contents'))) {
      const stream = objects.get(ref);
      const content = stream ? decodeStream(stream, budget) : undefined;
      if (content === undefined) continue;
      const text = contentText(content, fonts);
      total += text.length;
      if (total > PDF_LIMITS.maxTextChars) {
        throw new PdfTextError('O PDF tem texto demais para uma rotina.');
      }
      if (text) parts.push(text);
    }
  }

  return parts.join('\n');
}
