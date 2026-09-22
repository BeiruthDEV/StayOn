import type { ViewStyle } from 'react-native';

/**
 * Sombras do protótipo convertidas para a API do React Native.
 * O `inset 0 1px 0 rgba(255,255,255,.04)` do CSS não existe no RN —
 * é reproduzido com a borda superior clara nos componentes que o usavam.
 */
export const shadows = {
  /** Cartão "Próxima ação": 0 12px 32px rgba(0,0,0,.5) */
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 32,
    elevation: 12,
  },
  /** Botão primário: 0 2px 10px rgba(0,0,0,.45) */
  cta: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 4,
  },
  /** FAB: 0 8px 24px rgba(0,0,0,.6) */
  floating: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 10,
  },
  /** Toast: 0 12px 32px rgba(0,0,0,.6) */
  toast: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 32,
    elevation: 14,
  },
} as const satisfies Record<string, ViewStyle>;
