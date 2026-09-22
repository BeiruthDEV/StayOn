import { StyleSheet, TextInput } from 'react-native';

import { AppText } from '@/components';
import { colors, fontFamily, radius, spacing } from '@/theme';

type ReflectionFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
};

/** Campo de texto livre das perguntas de reflexão da semana. */
export function ReflectionField({
  label,
  placeholder,
  value,
  onChangeText,
}: ReflectionFieldProps) {
  return (
    <>
      <AppText variant="overlineSmall" color="textDim" style={styles.label}>
        {label}
      </AppText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        multiline
        textAlignVertical="top"
        accessibilityLabel={label}
        style={styles.input}
      />
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: spacing.md,
  },
  input: {
    minHeight: 96,
    padding: spacing.xxl,
    marginBottom: spacing.section,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
  },
});
