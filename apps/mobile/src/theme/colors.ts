/**
 * Paleta extraída do protótipo (prototype/StayOn.dc.html).
 * Tema escuro único — o protótipo não possui variante clara.
 */
export const colors = {
  /** Fundo da aplicação. */
  background: '#050505',
  /** Superfície de cartão elevado sobre o fundo. */
  surface: '#0A0A0B',
  /** Superfície de item selecionado / toast / chip ativo. */
  surfaceRaised: '#121214',
  /** Borda padrão de superfícies. */
  border: '#1B1B1E',
  /** Borda de ênfase (item selecionado, checkbox inativo). */
  borderStrong: '#29292D',
  /** Separador de linhas de lista. */
  hairline: '#121214',
  /** Texto primário. */
  text: '#F5F5F5',
  /** Texto secundário. */
  textMuted: '#A3A3AA',
  /** Texto terciário / ícone inativo. */
  textDim: '#707077',
  /** Texto de menor ênfase (placeholder). */
  textFaint: '#525258',
  /** Texto/ícone sobre superfícies claras (botão primário). */
  onLight: '#080808',
  /** Preenchimento sólido claro (checkbox marcado, barra de progresso). */
  fillLight: '#F5F5F5',
  transparent: 'transparent',
} as const;

/** Gradiente do botão primário e do FAB. */
export const gradients = {
  cta: ['#FFFFFF', '#ECECEE'] as const,
};
