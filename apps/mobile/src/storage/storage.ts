import AsyncStorage from '@react-native-async-storage/async-storage';

import { allStorageKeys, type StorageKey } from './keys';

/**
 * Lê um valor salvo. Devolve `undefined` quando a chave não existe.
 *
 * Um JSON corrompido não derruba o aplicativo: a chave é descartada e o
 * chamador cai no valor inicial.
 */
export async function readValue<T>(key: StorageKey): Promise<T | undefined> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return undefined;
    return JSON.parse(raw) as T;
  } catch {
    await AsyncStorage.removeItem(key).catch(() => undefined);
    return undefined;
  }
}

/** Grava um valor. Falhas de escrita são silenciosas — o estado em memória continua válido. */
export async function writeValue<T>(key: StorageKey, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Sem espaço ou sem permissão: o app segue funcionando nesta sessão.
  }
}

/** Apaga todos os dados do StayOn no dispositivo. */
export async function clearAll(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([...allStorageKeys]);
  } catch {
    // Nada a fazer: a próxima abertura simplesmente mantém os dados.
  }
}
