import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { describe, it } from 'node:test';

import { generateKey } from './crypto';
import { createEncryptedStore, type StoreIO } from './encryptedStore';
import { createKeyProvider, type KeyProvider, type SecureRead } from './keyProvider';

const random = (count: number) => new Uint8Array(randomBytes(count));

function memoryIO(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  const io: StoreIO = {
    get: async (key) => data.get(key) ?? null,
    set: async (key, value) => void data.set(key, value),
    remove: async (key) => void data.delete(key),
  };
  return { io, data };
}

function fixedKeys(key: string | null): KeyProvider {
  return { get: async () => key, reset: () => undefined };
}

const KEY = generateKey(random);
const TASKS = 'stayon:tasks';
const sample = [{ id: 'a', title: 'Estudar Spring Boot', done: false }];

describe('createEncryptedStore', () => {
  it('grava cifrado e lê de volta o mesmo valor', async () => {
    const { io, data } = memoryIO();
    const store = createEncryptedStore({ io, keys: fixedKeys(KEY), random });

    await store.writeValue(TASKS, sample);

    const raw = data.get(TASKS)!;
    assert.ok(raw.startsWith('enc1:'));
    assert.equal(raw.includes('Spring'), false, 'o texto não pode aparecer no disco');
    assert.deepEqual(await store.readValue(TASKS), sample);
  });

  it('chave ausente: não grava em texto puro', async () => {
    const { io, data } = memoryIO();
    const store = createEncryptedStore({ io, keys: fixedKeys(null), random });

    await store.writeValue(TASKS, sample);
    assert.equal(data.size, 0);
  });

  it('chave ausente: lê como vazio mas NÃO apaga o que está no disco', async () => {
    const { io, data } = memoryIO();
    await createEncryptedStore({ io, keys: fixedKeys(KEY), random }).writeValue(TASKS, sample);
    const before = data.get(TASKS);

    const locked = createEncryptedStore({ io, keys: fixedKeys(null), random });
    assert.equal(await locked.readValue(TASKS), undefined);
    assert.equal(data.get(TASKS), before);
  });

  it('dado adulterado é descartado, sem derrubar o app', async () => {
    const { io, data } = memoryIO();
    const store = createEncryptedStore({ io, keys: fixedKeys(KEY), random });
    await store.writeValue(TASKS, sample);

    const raw = data.get(TASKS)!;
    data.set(TASKS, raw.slice(0, -2) + (raw.endsWith('00') ? '11' : '00'));

    assert.equal(await store.readValue(TASKS), undefined);
    assert.equal(data.has(TASKS), false);
  });

  it('texto cifrado copiado para outra chave de armazenamento é recusado', async () => {
    const { io, data } = memoryIO();
    const store = createEncryptedStore({ io, keys: fixedKeys(KEY), random });
    await store.writeValue(TASKS, sample);

    data.set('stayon:habits', data.get(TASKS)!);
    assert.equal(await store.readValue('stayon:habits'), undefined);
  });

  it('chave diferente (ex.: dados de outra instalação) não lê o dado', async () => {
    const { io } = memoryIO();
    await createEncryptedStore({ io, keys: fixedKeys(KEY), random }).writeValue(TASKS, sample);

    const other = createEncryptedStore({ io, keys: fixedKeys(generateKey(random)), random });
    assert.equal(await other.readValue(TASKS), undefined);
  });

  it('migra dado antigo em texto puro: lê e regrava cifrado', async () => {
    const { io, data } = memoryIO({ [TASKS]: JSON.stringify(sample) });
    const store = createEncryptedStore({ io, keys: fixedKeys(KEY), random });

    assert.deepEqual(await store.readValue(TASKS), sample);
    assert.ok(data.get(TASKS)!.startsWith('enc1:'));
    assert.equal(data.get(TASKS)!.includes('Spring'), false);
    assert.deepEqual(await store.readValue(TASKS), sample);
  });

  it('migração sem chave deixa o dado antigo intacto', async () => {
    const legacy = JSON.stringify(sample);
    const { io, data } = memoryIO({ [TASKS]: legacy });
    const store = createEncryptedStore({ io, keys: fixedKeys(null), random });

    assert.equal(await store.readValue(TASKS), undefined);
    assert.equal(data.get(TASKS), legacy);
  });

  it('JSON antigo corrompido é descartado', async () => {
    const { io, data } = memoryIO({ [TASKS]: '{quebrado' });
    const store = createEncryptedStore({ io, keys: fixedKeys(KEY), random });

    assert.equal(await store.readValue(TASKS), undefined);
    assert.equal(data.has(TASKS), false);
  });

  it('falha de leitura ou escrita do disco não lança', async () => {
    const io: StoreIO = {
      get: async () => {
        throw new Error('disco');
      },
      set: async () => {
        throw new Error('disco cheio');
      },
      remove: async () => undefined,
    };
    const store = createEncryptedStore({ io, keys: fixedKeys(KEY), random });

    assert.equal(await store.readValue(TASKS), undefined);
    await store.writeValue(TASKS, sample);
  });
});

describe('createKeyProvider', () => {
  function vault(initial: SecureRead = { ok: true, value: null }, writable = true) {
    let state = initial;
    let reads = 0;
    let writes = 0;
    const provider = createKeyProvider({
      read: async () => {
        reads += 1;
        await new Promise((resolve) => setTimeout(resolve, 5));
        return state;
      },
      write: async (value) => {
        writes += 1;
        if (!writable) return false;
        state = { ok: true, value };
        return true;
      },
      random,
    });
    return { provider, reads: () => reads, writes: () => writes, state: () => state };
  }

  it('cria a chave uma vez e a guarda no cofre', async () => {
    const v = vault();
    const key = await v.provider.get();

    assert.match(key ?? '', /^[0-9a-f]{64}$/);
    assert.deepEqual(v.state(), { ok: true, value: key });
  });

  it('chamadas simultâneas compartilham UMA chave (todas as telas leem ao abrir)', async () => {
    const v = vault();
    const keys = await Promise.all(Array.from({ length: 12 }, () => v.provider.get()));

    assert.equal(new Set(keys).size, 1);
    assert.equal(v.writes(), 1);
  });

  it('reaproveita a chave que já existe no cofre', async () => {
    const existing = generateKey(random);
    const v = vault({ ok: true, value: existing });

    assert.equal(await v.provider.get(), existing);
    assert.equal(v.writes(), 0);
  });

  it('cofre com erro de leitura: devolve null e NÃO cria outra chave', async () => {
    const v = vault({ ok: false });

    assert.equal(await v.provider.get(), null);
    assert.equal(v.writes(), 0);
  });

  it('chave que não pôde ser gravada não é usada', async () => {
    const v = vault({ ok: true, value: null }, false);
    assert.equal(await v.provider.get(), null);
  });

  it('chave malformada no cofre não é usada nem sobrescrita', async () => {
    const v = vault({ ok: true, value: 'lixo' });

    assert.equal(await v.provider.get(), null);
    assert.equal(v.writes(), 0);
  });

  it('depois de uma falha, tenta de novo na próxima chamada', async () => {
    const v = vault({ ok: false });
    await v.provider.get();
    await v.provider.get();
    assert.equal(v.reads(), 2);
  });

  it('reset faz a próxima chamada ler o cofre de novo', async () => {
    const v = vault();
    await v.provider.get();
    v.provider.reset();
    await v.provider.get();
    assert.equal(v.reads(), 2);
  });
});
