import type { IconName } from '@/icons';

/** Dados da conta exibidos no topo do perfil. */
export const account = {
  name: 'João Dias',
  initials: 'JD',
  role: 'Arquiteto de foco',
  badges: ['Trabalho profundo', 'Modo zen'],
} as const;

/** Item configurável do sistema pessoal. */
export type SystemItem = {
  id: string;
  title: string;
  description: string;
  icon: IconName;
};

/** Blocos do sistema pessoal — o que a pessoa define uma vez e revisa. */
export const systemItems: readonly SystemItem[] = [
  {
    id: 'goals',
    title: 'Metas',
    description: 'Defina os objetivos principais.',
    icon: 'flag',
  },
  {
    id: 'routine',
    title: 'Rotina',
    description: 'Estruture as cadências do dia.',
    icon: 'clock',
  },
  {
    id: 'focus-params',
    title: 'Parâmetros de foco',
    description: 'Duração das sessões e das pausas.',
    icon: 'focus',
  },
  {
    id: 'targets',
    title: 'Alvos',
    description: 'Métricas de produção da semana.',
    icon: 'target',
  },
];

/** Estado de uma integração externa. */
export type ConnectionStatus = 'connected' | 'available';

export type Connection = {
  id: string;
  name: string;
  /** Rótulo do estado, ex.: "sincronizado". */
  statusLabel: string;
  status: ConnectionStatus;
  icon: IconName;
};

/** Integrações do StayOn com outros aplicativos. */
export const connections: readonly Connection[] = [
  {
    id: 'calendar',
    name: 'Calendário',
    statusLabel: 'sincronizado',
    status: 'connected',
    icon: 'calendar',
  },
  {
    id: 'desktop',
    name: 'App desktop',
    statusLabel: 'ativo',
    status: 'connected',
    icon: 'monitor',
  },
  {
    id: 'browser',
    name: 'Extensão',
    statusLabel: 'conectar',
    status: 'available',
    icon: 'globe',
  },
  {
    id: 'mobile',
    name: 'App mobile',
    statusLabel: 'conectar',
    status: 'available',
    icon: 'phone',
  },
];

/** Ajustes gerais do aplicativo. */
export const appSettings = [
  { id: 'appearance', title: 'Aparência', trailing: 'Escuro' },
  { id: 'privacy', title: 'Privacidade e dados', trailing: '' },
  { id: 'subscription', title: 'Assinatura', trailing: 'Plano Pro' },
] as const;
