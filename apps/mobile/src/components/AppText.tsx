import { Text, type StyleProp, type TextStyle } from 'react-native';

import { colors, textVariants, type TextVariant } from '@/theme';

/** Cores de texto permitidas — evita cor arbitrária espalhada pelas telas. */
export type TextColor =
  | 'text'
  | 'textMuted'
  | 'textDim'
  | 'textFaint'
  | 'onLight'
  | 'danger'
  | 'dangerStrong'
  | 'success';

type AppTextProps = {
  variant?: TextVariant;
  color?: TextColor;
  numberOfLines?: number;
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
};

/** Texto da aplicação. Aplica a variante tipográfica e a cor do tema. */
export function AppText({
  variant = 'body',
  color = 'text',
  numberOfLines,
  style,
  children,
}: AppTextProps) {
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[textVariants[variant], { color: colors[color] }, style]}
    >
      {children}
    </Text>
  );
}
