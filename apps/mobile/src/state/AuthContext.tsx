import { createContext, useContext, useState, type ReactNode } from "react";

type Auth = {
  usuario: string | null;
  entrar: (nome: string) => void;
};

const AuthContext = createContext<Auth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<string | null>(null);

  return (
    <AuthContext.Provider value={{ usuario, entrar: setUsuario }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext)!;
}