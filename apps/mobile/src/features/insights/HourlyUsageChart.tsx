import { StyleSheet, View } from 'react-native';

import { AppText, Card } from '@/components';
import { barPercent, peakWindow, type HourlyUsage } from '@/domain/usage';
import { colors, radius, spacing } from '@/theme';

type HourlyUsageChartProps = {
  usage: readonly HourlyUsage[];
};

/** Gráfico de barras do uso por faixa de horário, com destaque no pico. */
export function HourlyUsageChart({ usage }: HourlyUsageChartProps) {
  const peak = peakWindow(usage);

  return (
    <Card>
      <View style={styles.header}>
        <AppText variant="sectionTitle">Uso por hora</AppText>
        {peak ? (
          <AppText variant="caption" color="textDim">
            Pico: {peak.label}
          </AppText>
        ) : null}
      </View>

      <View style={styles.chart} accessibilityLabel="Gráfico de uso por faixa de horário">
        {usage.map((entry) => {
          const isPeak = entry.label === peak?.label;

          return (
            <View key={entry.label} style={styles.column}>
              <View style={styles.track}>
                <View
                  style={[
                    styles.bar,
                    isPeak && styles.barPeak,
                    { height: `${barPercent(entry, usage)}%` },
                  ]}
                />
              </View>
              <AppText variant="caption" color={isPeak ? 'text' : 'textDim'} style={styles.label}>
                {entry.label}
              </AppText>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

const CHART_HEIGHT = 130;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: spacing.section,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  track: {
    height: CHART_HEIGHT,
    width: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: radius.xs,
    backgroundColor: colors.borderStrong,
  },
  barPeak: {
    backgroundColor: colors.fillLight,
  },
  label: {
    marginTop: spacing.md,
  },
});
