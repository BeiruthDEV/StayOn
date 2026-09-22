import { StyleSheet, View } from 'react-native';

import { AppText, Card, Chip } from '@/components';
import {
  deltaLabel,
  minutesLabel,
  productivePercent,
  totalMinutes,
  type ScreenTime,
} from '@/domain/usage';
import { Icon } from '@/icons';
import { colors, radius, spacing } from '@/theme';

type ScreenTimeCardProps = {
  screenTime: ScreenTime;
};

/** Tempo total de tela, variação em relação a ontem e divisão do uso. */
export function ScreenTimeCard({ screenTime }: ScreenTimeCardProps) {
  const productive = productivePercent(screenTime);

  return (
    <Card>
      <View style={styles.header}>
        <View style={styles.titles}>
          <AppText variant="sectionTitle">Tempo total de tela</AppText>
          <AppText variant="caption" color="textDim" style={styles.subtitle}>
            Comparado a ontem
          </AppText>
        </View>
        <Chip
          label={deltaLabel(screenTime)}
          tone="danger"
          leading={<Icon name="trendUp" size={13} strokeWidth={1.8} color={colors.danger} />}
        />
      </View>

      <AppText variant="display" style={styles.total}>
        {minutesLabel(totalMinutes(screenTime))}
      </AppText>

      <View style={styles.bar}>
        <View style={[styles.productive, { flex: productive }]} />
        <View style={[styles.distracted, { flex: 100 - productive }]} />
      </View>

      <View style={styles.legend}>
        <LegendItem
          color={colors.fillLight}
          label={`Produtivo (${minutesLabel(screenTime.productiveMinutes)})`}
        />
        <LegendItem
          color={colors.textDim}
          label={`Distraído (${minutesLabel(screenTime.distractedMinutes)})`}
        />
      </View>
    </Card>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <AppText variant="caption" color="textMuted">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.xxl,
  },
  titles: {
    flex: 1,
    minWidth: 0,
  },
  subtitle: {
    marginTop: spacing.xxs,
  },
  total: {
    fontSize: 42,
    letterSpacing: -1,
    marginTop: spacing.xl,
  },
  bar: {
    flexDirection: 'row',
    height: 6,
    marginTop: spacing.xxl,
    borderRadius: radius.xs,
    overflow: 'hidden',
  },
  productive: {
    backgroundColor: colors.fillLight,
  },
  distracted: {
    backgroundColor: colors.textDim,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xxl,
    marginTop: spacing.xl,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: radius.pill,
  },
});
