import { StyleSheet, TextInput, View, type KeyboardTypeOptions } from 'react-native';

import { colors, fontFamily, radius, spacing } from '@/theme';

import { AppText } from './AppText';

type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  /** Mensagem de erro exibida abaixo do campo. */
  error?: string | undefined;
  /** Texto de ajuda exibido abaixo do campo quando não há erro. */
  hint?: string;
  multiline?: boolean;
  maxLength?: number;
  keyboardType?: KeyboardTypeOptions;
  autoFocus?: boolean;
};

/** Campo de texto rotulado, com estado de erro. */
export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  hint,
  multiline = false,
  maxLength,
  keyboardType,
  autoFocus = false,
}: TextFieldProps) {
  return (
    <View style={styles.field}>
      <AppText variant="overlineSmall" color="textDim" style={styles.label}>
        {label}
      </AppText>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        multiline={multiline}
        maxLength={maxLength}
        keyboardType={keyboardType}
        autoFocus={autoFocus}
        textAlignVertical={multiline ? 'top' : 'center'}
        accessibilityLabel={label}
        style={[styles.input, multiline && styles.multiline, error !== undefined && styles.invalid]}
      />

      {error !== undefined ? (
        <AppText variant="caption" color="danger" style={styles.helper}>
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption" color="textDim" style={styles.helper}>
          {hint}
        </AppText>
      ) : null}
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
  input: {
    height: 48,
    paddingHorizontal: spacing.xxl,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
    color: colors.text,
    fontFamily: fontFamily.regular,
    fontSize: 15,
  },
  multiline: {
    height: 'auto',
    minHeight: 92,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    lineHeight: 22,
  },
  invalid: {
    borderColor: colors.dangerBorder,
  },
  helper: {
    marginTop: spacing.sm,
  },
});
