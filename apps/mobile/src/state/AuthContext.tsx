import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';

import { normalizeName, parseSession, type Session } from '@/domain/userSession';
import { clearCache, storageKeys, usePersistentState } from '@/storage';

type Auth = {
  /** Nome de quem está usando o app, ou `null` sem sessão. */
  usuario: string | null;
  /** Falso até a sessão salva ser lida: não decida a rota antes disso. */
  pronto: boolean;
  /** Devolve `false` se o nome for inválido. */
  entrar: (nome: string) => boolean;
  sair: () => void;
};

const AuthContext = createContext<Auth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { value, setValue, hydrated } = usePersistentState<Session | null>(
    storageKeys.session,
    null,
  );

  // O que veio do disco passa por validação: JSON corrompido ou adulterado
  // vira "sem sessão" em vez de quebrar o app.
  const session = hydrated ? parseSession(value) : null;

  const entrar = useCallback(
    (nome: string) => {
      const name = normalizeName(nome);
      if (name === null) return false;

      setValue({ name, signedInAt: Date.now() });
      return true;
    },
    [setValue],
  );

  const sair = useCallback(() => {
    setValue(null);
    // Dado de rede guardado no aparelho não deve sobrar para o próximo usuário.
    void clearCache();
  }, [setValue]);

  const auth = useMemo<Auth>(
    () => ({ usuario: session?.name ?? null, pronto: hydrated, entrar, sair }),
    [session?.name, hydrated, entrar, sair],
  );

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth(): Auth {
  const auth = useContext(AuthContext);
  if (auth === null) throw new Error('useAuth precisa estar dentro de AuthProvider');
  return auth;
}
