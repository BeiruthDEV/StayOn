import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { CACHE_PREFIX, cached, type CacheIO } from './cacheCore';

const validate = (payload: unknown) => (Array.isArray(payload) ? (payload as number[]) : null);
const TTL = 1000;

function memoryIO(initial: Record<string, string> = {}, options: { failWrites?: boolean } = {}) {
  const data = new Map(Object.entries(initial));
  const io: CacheIO = {
    read: async (key) => data.get(key) ?? null,
    write: async (key, value) => {
      if (options.failWrites) throw new Error('disco cheio');
      data.set(key, value);
    },
  };
  return { io, data };
}

function setup(initial: Record<string, string> = {}, ioOptions: { failWrites?: boolean } = {}) {
  const { io, data } = memoryIO(initial, ioOptions);
  let clock = 10_000;
  let calls = 0;
  let fetcher: () => Promise<number[]> = async () => [1, 2, 3];

  return {
    data,
    advance: (ms: number) => (clock += ms),
    calls: () => calls,
    failNetwork: () => {
      fetcher = async () => {
        throw new Error('sem rede');
      };
    },
    run: (options: { force?: boolean } = {}) =>
      cached({
        name: 'lista',
        ttlMs: TTL,
        force: options.force ?? false,
        validate,
        now: () => clock,
        io,
        fetcher: () => {
          calls += 1;
          return fetcher();
        },
      }),
  };
}

const key = `${CACHE_PREFIX}lista`;

describe('cached', () => {
  it('sem cache vai à rede e grava com o prefixo do app', async () => {
    const t = setup();
    const result = await t.run();

    assert.deepEqual(result, { data: [1, 2, 3], savedAt: 10_000, stale: false });
    assert.equal(t.calls(), 1);
    assert.ok(t.data.has(key));
  });

  it('dentro da validade devolve o cache sem chamar a rede', async () => {
    const t = setup();
    await t.run();
    t.advance(TTL - 1);

    const result = await t.run();
    assert.equal(t.calls(), 1);
    assert.equal(result.stale, false);
  });

  it('vencido, busca de novo e renova a data', async () => {
    const t = setup();
    await t.run();
    t.advance(TTL);

    const result = await t.run();
    assert.equal(t.calls(), 2);
    assert.equal(result.savedAt, 11_000);
  });

  it('force ignora a validade (puxar para atualizar)', async () => {
    const t = setup();
    await t.run();
    await t.run({ force: true });
    assert.equal(t.calls(), 2);
  });

  it('sem internet e com cache vencido devolve o antigo marcado como stale', async () => {
    const t = setup();
    await t.run();
    t.advance(TTL * 5);
    t.failNetwork();

    const result = await t.run();
    assert.deepEqual(result, { data: [1, 2, 3], savedAt: 10_000, stale: true });
  });

  it('sem internet e sem cache repassa o erro para a tela', async () => {
    const t = setup();
    t.failNetwork();
    await assert.rejects(t.run(), /sem rede/);
  });

  it('JSON corrompido no disco é ignorado, não derruba', async () => {
    const t = setup({ [key]: '{quebrado' });
    const result = await t.run();
    assert.equal(result.stale, false);
    assert.equal(t.calls(), 1);
  });

  it('dado de formato inesperado no disco é descartado pela validação', async () => {
    const t = setup({ [key]: JSON.stringify({ data: 'adulterado', savedAt: 10_000 }) });
    const result = await t.run();
    assert.deepEqual(result.data, [1, 2, 3]);
    assert.equal(t.calls(), 1);
  });

  it('entrada sem data de gravação é descartada', async () => {
    const t = setup({ [key]: JSON.stringify({ data: [9] }) });
    assert.deepEqual((await t.run()).data, [1, 2, 3]);
  });

  it('falha ao gravar não impede de mostrar o que chegou da rede', async () => {
    const t = setup({}, { failWrites: true });
    const result = await t.run();
    assert.deepEqual(result.data, [1, 2, 3]);
  });
});
