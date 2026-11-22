import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { normalizeName, parseSession, type Session } from '@/domain/userSession';
import { clearCache, readSecure, removeSecure, secureKeys, writeSecure } from '@/storage';

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

/** Lê a sessão do cofre. Texto corrompido ou adulterado vira "sem sessão". */
async function loadSession(): Promise<Session | null> {
  const raw = await readSecure(secureKeys.session);
  if (raw === null) return null;

  try {
    return parseSession(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    let active = true;

    loadSession().then((stored) => {
      if (!active) return;
      setSession(stored);
      setPronto(true);
    });

    return () => {
      active = false;
    };
  }, []);

  const entrar = useCallback((nome: string) => {
    const name = normalizeName(nome);
    if (name === null) return false;

    const next: Session = { name, signedInAt: Date.now() };
    setSession(next);
    // Se o cofre falhar, o login vale nesta abertura e só não é lembrado depois.
    void writeSecure(secureKeys.session, JSON.stringify(next));
    return true;
  }, []);

  const sair = useCallback(() => {
    setSession(null);
    void removeSecure(secureKeys.session);
    // Dado de rede guardado no aparelho não deve sobrar para o próximo usuário.
    void clearCache();
  }, []);

  const auth = useMemo<Auth>(
    () => ({ usuario: session?.name ?? null, pronto, entrar, sair }),
    [session?.name, pronto, entrar, sair],
  );

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth(): Auth {
  const auth = useContext(AuthContext);
  if (auth === null) throw new Error('useAuth precisa estar dentro de AuthProvider');
  return auth;
}
