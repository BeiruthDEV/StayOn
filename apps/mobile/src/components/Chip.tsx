import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, spacing } from '@/theme';

import { AppText } from './AppText';

type ChipTone = 'neutral' | 'outline' | 'danger';

type ChipProps = {
  label: string;
  /** `neutral` é a etiqueta preenchida; `outline` só contorno; `danger` é o alerta. */
  tone?: ChipTone;
  /** Ícone opcional à esquerda do rótulo. */
  leading?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Etiqueta arredondada usada em categorias, status e destaques. */
export function Chip({ label, tone = 'neutral', leading, style }: ChipProps) {
  return (
    <View style={[styles.chip, TONE_STYLE[tone], style]}>
      {leading}
      <AppText variant="overlineSmall" color={TONE_COLOR[tone]}>
        {label}
      </AppText>
    </View>
  );
}

const TONE_COLOR = {
  neutral: 'textMuted',
  outline: 'textDim',
  danger: 'danger',
} as const;

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  neutral: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
  },
  outline: {
    backgroundColor: colors.transparent,
    borderColor: colors.borderStrong,
  },
  danger: {
    backgroundColor: colors.dangerSurface,
    borderColor: colors.dangerBorder,
  },
});

const TONE_STYLE = {
  neutral: styles.neutral,
  outline: styles.outline,
  danger: styles.danger,
} as const;
