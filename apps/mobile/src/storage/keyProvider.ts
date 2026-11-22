import { generateKey, type RandomBytes } from './crypto';

/** Resultado de ler o cofre: distingue "não existe" de "não consegui ler". */
export type SecureRead = { ok: true; value: string | null } | { ok: false };

type Deps = {
  read: () => Promise<SecureRead>;
  write: (value: string) => Promise<boolean>;
  random: RandomBytes;
};

export type KeyProvider = {
  /** Chave de criptografia dos dados, ou `null` se o cofre não está utilizável agora. */
  get: () => Promise<string | null>;
  /** Esquece a chave em memória (depois de apagar a do cofre). */
  reset: () => void;
};

const KEY_PATTERN = /^[0-9a-f]{64}$/;

/**
 * Entrega a chave que cifra os dados do app, guardada no cofre do sistema.
 *
 * Regras que protegem os dados do usuário:
 * - A chave só é criada quando o cofre responde com certeza que ela não existe.
 *   Se a leitura falhar, devolve `null`: criar outra chave tornaria ilegível
 *   tudo o que já foi gravado.
 * - Uma chave que não pôde ser gravada no cofre não é usada: os dados cifrados
 *   com ela seriam perdidos na próxima abertura.
 * - Chamadas simultâneas (todas as telas leem ao abrir) compartilham a mesma
 *   operação, para nunca nascerem duas chaves ao mesmo tempo.
 */
export function createKeyProvider({ read, write, random }: Deps): KeyProvider {
  let pending: Promise<string | null> | null = null;

  async function load(): Promise<string | null> {
    const stored = await read();
    if (!stored.ok) return null;

    if (stored.value !== null) {
      return KEY_PATTERN.test(stored.value) ? stored.value : null;
    }

    const key = generateKey(random);
    return (await write(key)) ? key : null;
  }

  return {
    get() {
      if (pending === null) {
        pending = load().then((key) => {
          // Falhou: a próxima chamada tenta de novo em vez de lembrar do erro.
          if (key === null) pending = null;
          return key;
        });
      }
      return pending;
    },
    reset() {
      pending = null;
    },
  };
}
