import { NativeModule, requireOptionalNativeModule } from 'expo';

/** Um aplicativo instalado que pode entrar na lista de bloqueio. */
export type InstalledApp = {
  /** Identificador do aplicativo no sistema, por exemplo com.instagram.android. */
  packageName: string;
  /** Nome como aparece na gaveta. */
  label: string;
};

declare class StayOnBlockerModule extends NativeModule {
  /** Se a permissão de acessibilidade já foi concedida ao StayOn. */
  isAccessibilityEnabled(): boolean;
  /** Abre a tela de acessibilidade do sistema, única forma de conceder. */
  openAccessibilitySettings(): void;
  /** Aplicativos que aparecem na gaveta, em ordem alfabética. */
  listInstalledApps(): Promise<InstalledApp[]>;
  /**
   * Bloqueia os pacotes até o horário dado, em milissegundos.
   * Em modo estrito o aplicativo é fechado; fora dele só aparece um aviso.
   */
  startBlocking(packageNames: string[], endsAt: number, strict: boolean): void;
  /** Libera tudo antes da hora. */
  stopBlocking(): void;
  /** Se existe bloqueio valendo agora. */
  isBlocking(): boolean;
}

/**
 * Vale null onde o módulo nativo não existe — no Expo Go, por exemplo, que é um
 * aplicativo pronto e não carrega código nativo nosso. Buscar de forma opcional
 * em vez de obrigatória evita que o StayOn inteiro quebre ao abrir nesses
 * ambientes: quem usa o bloqueio checa antes se ele está disponível.
 */
export default requireOptionalNativeModule<StayOnBlockerModule>('StayOnBlocker');
