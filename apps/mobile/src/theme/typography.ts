import type { TextStyle } from 'react-native';

/**
 * Famílias da fonte Geist carregadas em app/_layout.tsx.
 * No React Native o peso vem da família, não de fontWeight.
 */
export const fontFamily = {
  regular: 'Geist_400Regular',
  medium: 'Geist_500Medium',
  semiBold: 'Geist_600SemiBold',
  bold: 'Geist_700Bold',
} as const;

/**
 * Variantes tipográficas do protótipo.
 * letterSpacing convertido de `em` para px (valor em * fontSize).
 */
export const textVariants = {
  /** Saudação da Home — 31px/500, -.02em */
  display: { fontFamily: fontFamily.medium, fontSize: 31, letterSpacing: -0.62 },
  /** Título de cartão — 22px/500, -.01em */
  title: { fontFamily: fontFamily.medium, fontSize: 22, letterSpacing: -0.22 },
  /** Título de seção — 17px/500 */
  sectionTitle: { fontFamily: fontFamily.medium, fontSize: 17 },
  /** Corpo — 15px/400 */
  body: { fontFamily: fontFamily.regular, fontSize: 15 },
  /** Corpo com ênfase — 15px/500 */
  bodyStrong: { fontFamily: fontFamily.medium, fontSize: 15 },
  /** Texto de apoio — 14px/400, altura 1.5 */
  supporting: { fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 21 },
  /** Texto de apoio com ênfase — 14px/500 */
  supportingStrong: { fontFamily: fontFamily.medium, fontSize: 14 },
  /** Legenda — 13px/400 */
  caption: { fontFamily: fontFamily.regular, fontSize: 13 },
  /** Legenda com ênfase — 13px/500 */
  captionMedium: { fontFamily: fontFamily.medium, fontSize: 13 },
  /** Legenda forte — 13px/600 */
  captionStrong: { fontFamily: fontFamily.semiBold, fontSize: 13 },
  /** Etiqueta de tarefa — 12px/400, .03em */
  tag: { fontFamily: fontFamily.regular, fontSize: 12, letterSpacing: 0.36 },
  /** Data do topo da Home — 12px/500 maiúsculas, .08em */
  overline: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    letterSpacing: 0.96,
    textTransform: 'uppercase',
  },
  /** Rótulo interno de cartão — 11px/600 maiúsculas, .09em */
  overlineSmall: {
    fontFamily: fontFamily.semiBold,
    fontSize: 11,
    letterSpacing: 0.99,
    textTransform: 'uppercase',
  },
  /** Rótulo da navegação inferior — 11px, .01em */
  tabLabel: { fontFamily: fontFamily.regular, fontSize: 11, letterSpacing: 0.11 },
  /** Rótulo da navegação inferior ativo — 11px/600 */
  tabLabelActive: { fontFamily: fontFamily.semiBold, fontSize: 11, letterSpacing: 0.11 },
} as const satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof textVariants;
