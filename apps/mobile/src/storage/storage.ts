import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRandomBytes } from 'expo-crypto';

import { clearCache } from './cache';
import { createEncryptedStore } from './encryptedStore';
import { createKeyProvider } from './keyProvider';
import { allStorageKeys, type StorageKey } from './keys';
import { readSecureStrict, removeSecure, secureKeys, writeSecure } from './secure';

/**
 * Os dados do usuário são gravados cifrados (XChaCha20-Poly1305). A chave de
 * 256 bits nasce no aparelho, fica no SecureStore (Keystore/Keychain) e nunca
 * vai para o AsyncStorage. Veja `encryptedStore` para as regras de segurança.
 */
const dataKeys = createKeyProvider({
  read: () => readSecureStrict(secureKeys.dataKey),
  write: (value) => writeSecure(secureKeys.dataKey, value),
  random: getRandomBytes,
});

const store = createEncryptedStore({
  io: {
    get: (key) => AsyncStorage.getItem(key),
    set: (key, value) => AsyncStorage.setItem(key, value),
    remove: (key) => AsyncStorage.removeItem(key),
  },
  keys: dataKeys,
  random: getRandomBytes,
});

/**
 * Lê um valor salvo. Devolve `undefined` quando a chave não existe.
 *
 * Dado corrompido ou adulterado não derruba o aplicativo: a chave é descartada
 * e o chamador cai no valor inicial.
 */
export function readValue<T>(key: StorageKey): Promise<T | undefined> {
  return store.readValue<T>(key);
}

/** Grava um valor cifrado. Falhas de escrita são silenciosas: o estado em memória segue válido. */
export function writeValue<T>(key: StorageKey, value: T): Promise<void> {
  return store.writeValue(key, value);
}

/**
 * Apaga todos os dados do StayOn no dispositivo.
 *
 * Remove também a chave de criptografia: o que sobrasse em disco passa a ser
 * ilegível, e a próxima gravação nasce com uma chave nova.
 */
export async function clearAll(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([...allStorageKeys]);
    await clearCache();
    await removeSecure(secureKeys.session);
    await removeSecure(secureKeys.dataKey);
    dataKeys.reset();
  } catch {
    // Nada a fazer: a próxima abertura simplesmente mantém os dados.
  }
}
