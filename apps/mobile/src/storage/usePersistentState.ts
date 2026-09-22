import { useCallback, useEffect, useRef, useState } from 'react';

import type { StorageKey } from './keys';
import { readValue, writeValue } from './storage';

type PersistentState<T> = {
  value: T;
  setValue: (update: T | ((current: T) => T)) => void;
  /** Falso até a primeira leitura do disco terminar. */
  hydrated: boolean;
};

/**
 * Estado que sobrevive ao fechamento do aplicativo.
 *
 * Renderiza com `initial` enquanto lê o disco e substitui pelo valor salvo
 * quando ele chega. Gravações posteriores não bloqueiam a interface.
 */
export function usePersistentState<T>(key: StorageKey, initial: T): PersistentState<T> {
  const [value, setState] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);
  const hydratedRef = useRef(false);

  useEffect(() => {
    let active = true;

    readValue<T>(key).then((stored) => {
      if (!active) return;
      if (stored !== undefined) setState(stored);
      hydratedRef.current = true;
      setHydrated(true);
    });

    return () => {
      active = false;
    };
  }, [key]);

  const setValue = useCallback(
    (update: T | ((current: T) => T)) => {
      setState((current) => {
        const next =
          typeof update === 'function' ? (update as (current: T) => T)(current) : update;

        // Só grava depois da hidratação, para não sobrescrever o disco com o
        // valor inicial numa atualização disparada durante a leitura.
        if (hydratedRef.current) void writeValue(key, next);

        return next;
      });
    },
    [key],
  );

  return { value, setValue, hydrated };
}
