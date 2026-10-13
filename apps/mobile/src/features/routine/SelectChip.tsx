import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components';
import { colors, motion, radius, spacing } from '@/theme';

type SelectChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** `checkbox` para escolha múltipla, `radio` para escolha única. */
  role?: 'checkbox' | 'radio' | 'button';
  disabled?: boolean;
  compact?: boolean;
};

/** Etiqueta tocável usada nos seletores de dia, horário e área da rotina. */
export function SelectChip({
  label,
  selected,
  onPress,
  role = 'radio',
  disabled = false,
  compact = false,
}: SelectChipProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole={role}
      accessibilityState={{
        selected,
        checked: role === 'checkbox' ? selected : undefined,
        disabled,
      }}
      hitSlop={4}
      style={({ pressed }) => [
        styles.chip,
        compact && styles.compact,
        selected && styles.selected,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <AppText variant="captionMedium" color={selected ? 'onLight' : 'textMuted'}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minWidth: 44,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
  },
  compact: {
    minWidth: 0,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.md,
  },
  selected: {
    backgroundColor: colors.fillLight,
    borderColor: colors.fillLight,
  },
  disabled: {
    opacity: 0.35,
  },
  pressed: {
    opacity: motion.pressedOpacity,
  },
});
