/** Rigidez dos bloqueios durante uma sessão de foco. */
export type InterventionLevel = 'Suave' | 'Rígido';

/** Preferências da pessoa, guardadas no aparelho. */
export type Preferences = {
  /** Nome usado na saudação da Home. */
  name: string;
  /** Áreas escolhidas na configuração inicial. */
  focusAreas: readonly string[];
  interventionLevel: InterventionLevel;
  /** Duração padrão de uma sessão sem bloco planejado, em minutos. */
  sessionMinutes: number;
  /** Falso até a configuração inicial ser concluída. */
  onboarded: boolean;
};

/** Estado inicial, antes da primeira configuração. */
export const defaultPreferences: Preferences = {
  name: '',
  focusAreas: [],
  interventionLevel: 'Suave',
  sessionMinutes: 45,
  onboarded: false,
};

/** Primeiro nome, para a saudação. Vazio quando a pessoa não informou. */
export function firstName(preferences: Preferences): string {
  return preferences.name.trim().split(' ')[0] ?? '';
}

/** Iniciais exibidas no avatar do perfil. */
export function initials(preferences: Preferences): string {
  const parts = preferences.name.trim().split(' ').filter((part) => part !== '');
  if (parts.length === 0) return '?';

  const first = parts[0]?.charAt(0) ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? '') : '';

  return `${first}${last}`.toUpperCase();
}

/** Duração padrão da sessão, limitada a valores razoáveis. */
export function clampSessionMinutes(minutes: number): number {
  if (!Number.isFinite(minutes)) return defaultPreferences.sessionMinutes;
  return Math.min(180, Math.max(5, Math.round(minutes)));
}

/** Áreas usadas quando a pessoa ainda não escolheu nenhuma. */
const FALLBACK_AREAS = ['Estudos', 'Carreira', 'Saúde', 'Pessoal'] as const;

/** Etiquetas oferecidas ao criar tarefas e blocos. */
export function availableTags(preferences: Preferences): readonly string[] {
  return preferences.focusAreas.length > 0 ? preferences.focusAreas : FALLBACK_AREAS;
}
