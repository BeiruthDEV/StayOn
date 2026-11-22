import AsyncStorage from '@react-native-async-storage/async-storage';

import { CACHE_PREFIX, cached as cachedCore, type CacheIO, type CachedOptions } from './cacheCore';

export { CACHE_PREFIX, type Cached } from './cacheCore';

const asyncStorageIO: CacheIO = {
  read: (key) => AsyncStorage.getItem(key),
  write: (key, value) => AsyncStorage.setItem(key, value),
};

/** Cache de respostas da rede gravado no AsyncStorage. Veja `cacheCore` para a estratégia. */
export function cached<T>(options: Omit<CachedOptions<T>, 'io'>) {
  return cachedCore({ ...options, io: asyncStorageIO });
}

/** Apaga só o cache da rede. Usado ao sair e ao apagar os dados do app. */
export async function clearCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const mine = keys.filter((key) => key.startsWith(CACHE_PREFIX));
    if (mine.length > 0) await AsyncStorage.multiRemove(mine);
  } catch {
    // Sem acesso ao disco não há o que limpar.
  }
}
