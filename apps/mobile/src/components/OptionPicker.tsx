import { Pressable, StyleSheet, View } from 'react-native';

import { colors, motion, radius, spacing } from '@/theme';

import { AppText } from './AppText';

type Option<T extends string> = {
  value: T;
  label: string;
};

type OptionPickerProps<T extends string> = {
  label: string;
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** Escolha única em forma de etiquetas — categoria de evento, área da tarefa. */
export function OptionPicker<T extends string>({
  label,
  options,
  value,
  onChange,
}: OptionPickerProps<T>) {
  return (
    <View style={styles.field}>
      <AppText variant="overlineSmall" color="textDim" style={styles.label}>
        {label}
      </AppText>

      <View style={styles.options}>
        {options.map((option) => {
          const selected = option.value === value;

          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={({ pressed }) => [
                styles.option,
                selected && styles.optionSelected,
                pressed && styles.pressed,
              ]}
            >
              <AppText
                variant="captionMedium"
                color={selected ? 'onLight' : 'textMuted'}
              >
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: spacing.xxl,
  },
  label: {
    marginBottom: spacing.md,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  option: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
  },
  optionSelected: {
    borderColor: colors.fillLight,
    backgroundColor: colors.fillLight,
  },
  pressed: {
    opacity: motion.pressedOpacity,
  },
});
