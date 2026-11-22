import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiError } from '@/services/api';

type Loader<T> = (options: { force: boolean; signal: AbortSignal }) => Promise<T>;

type FetchState<T> = {
  data: T | null;
  /** Primeira carga ou "tentar de novo": a tela mostra o indicador. */
  loading: boolean;
  /** Puxar para atualizar: os dados antigos continuam na tela. */
  refreshing: boolean;
  error: string | null;
  /** Busca de novo mostrando o indicador de carregamento. */
  reload: () => void;
  /** Busca de novo ignorando o cache, sem esconder o que já está na tela. */
  refresh: () => void;
};

function messageFor(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Algo deu errado. Tente de novo.';
}

/**
 * Carrega dados assíncronos e entrega os estados que toda tela com dados
 * precisa tratar: carregando, erro, vazio (decisão da tela) e sucesso.
 *
 * `load` deve ser estável (useCallback): trocar a função dispara nova busca e
 * cancela a anterior, então uma resposta atrasada nunca sobrescreve a mais nova.
 */
export function useFetch<T>(load: Loader<T>): FetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const controllerRef = useRef<AbortController | null>(null);

  const run = useCallback(
    async (mode: 'load' | 'reload' | 'refresh') => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      if (mode === 'refresh') setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const result = await load({ force: mode === 'refresh', signal: controller.signal });
        if (controller.signal.aborted) return;
        setData(result);
      } catch (caught) {
        if (controller.signal.aborted) return;
        setError(messageFor(caught));
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [load],
  );

  useEffect(() => {
    void run('load');
    return () => controllerRef.current?.abort();
  }, [run]);

  const reload = useCallback(() => void run('reload'), [run]);
  const refresh = useCallback(() => void run('refresh'), [run]);

  return { data, loading, refreshing, error, reload, refresh };
}
