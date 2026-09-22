import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { gradients, motion, radius, shadows } from '@/theme';

import { AppText } from './AppText';

type ButtonProps = {
  label: string;
  onPress: () => void;
  /** `primary` usa o gradiente claro; `ghost` é somente texto. */
  variant?: 'primary' | 'ghost';
  /** Conteúdo à direita do rótulo (ícone). */
  trailing?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Botão de ação. O primário reproduz o CTA claro do protótipo. */
export function Button({ label, onPress, variant = 'primary', trailing, style }: ButtonProps) {
  if (variant === 'ghost') {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => [styles.ghost, pressed && styles.pressed, style]}
      >
        <AppText variant="captionMedium" color="textMuted">
          {label}
        </AppText>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        shadows.cta,
        styles.primaryWrapper,
        pressed && styles.pressedPrimary,
        style,
      ]}
    >
      <LinearGradient colors={gradients.cta} style={styles.primary}>
        <View style={styles.primaryContent}>
          <AppText variant="bodyStrong" color="onLight">
            {label}
          </AppText>
          {trailing}
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primaryWrapper: {
    borderRadius: radius.md,
  },
  primary: {
    height: 50,
    borderRadius: radius.md,
    borderTopWidth: 1,
    borderTopColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ghost: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  pressed: {
    opacity: motion.pressedOpacity,
  },
  pressedPrimary: {
    opacity: 0.93,
    transform: [{ scale: motion.pressedScale }],
  },
});
