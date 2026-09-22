import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '@/icons';
import { colors, gradients, motion, radius, shadows } from '@/theme';

type IconButtonProps = {
  name: IconName;
  onPress: () => void;
  accessibilityLabel: string;
  /** `plain` é o ícone discreto de cabeçalho; `raised` é o botão flutuante claro. */
  variant?: 'plain' | 'raised';
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

/** Botão composto apenas por um ícone. */
export function IconButton({
  name,
  onPress,
  accessibilityLabel,
  variant = 'plain',
  size = 20,
  color = colors.textDim,
  style,
}: IconButtonProps) {
  if (variant === 'raised') {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [shadows.floating, styles.raised, pressed && styles.pressedRaised, style]}
      >
        <LinearGradient colors={gradients.cta} style={styles.raisedSurface}>
          <Icon name={name} size={size} strokeWidth={2} color={colors.onLight} />
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={HIT_SLOP}
      style={({ pressed }) => [pressed && styles.pressed, style]}
    >
      <Icon name={name} size={size} color={color} />
    </Pressable>
  );
}

const RAISED_SIZE = 54;

/** Expande a área de toque do ícone discreto até o alvo mínimo recomendado. */
const HIT_SLOP = { top: 12, bottom: 12, left: 12, right: 12 } as const;

const styles = StyleSheet.create({
  raised: {
    width: RAISED_SIZE,
    height: RAISED_SIZE,
    borderRadius: radius.pill,
  },
  raisedSurface: {
    flex: 1,
    borderRadius: radius.pill,
    borderTopWidth: 1,
    borderTopColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: motion.pressedOpacity,
  },
  pressedRaised: {
    transform: [{ scale: motion.pressedScaleStrong }],
  },
});
