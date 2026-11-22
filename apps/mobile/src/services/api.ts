/**
 * Porta de entrada única para a rede. Nenhuma tela conhece a URL, o tempo
 * limite ou o formato bruto da resposta — só recebe dado já validado ou um
 * `ApiError` com mensagem pronta para exibir.
 */

const DEFAULT_BASE_URL = 'https://brasilapi.com.br/api';
const DEFAULT_TIMEOUT_MS = 10_000;
const MAX_RESPONSE_BYTES = 1_000_000;

export type ApiErrorKind = 'network' | 'timeout' | 'http' | 'invalid' | 'config';

/** Falha de rede com texto seguro para o usuário: sem URL, sem corpo da resposta. */
export class ApiError extends Error {
  constructor(
    readonly kind: ApiErrorKind,
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Endereço base da API. Só aceita HTTPS: tráfego sem criptografia pode ser lido
 * e alterado na rede. HTTP é tolerado apenas em desenvolvimento (API local).
 */
export function resolveBaseUrl(raw: string | undefined = process.env.EXPO_PUBLIC_API_URL): string {
  const base = (raw?.trim() || DEFAULT_BASE_URL).replace(/\/+$/, '');

  const secure = base.startsWith('https://');
  const localDev = __DEV__ && base.startsWith('http://');
  if (!secure && !localDev) {
    throw new ApiError('config', 'Endereço da API inválido: use HTTPS.');
  }

  return base;
}

function messageForStatus(status: number): string {
  if (status === 404) return 'Não encontramos esse dado.';
  if (status === 429) return 'Muitas tentativas seguidas. Aguarde um pouco.';
  if (status >= 500) return 'O serviço está indisponível agora.';
  return 'Não foi possível carregar os dados.';
}

type RequestOptions = {
  timeoutMs?: number;
  /** Cancela a chamada de fora (tela fechada, nova busca). */
  signal?: AbortSignal;
};

/**
 * GET com tempo limite. `parse` valida o JSON recebido e devolve `null` quando
 * o formato não é o esperado — a resposta da rede nunca é confiada às cegas.
 */
export async function getJson<T>(
  path: string,
  parse: (payload: unknown) => T | null,
  { timeoutMs = DEFAULT_TIMEOUT_MS, signal }: RequestOptions = {},
): Promise<T> {
  const url = `${resolveBaseUrl()}${path}`;

  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const forwardAbort = () => controller.abort();
  signal?.addEventListener('abort', forwardAbort);

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    // fetch só rejeita em falha de rede: 404 e 500 chegam aqui como resposta.
    if (!response.ok) {
      throw new ApiError('http', messageForStatus(response.status), response.status);
    }

    const declaredSize = Number(response.headers.get('content-length') ?? 0);
    if (declaredSize > MAX_RESPONSE_BYTES) {
      throw new ApiError('invalid', 'Resposta grande demais.');
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new ApiError('invalid', 'O serviço respondeu em um formato inesperado.');
    }

    const parsed = parse(payload);
    if (parsed === null) {
      throw new ApiError('invalid', 'O serviço respondeu em um formato inesperado.');
    }

    return parsed;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (timedOut) throw new ApiError('timeout', 'O serviço demorou demais para responder.');
    throw new ApiError('network', 'Sem conexão com a internet.');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', forwardAbort);
  }
}
