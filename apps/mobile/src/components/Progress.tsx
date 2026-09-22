import { StyleSheet, View } from 'react-native';

import { colors, radius } from '@/theme';

type ProgressProps = {
  /** Percentual concluído, de 0 a 100. */
  percent: number;
};

/** Barra de progresso fina (3px) usada no resumo do dia. */
export function Progress({ percent }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <View
      style={styles.track}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: clamped }}
    >
      <View style={[styles.fill, { width: `${clamped}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flex: 1,
    height: 3,
    borderRadius: radius.xs,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.xs,
    backgroundColor: colors.fillLight,
  },
});
