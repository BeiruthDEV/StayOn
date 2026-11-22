/**
 * Sessão local do usuário.
 *
 * O StayOn não tem servidor nem senha: entrar só identifica quem usa o aparelho
 * (o nome aparece na saudação). Por isso não há token a proteger — se um dia
 * houver login real, o token deve ir para o SecureStore, nunca para cá.
 */
export type Session = {
  name: string;
  /** Quando a sessão começou (ms desde 1970). */
  signedInAt: number;
};

export const MAX_NAME_LENGTH = 40;

/**
 * Limpa e valida o nome digitado: tira caracteres de controle, junta espaços
 * repetidos e recusa vazio ou comprido demais. Devolve `null` se inválido.
 */
export function normalizeName(raw: string): string | null {
  const name = raw
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return name.length > 0 && name.length <= MAX_NAME_LENGTH ? name : null;
}

/** Valida o que foi lido do disco; dado corrompido vira `null` (sem sessão). */
export function parseSession(payload: unknown): Session | null {
  if (typeof payload !== 'object' || payload === null) return null;

  const { name, signedInAt } = payload as Record<string, unknown>;
  if (typeof name !== 'string' || typeof signedInAt !== 'number') return null;

  const clean = normalizeName(name);
  return clean === null || clean !== name ? null : { name: clean, signedInAt };
}
