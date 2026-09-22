import { StyleSheet, View } from 'react-native';

import { AppText, Card } from '@/components';
import { barPercent, peakMinutes, type DailyFocus } from '@/domain/session';
import { minutesLabel } from '@/domain/usage';
import { colors, radius, spacing } from '@/theme';

type WeeklyFocusChartProps = {
  days: readonly DailyFocus[];
  /** Data de hoje, destacada no eixo. */
  today: string;
};

/** Minutos focados em cada um dos últimos dias. */
export function WeeklyFocusChart({ days, today }: WeeklyFocusChartProps) {
  const peak = peakMinutes(days);

  return (
    <Card>
      <View style={styles.header}>
        <AppText variant="sectionTitle">Últimos 7 dias</AppText>
        <AppText variant="caption" color="textDim">
          {peak === 0 ? 'Sem registros' : `Melhor dia: ${minutesLabel(peak)}`}
        </AppText>
      </View>

      <View style={styles.chart} accessibilityLabel="Gráfico de foco por dia">
        {days.map((day) => {
          const isToday = day.date === today;

          return (
            <View key={day.date} style={styles.column}>
              <View style={styles.track}>
                <View
                  style={[
                    styles.bar,
                    isToday && styles.barToday,
                    { height: `${barPercent(day.minutes, peak)}%` },
                  ]}
                />
              </View>
              <AppText variant="caption" color={isToday ? 'text' : 'textDim'} style={styles.label}>
                {day.label}
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
    minHeight: 2,
    borderRadius: radius.xs,
    backgroundColor: colors.borderStrong,
  },
  barToday: {
    backgroundColor: colors.fillLight,
  },
  label: {
    marginTop: spacing.md,
  },
});
