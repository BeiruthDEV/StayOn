import type { IconName } from '@/icons';

/** Área de foco oferecida na configuração inicial. */
export type FocusArea = {
  label: string;
  icon: IconName;
};

/**
 * Áreas oferecidas na configuração inicial.
 * O rótulo vira a etiqueta das tarefas e dos blocos, então é ele que fica salvo.
 */
export const focusAreas: readonly FocusArea[] = [
  { label: 'Estudos', icon: 'graduation' },
  { label: 'Carreira', icon: 'briefcase' },
  { label: 'Saúde', icon: 'heart' },
  { label: 'Leitura', icon: 'book' },
  { label: 'Projetos', icon: 'wrench' },
  { label: 'Pessoal', icon: 'target' },
];
