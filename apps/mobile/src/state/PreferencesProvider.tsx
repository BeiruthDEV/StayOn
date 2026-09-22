import { createContext, useCallback, useContext, useMemo } from 'react';

import {
  clampSessionMinutes,
  defaultPreferences,
  type InterventionLevel,
  type Preferences,
} from '@/domain/preferences';
import { storageKeys, usePersistentState } from '@/storage';

type PreferencesContextValue = {
  preferences: Preferences;
  /** Falso até a leitura do disco terminar — evita piscar o onboarding. */
  hydrated: boolean;
  setName: (name: string) => void;
  setFocusAreas: (areas: readonly string[]) => void;
  setInterventionLevel: (level: InterventionLevel) => void;
  setSessionMinutes: (minutes: number) => void;
  /** Marca a configuração inicial como concluída. */
  completeOnboarding: (name: string, areas: readonly string[]) => void;
  /** Volta às preferências de fábrica. */
  reset: () => void;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const { value: preferences, setValue, hydrated } = usePersistentState<Preferences>(
    storageKeys.preferences,
    defaultPreferences,
  );

  const setName = useCallback(
    (name: string) => setValue((current) => ({ ...current, name })),
    [setValue],
  );

  const setFocusAreas = useCallback(
    (focusAreas: readonly string[]) => setValue((current) => ({ ...current, focusAreas })),
    [setValue],
  );

  const setInterventionLevel = useCallback(
    (interventionLevel: InterventionLevel) =>
      setValue((current) => ({ ...current, interventionLevel })),
    [setValue],
  );

  const setSessionMinutes = useCallback(
    (minutes: number) =>
      setValue((current) => ({ ...current, sessionMinutes: clampSessionMinutes(minutes) })),
    [setValue],
  );

  const completeOnboarding = useCallback(
    (name: string, areas: readonly string[]) =>
      setValue((current) => ({
        ...current,
        name: name.trim(),
        focusAreas: areas,
        onboarded: true,
      })),
    [setValue],
  );

  const reset = useCallback(() => setValue(() => defaultPreferences), [setValue]);

  const value = useMemo(
    () => ({
      preferences,
      hydrated,
      setName,
      setFocusAreas,
      setInterventionLevel,
      setSessionMinutes,
      completeOnboarding,
      reset,
    }),
    [
      preferences,
      hydrated,
      setName,
      setFocusAreas,
      setInterventionLevel,
      setSessionMinutes,
      completeOnboarding,
      reset,
    ],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesContextValue {
  const context = useContext(PreferencesContext);
  if (context === null) {
    throw new Error('usePreferences precisa estar dentro de PreferencesProvider.');
  }
  return context;
}
