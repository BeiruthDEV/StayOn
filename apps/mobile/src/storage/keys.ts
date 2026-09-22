/**
 * Chaves do armazenamento local.
 * O prefixo evita colisão com outros dados no mesmo dispositivo.
 */
export const storageKeys = {
  tasks: 'stayon:tasks',
  habits: 'stayon:habits',
  blocks: 'stayon:blocks',
  events: 'stayon:events',
  sessions: 'stayon:sessions',
  preferences: 'stayon:preferences',
  reflections: 'stayon:reflections',
} as const;

export type StorageKey = (typeof storageKeys)[keyof typeof storageKeys];

/** Todas as chaves, usado ao apagar os dados do aplicativo. */
export const allStorageKeys: readonly StorageKey[] = Object.values(storageKeys);
