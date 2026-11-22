import * as SecureStore from 'expo-secure-store';

/**
 * Armazenamento criptografado (Keychain no iOS, Keystore no Android).
 *
 * Regra da Aula 10: o que identifica quem usa o app vai aqui; listas e
 * preferências ficam no AsyncStorage. O SecureStore guarda só texto curto
 * (≈2 KB por valor) e as chaves aceitam letras, números, ".", "-" e "_".
 *
 * Onde o SecureStore não existe (versão web), nada é gravado: é preferível
 * pedir o login de novo a deixar a sessão em texto puro no navegador.
 */

export const secureKeys = {
  session: 'stayon.session',
} as const;

export type SecureKey = (typeof secureKeys)[keyof typeof secureKeys];

const OPTIONS: SecureStore.SecureStoreOptions = {
  // Não migra para outro aparelho por backup e só abre com o aparelho destravado.
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

async function available(): Promise<boolean> {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

/** Lê um valor. Devolve `null` se não existe, se não há SecureStore ou se a leitura falha. */
export async function readSecure(key: SecureKey): Promise<string | null> {
  if (!(await available())) return null;

  try {
    return await SecureStore.getItemAsync(key, OPTIONS);
  } catch {
    return null;
  }
}

/** Grava um valor. Devolve `false` se não foi possível (o chamador decide o que fazer). */
export async function writeSecure(key: SecureKey, value: string): Promise<boolean> {
  if (!(await available())) return false;

  try {
    await SecureStore.setItemAsync(key, value, OPTIONS);
    return true;
  } catch {
    return false;
  }
}

export async function removeSecure(key: SecureKey): Promise<void> {
  if (!(await available())) return;

  try {
    await SecureStore.deleteItemAsync(key, OPTIONS);
  } catch {
    // Sem acesso ao cofre não há o que apagar.
  }
}
