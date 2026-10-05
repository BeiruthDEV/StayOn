import { createContext, useCallback, useContext, useMemo } from 'react';

import { storageKeys, usePersistentState } from '@/storage';

import { usePreferences } from './PreferencesProvider';

import StayOnBlocker, { type InstalledApp } from '../../modules/stay-on-blocker';

export type { InstalledApp };

type BlockedAppsContextValue = {
  /** Pacotes escolhidos para serem barrados durante a sessão. */
  packages: readonly string[];
  /** Se este build traz o módulo nativo de bloqueio. */
  available: boolean;
  /** Se a permissão de acessibilidade está concedida agora. */
  hasPermission: () => boolean;
  /** Abre a tela de acessibilidade do sistema. */
  openSettings: () => void;
  /** Aplicativos que a pessoa pode escolher, em ordem alfabética. */
  listApps: () => Promise<readonly InstalledApp[]>;
  /** Entra ou sai da lista de bloqueio. */
  toggle: (packageName: string) => void;
  /**
   * Liga o bloqueio até o horário informado, em milissegundos. O rigor vem do
   * nível de intervenção escolhido no Perfil.
   */
  startBlocking: (endsAt: number) => void;
  /** Libera tudo antes da hora, quando a sessão é encerrada na mão. */
  stopBlocking: () => void;
};

const BlockedAppsContext = createContext<BlockedAppsContextValue | null>(null);

/** A lista começa vazia: só bloqueia o que a pessoa escolher. */
const NO_APPS: readonly string[] = [];

/**
 * Única fronteira do aplicativo com o módulo nativo de bloqueio.
 *
 * Concentrar o acesso aqui significa que a verificação de existência do módulo
 * acontece num lugar só: nas telas o bloqueio é apenas mais um estado, e onde
 * ele não existe cada chamada simplesmente não faz nada.
 */
export function BlockedAppsProvider({ children }: { children: React.ReactNode }) {
  const { value: packages, setValue } = usePersistentState<readonly string[]>(
    storageKeys.blockedApps,
    NO_APPS,
  );
  const { preferences } = usePreferences();
  const strict = preferences.interventionLevel === 'Rígido';

  const toggle = useCallback(
    (packageName: string) =>
      setValue((current) =>
        current.includes(packageName)
          ? current.filter((item) => item !== packageName)
          : [...current, packageName],
      ),
    [setValue],
  );

  const startBlocking = useCallback(
    (endsAt: number) => {
      if (packages.length === 0) return;
      StayOnBlocker?.startBlocking([...packages], endsAt, strict);
    },
    [packages, strict],
  );

  const stopBlocking = useCallback(() => StayOnBlocker?.stopBlocking(), []);

  // A permissão é lida na hora, e não guardada em estado, porque muda fora do
  // aplicativo: a pessoa concede e revoga pelos ajustes do sistema.
  const hasPermission = useCallback(() => StayOnBlocker?.isAccessibilityEnabled() ?? false, []);

  const openSettings = useCallback(() => StayOnBlocker?.openAccessibilitySettings(), []);

  const listApps = useCallback(
    async (): Promise<readonly InstalledApp[]> => (await StayOnBlocker?.listInstalledApps()) ?? [],
    [],
  );

  const value = useMemo(
    () => ({
      packages,
      available: StayOnBlocker !== null,
      hasPermission,
      openSettings,
      listApps,
      toggle,
      startBlocking,
      stopBlocking,
    }),
    [packages, hasPermission, openSettings, listApps, toggle, startBlocking, stopBlocking],
  );

  return <BlockedAppsContext.Provider value={value}>{children}</BlockedAppsContext.Provider>;
}

export function useBlockedApps(): BlockedAppsContextValue {
  const context = useContext(BlockedAppsContext);
  if (context === null) {
    throw new Error('useBlockedApps precisa estar dentro de BlockedAppsProvider.');
  }
  return context;
}
