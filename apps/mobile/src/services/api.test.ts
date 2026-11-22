import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';

import { ApiError, getJson, resolveBaseUrl } from './api';

const globals = globalThis as unknown as { __DEV__: boolean };
const accept = (payload: unknown) => payload as { ok: boolean } | null;

function jsonResponse(body: unknown, init: { status?: number; headers?: Record<string, string> } = {}) {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { 'content-type': 'application/json', ...init.headers },
  });
}

async function kindOf(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (error) {
    assert.ok(error instanceof ApiError, 'deveria lançar ApiError');
    return { kind: error.kind, status: error.status, message: error.message };
  }
  assert.fail('deveria ter falhado');
}

beforeEach(() => {
  globals.__DEV__ = false;
});

afterEach(() => {
  mock.restoreAll();
});

describe('resolveBaseUrl', () => {
  it('usa a BrasilAPI por padrão e tira a barra final', () => {
    assert.equal(resolveBaseUrl(undefined), 'https://brasilapi.com.br/api');
    assert.equal(resolveBaseUrl(''), 'https://brasilapi.com.br/api');
    assert.equal(resolveBaseUrl('https://exemplo.com/api///'), 'https://exemplo.com/api');
  });

  it('recusa HTTP em produção', () => {
    assert.throws(() => resolveBaseUrl('http://exemplo.com'), (e: unknown) => e instanceof ApiError && e.kind === 'config');
  });

  it('recusa esquemas que não são http(s)', () => {
    for (const url of ['ftp://exemplo.com', 'javascript:alert(1)', 'exemplo.com']) {
      assert.throws(() => resolveBaseUrl(url), ApiError, url);
    }
  });

  it('aceita HTTP só em desenvolvimento (API local)', () => {
    globals.__DEV__ = true;
    assert.equal(resolveBaseUrl('http://192.168.0.10:3000'), 'http://192.168.0.10:3000');
  });
});

describe('getJson', () => {
  it('monta a URL, pede JSON e devolve o dado validado', async () => {
    const fetchMock = mock.method(globalThis, 'fetch', async () => jsonResponse({ ok: true }));

    const result = await getJson('/feriados/v1/2026', accept);

    assert.deepEqual(result, { ok: true });
    const [url, init] = fetchMock.mock.calls[0]!.arguments as [string, RequestInit];
    assert.equal(url, 'https://brasilapi.com.br/api/feriados/v1/2026');
    assert.deepEqual(init.headers, { Accept: 'application/json' });
  });

  it('trata 404 e 500 como erro, porque fetch não lança sozinho', async () => {
    mock.method(globalThis, 'fetch', async () => jsonResponse({}, { status: 404 }));
    assert.deepEqual(await kindOf(getJson('/x', accept)), {
      kind: 'http',
      status: 404,
      message: 'Não encontramos esse dado.',
    });

    mock.method(globalThis, 'fetch', async () => jsonResponse({}, { status: 503 }));
    assert.equal((await kindOf(getJson('/x', accept))).message, 'O serviço está indisponível agora.');

    mock.method(globalThis, 'fetch', async () => jsonResponse({}, { status: 429 }));
    assert.equal((await kindOf(getJson('/x', accept))).status, 429);
  });

  it('recusa resposta que não passa na validação', async () => {
    mock.method(globalThis, 'fetch', async () => jsonResponse({ inesperado: true }));
    assert.equal((await kindOf(getJson('/x', () => null))).kind, 'invalid');
  });

  it('recusa corpo que não é JSON', async () => {
    mock.method(globalThis, 'fetch', async () => new Response('<html>erro</html>', { status: 200 }));
    assert.equal((await kindOf(getJson('/x', accept))).kind, 'invalid');
  });

  it('recusa resposta declarada como grande demais antes de ler o corpo', async () => {
    mock.method(globalThis, 'fetch', async () =>
      jsonResponse({ ok: true }, { headers: { 'content-length': '5000000' } }),
    );
    assert.equal((await kindOf(getJson('/x', accept))).kind, 'invalid');
  });

  it('converte falha de rede em mensagem segura, sem vazar a URL', async () => {
    mock.method(globalThis, 'fetch', async () => {
      throw new TypeError('Network request failed: https://brasilapi.com.br/api/x');
    });
    const failure = await kindOf(getJson('/x', accept));
    assert.equal(failure.kind, 'network');
    assert.equal(failure.message, 'Sem conexão com a internet.');
    assert.equal(failure.message.includes('brasilapi'), false);
  });

  it('desiste depois do tempo limite', async () => {
    mock.method(
      globalThis,
      'fetch',
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => reject(new DOMException('abortado', 'AbortError')));
        }),
    );
    const failure = await kindOf(getJson('/x', accept, { timeoutMs: 20 }));
    assert.equal(failure.kind, 'timeout');
  });

  it('não faz nenhuma chamada se o endereço base for inseguro', async () => {
    const fetchMock = mock.method(globalThis, 'fetch', async () => jsonResponse({ ok: true }));
    const original = process.env.EXPO_PUBLIC_API_URL;
    process.env.EXPO_PUBLIC_API_URL = 'http://exemplo.com';
    try {
      assert.equal((await kindOf(getJson('/x', accept))).kind, 'config');
      assert.equal(fetchMock.mock.callCount(), 0);
    } finally {
      if (original === undefined) delete process.env.EXPO_PUBLIC_API_URL;
      else process.env.EXPO_PUBLIC_API_URL = original;
    }
  });
});
