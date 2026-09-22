import { useCallback, useEffect, useMemo, useState } from 'react';

import { EXTENSION_MINUTES } from '@/domain/focusSession';

type FocusSession = {
  /** Segundos restantes da sessão. */
  remaining: number;
  /** Duração total, já considerando as extensões. */
  total: number;
  running: boolean;
  /** Quantas vezes a sessão foi pausada — as interrupções da sessão. */
  pauses: number;
  /** Minutos já focados, arredondados para baixo. */
  elapsedMinutes: number;
  /** Alterna entre pausado e em andamento. */
  toggleRunning: () => void;
  /** Acrescenta EXTENSION_MINUTES ao tempo restante e ao total. */
  extend: () => void;
};

/**
 * Cronômetro regressivo da sessão de foco.
 * Decrementa a cada segundo enquanto estiver em andamento e para no zero.
 */
export function useFocusSession(durationMinutes: number): FocusSession {
  const initialSeconds = useMemo(() => Math.max(0, durationMinutes) * 60, [durationMinutes]);

  const [total, setTotal] = useState(initialSeconds);
  const [remaining, setRemaining] = useState(initialSeconds);
  const [running, setRunning] = useState(true);
  const [pauses, setPauses] = useState(0);

  useEffect(() => {
    setTotal(initialSeconds);
    setRemaining(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (!running || remaining <= 0) return;

    const interval = setInterval(() => {
      setRemaining((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [running, remaining]);

  const toggleRunning = useCallback(() => {
    setRunning((current) => {
      // Só conta como interrupção quando a sessão é pausada, não ao retomar.
      if (current) setPauses((count) => count + 1);
      return !current;
    });
  }, []);

  const extend = useCallback(() => {
    const extra = EXTENSION_MINUTES * 60;
    setTotal((current) => current + extra);
    setRemaining((current) => current + extra);
  }, []);

  return {
    remaining,
    total,
    running,
    pauses,
    elapsedMinutes: Math.floor((total - remaining) / 60),
    toggleRunning,
    extend,
  };
}
