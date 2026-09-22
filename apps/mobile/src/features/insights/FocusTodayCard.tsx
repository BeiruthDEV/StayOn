import { StyleSheet, View } from 'react-native';

import { AppText, Card, Chip } from '@/components';
import { completedCount, type FocusSessionRecord } from '@/domain/session';
import { minutesLabel, signedMinutesLabel } from '@/domain/usage';
import { Icon } from '@/icons';
import { colors, radius, spacing } from '@/theme';

type FocusTodayCardProps = {
  minutesToday: number;
  minutesYesterday: number;
  todaySessions: readonly FocusSessionRecord[];
};

/** Foco de hoje, comparação com ontem e divisão entre concluídas e abandonadas. */
export function FocusTodayCard({
  minutesToday,
  minutesYesterday,
  todaySessions,
}: FocusTodayCardProps) {
  const delta = minutesToday - minutesYesterday;
  const completed = completedCount(todaySessions);
  const abandoned = todaySessions.length - completed;
  const completedShare = todaySessions.length === 0 ? 0 : (100 * completed) / todaySessions.length;

  return (
    <Card>
      <View style={styles.header}>
        <View style={styles.titles}>
          <AppText variant="sectionTitle">Foco de hoje</AppText>
          <AppText variant="caption" color="textDim" style={styles.subtitle}>
            Comparado a ontem
          </AppText>
        </View>
        {minutesYesterday > 0 || minutesToday > 0 ? (
          <Chip
            label={signedMinutesLabel(delta)}
            tone={delta >= 0 ? 'neutral' : 'danger'}
            leading={
              <Icon
                name="trendUp"
                size={13}
                strokeWidth={1.8}
                color={delta >= 0 ? colors.textMuted : colors.danger}
              />
            }
          />
        ) : null}
      </View>

      <AppText variant="display" style={styles.total}>
        {minutesLabel(minutesToday)}
      </AppText>

      {todaySessions.length === 0 ? (
        <AppText variant="supporting" color="textDim" style={styles.empty}>
          Nenhuma sessão registrada hoje. Comece pela aba Foco.
        </AppText>
      ) : (
        <>
          <View style={styles.bar}>
            <View style={[styles.completed, { flex: Math.max(completedShare, 0.001) }]} />
            <View style={[styles.abandoned, { flex: Math.max(100 - completedShare, 0.001) }]} />
          </View>

          <View style={styles.legend}>
            <LegendItem color={colors.fillLight} label={`Concluídas (${completed})`} />
            <LegendItem color={colors.textDim} label={`Abandonadas (${abandoned})`} />
          </View>
        </>
      )}
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
  empty: {
    marginTop: spacing.xl,
  },
  bar: {
    flexDirection: 'row',
    height: 6,
    marginTop: spacing.xxl,
    borderRadius: radius.xs,
    overflow: 'hidden',
  },
  completed: {
    backgroundColor: colors.fillLight,
  },
  abandoned: {
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
