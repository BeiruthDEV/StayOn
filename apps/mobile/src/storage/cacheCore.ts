/**
 * Cache de respostas da rede com validade (TTL).
 *
 * Estratégia: dado novo o bastante é devolvido sem chamar a API; passada a
 * validade, busca de novo; se a rede falhar, devolve o dado antigo marcado como
 * `stale` para a tela avisar que pode estar desatualizado.
 */

/** Prefixo único: permite apagar todo o cache sem tocar nos dados do usuário. */
export const CACHE_PREFIX = 'stayon:cache:v1:';

type Entry = { data: unknown; savedAt: number };

export type CacheIO = {
  read: (key: string) => Promise<string | null>;
  write: (key: string, value: string) => Promise<void>;
};

export type Cached<T> = {
  data: T;
  /** Momento em que o dado foi buscado na rede (ms desde 1970). */
  savedAt: number;
  /** Verdadeiro quando a rede falhou e o dado vem do disco, já vencido. */
  stale: boolean;
};

export type CachedOptions<T> = {
  /** Nome curto, sem prefixo. Ex.: `holidays:2026`. */
  name: string;
  ttlMs: number;
  fetcher: () => Promise<T>;
  /** Valida o que veio do disco. Dado corrompido ou de outra versão é ignorado. */
  validate: (payload: unknown) => T | null;
  /** Ignora a validade e vai à rede (puxar para atualizar). */
  force?: boolean;
  now?: () => number;
  io: CacheIO;
};

async function readEntry<T>(
  io: CacheIO,
  key: string,
  validate: (payload: unknown) => T | null,
): Promise<Cached<T> | null> {
  try {
    const raw = await io.read(key);
    if (raw === null) return null;

    const entry = JSON.parse(raw) as Partial<Entry> | null;
    if (typeof entry?.savedAt !== 'number') return null;

    const data = validate(entry.data);
    return data === null ? null : { data, savedAt: entry.savedAt, stale: false };
  } catch {
    return null;
  }
}

export async function cached<T>({
  name,
  ttlMs,
  fetcher,
  validate,
  force = false,
  now = Date.now,
  io,
}: CachedOptions<T>): Promise<Cached<T>> {
  const key = `${CACHE_PREFIX}${name}`;
  const saved = await readEntry(io, key, validate);

  if (saved && !force && now() - saved.savedAt < ttlMs) return saved;

  try {
    const data = await fetcher();
    const entry: Entry = { data, savedAt: now() };
    // Falha ao gravar não impede de mostrar o que acabou de chegar.
    await io.write(key, JSON.stringify(entry)).catch(() => undefined);
    return { data, savedAt: entry.savedAt, stale: false };
  } catch (error) {
    if (saved) return { ...saved, stale: true };
    throw error;
  }
}
