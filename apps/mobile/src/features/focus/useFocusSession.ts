import { useCallback, useEffect, useState } from 'react';

import { EXTENSION_MINUTES } from '@/domain/focusSession';

/** Em que ponto a sessão está. */
export type SessionStatus = 'idle' | 'running' | 'paused';

type FocusSession = {
  status: SessionStatus;
  /** Segundos restantes da sessão. */
  remaining: number;
  /** Duração total, já considerando as extensões. */
  total: number;
  /** Segundos já focados. */
  elapsed: number;
  /** Quantas vezes a sessão foi pausada — as interrupções da sessão. */
  pauses: number;
  /** Começa uma sessão com a duração escolhida. */
  start: (minutes: number) => void;
  /** Alterna entre pausado e em andamento. */
  togglePause: () => void;
  /** Acrescenta EXTENSION_MINUTES ao tempo restante e ao total. */
  extend: () => void;
  /** Encerra e volta ao estado de montar uma nova sessão. */
  stop: () => void;
};

/**
 * Cronômetro regressivo da sessão de foco.
 * Nasce parado: a sessão só começa quando a pessoa monta e inicia.
 */
export function useFocusSession(): FocusSession {
  const [status, setStatus] = useState<SessionStatus>('idle');
  const [total, setTotal] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [pauses, setPauses] = useState(0);

  useEffect(() => {
    if (status !== 'running' || remaining <= 0) return;

    const interval = setInterval(() => {
      setRemaining((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [status, remaining]);

  const start = useCallback((minutes: number) => {
    const seconds = Math.max(1, Math.round(minutes)) * 60;
    setTotal(seconds);
    setRemaining(seconds);
    setPauses(0);
    setStatus('running');
  }, []);

  const togglePause = useCallback(() => {
    // Decidido aqui fora: atualizador de estado precisa ser função pura.
    if (status === 'running') {
      setPauses((count) => count + 1);
      setStatus('paused');
    } else if (status === 'paused') {
      setStatus('running');
    }
  }, [status]);

  const extend = useCallback(() => {
    const extra = EXTENSION_MINUTES * 60;
    setTotal((current) => current + extra);
    setRemaining((current) => current + extra);
  }, []);

  const stop = useCallback(() => {
    setStatus('idle');
    setTotal(0);
    setRemaining(0);
    setPauses(0);
  }, []);

  return {
    status,
    remaining,
    total,
    elapsed: total - remaining,
    pauses,
    start,
    togglePause,
    extend,
    stop,
  };
}
