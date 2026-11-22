import { decryptText, encryptText, isEncrypted, type RandomBytes } from './crypto';
import type { KeyProvider } from './keyProvider';

export type StoreIO = {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string) => Promise<void>;
  remove: (key: string) => Promise<void>;
};

type Deps = { io: StoreIO; keys: KeyProvider; random: RandomBytes };

/**
 * Leitura e escrita de valores JSON cifrados.
 *
 * Princípios:
 * - Nunca grava em texto puro: sem chave, não grava (o estado em memória segue
 *   valendo nesta abertura).
 * - Nunca apaga dado por causa de falha do cofre: só descarta o que ficou
 *   comprovadamente ilegível (adulterado, formato inválido, chave errada).
 * - Dados antigos, gravados em texto puro por versões anteriores, são lidos uma
 *   última vez e regravados cifrados.
 */
export function createEncryptedStore({ io, keys, random }: Deps) {
  async function discard(storageKey: string): Promise<void> {
    await io.remove(storageKey).catch(() => undefined);
  }

  async function writeValue<T>(storageKey: string, value: T): Promise<void> {
    try {
      const key = await keys.get();
      if (key === null) return;

      const sealed = encryptText(JSON.stringify(value), key, storageKey, random);
      await io.set(storageKey, sealed);
    } catch {
      // Sem espaço, sem cofre ou valor não serializável: o app segue funcionando.
    }
  }

  async function readValue<T>(storageKey: string): Promise<T | undefined> {
    let stored: string | null;
    try {
      stored = await io.get(storageKey);
    } catch {
      return undefined;
    }
    if (stored === null) return undefined;

    const key = await keys.get().catch(() => null);
    // Sem chave não dá para saber se o dado é bom: não mexe nele.
    if (key === null) return undefined;

    try {
      if (isEncrypted(stored)) {
        const plain = decryptText(stored, key, storageKey);
        if (plain === null) {
          await discard(storageKey);
          return undefined;
        }
        return JSON.parse(plain) as T;
      }

      // Formato antigo (texto puro): lê e passa a guardar cifrado.
      const legacy = JSON.parse(stored) as T;
      await writeValue(storageKey, legacy);
      return legacy;
    } catch {
      await discard(storageKey);
      return undefined;
    }
  }

  return { readValue, writeValue };
}
