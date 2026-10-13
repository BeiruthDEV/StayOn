/**
 * Abre um arquivo TXT ou PDF escolhido pela pessoa e devolve só o texto dele.
 *
 * Segurança: o conteúdo do arquivo é tratado como dados, nunca como
 * instrução. Não há IA nem interpretador lendo o arquivo: o texto extraído
 * vai para o leitor de linhas da rotina, que só transforma em bloco o que
 * segue o padrão "dia horário título", e a pessoa confere tudo numa prévia
 * antes de salvar. Nada do arquivo é executado, aberto ou enviado para fora
 * do aparelho.
 */
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';

import { extractPdfText, PdfTextError } from '@/domain/pdfText';

const MAX_TXT_BYTES = 1024 * 1024;
const MAX_PDF_BYTES = 5 * 1024 * 1024;

export type RoutineFileResult =
  | { kind: 'text'; name: string; text: string }
  | { kind: 'error'; message: string }
  | { kind: 'canceled' };

function latin1(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 8192) {
    out += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + 8192)));
  }
  return out;
}

/** Abre o seletor de arquivos do sistema e lê o arquivo escolhido. */
export async function pickRoutineFile(): Promise<RoutineFileResult> {
  const picked = await DocumentPicker.getDocumentAsync({
    type: ['text/plain', 'application/pdf', 'text/*'],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (picked.canceled) return { kind: 'canceled' };
  const asset = picked.assets[0];
  if (!asset) return { kind: 'canceled' };

  const name = asset.name ?? 'arquivo';
  const lower = name.toLowerCase();
  const isPdf = asset.mimeType === 'application/pdf' || lower.endsWith('.pdf');
  const isText = asset.mimeType?.startsWith('text/') || lower.endsWith('.txt');

  if (!isPdf && !isText) {
    return { kind: 'error', message: 'Use um arquivo .txt ou .pdf.' };
  }

  try {
    const file = new File(asset.uri);
    const size = asset.size ?? file.size ?? 0;

    if (isPdf) {
      if (size > MAX_PDF_BYTES) return { kind: 'error', message: 'O PDF passa de 5 MB.' };
      const text = extractPdfText(await file.bytes());
      if (text.trim() === '') {
        return {
          kind: 'error',
          message:
            'Não encontrei texto nesse PDF. Se ele for uma foto ou digitalização, não há texto para ler.',
        };
      }
      return { kind: 'text', name, text };
    }

    if (size > MAX_TXT_BYTES)
      return { kind: 'error', message: 'O arquivo de texto passa de 1 MB.' };
    let text = await file.text();
    // arquivo salvo fora do UTF-8 (Bloco de Notas antigo): lê como latin1
    if (text.includes('\uFFFD')) text = latin1(await file.bytes());
    return { kind: 'text', name, text };
  } catch (error) {
    if (error instanceof PdfTextError) return { kind: 'error', message: error.message };
    return {
      kind: 'error',
      message: 'Não consegui abrir esse arquivo. Tente de novo ou use outro.',
    };
  }
}
