import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, spacing } from '@/theme';

import { AppText } from './AppText';

type StatTileProps = {
  /** Rótulo em maiúsculas acima do valor. */
  label: string;
  value: string;
  /** Complemento à direita do valor, ex.: "tentativas". */
  unit?: string;
  style?: StyleProp<ViewStyle>;
};

/** Bloco compacto de métrica — contadores da sessão de foco e dos insights. */
export function StatTile({ label, value, unit, style }: StatTileProps) {
  return (
    <View style={[styles.tile, style]}>
      <AppText variant="overlineSmall" color="textDim">
        {label}
      </AppText>
      <View style={styles.valueRow}>
        <AppText variant="title">{value}</AppText>
        {unit ? (
          <AppText variant="caption" color="textDim">
            {unit}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xl,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
