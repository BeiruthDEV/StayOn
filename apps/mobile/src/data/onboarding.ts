import type { IconName } from '@/icons';

/** Área de foco oferecida na configuração inicial. */
export type FocusArea = {
  id: string;
  label: string;
  icon: IconName;
};

/** Total de passos da configuração inicial. */
export const onboardingSteps = 3;

/** Passo atual — a seleção de áreas é o primeiro. */
export const currentStep = 1;

/** Áreas oferecidas na primeira pergunta. */
export const focusAreas: readonly FocusArea[] = [
  { id: 'study', label: 'Estudos', icon: 'graduation' },
  { id: 'career', label: 'Carreira', icon: 'briefcase' },
  { id: 'health', label: 'Saúde', icon: 'heart' },
  { id: 'reading', label: 'Leitura', icon: 'book' },
  { id: 'projects', label: 'Projetos pessoais', icon: 'wrench' },
  { id: 'custom', label: 'Meta personalizada', icon: 'plus' },
];
