import { StyleSheet, View } from 'react-native';

import { AppText, Card, Progress } from '@/components';
import { shiftDate, todayIso } from '@/domain/clock';
import {
  barPercent,
  completedCount,
  focusByDay,
  focusByLabel,
  peakSeconds,
  sessionsOn,
  totalFocusSeconds,
  type FocusSessionRecord,
} from '@/domain/session';
import { durationLabel, signedDurationLabel } from '@/domain/usage';
import { Icon } from '@/icons';
import { colors, radius, spacing } from '@/theme';

type TodayTabProps = {
  sessions: readonly FocusSessionRecord[];
  /** Tarefas já concluídas, usadas no texto do insight. */
  doneTasks: number;
};

/** Aba Hoje: foco do dia, insight, últimos sete dias e tempo por área. */
export function TodayTab({ sessions, doneTasks }: TodayTabProps) {
  const today = todayIso();
  const todaySessions = sessionsOn(sessions, today);

  const secondsToday = totalFocusSeconds(todaySessions);
  const secondsYesterday = totalFocusSeconds(sessionsOn(sessions, shiftDate(today, -1)));
  const delta = secondsToday - secondsYesterday;

  const completed = completedCount(todaySessions);
  const abandoned = todaySessions.length - completed;
  const completedShare = todaySessions.length === 0 ? 0 : (100 * completed) / todaySessions.length;

  const days = focusByDay(
    sessions,
    Array.from({ length: 7 }, (_, index) => shiftDate(today, index - 6)),
  );
  const peakDay = peakSeconds(days);

  const areas = focusByLabel(sessions).slice(0, 5);
  const peakArea = peakSeconds(areas);

  return (
    <>
      <View style={styles.block}>
        <Card>
          <View style={styles.cardHeader}>
            <View style={styles.titles}>
              <AppText variant="sectionTitle">Foco de hoje</AppText>
              <AppText variant="caption" color="textDim">
                Comparado a ontem
              </AppText>
            </View>
            {secondsToday > 0 || secondsYesterday > 0 ? (
              <View style={styles.delta}>
                <Icon
                  name="trendUp"
                  size={13}
                  strokeWidth={1.8}
                  color={delta >= 0 ? colors.success : colors.danger}
                />
                <AppText variant="captionMedium" color={delta >= 0 ? 'success' : 'danger'}>
                  {signedDurationLabel(delta)}
                </AppText>
              </View>
            ) : null}
          </View>

          <AppText variant="display" style={styles.total}>
            {durationLabel(secondsToday)}
          </AppText>

          {todaySessions.length === 0 ? (
            <AppText variant="supporting" color="textDim" style={styles.note}>
              Nenhuma sessão registrada hoje. Comece pela aba Foco.
            </AppText>
          ) : (
            <>
              <View style={styles.splitBar}>
                <View style={[styles.completed, { flex: Math.max(completedShare, 0.001) }]} />
                <View
                  style={[styles.abandoned, { flex: Math.max(100 - completedShare, 0.001) }]}
                />
              </View>
              <View style={styles.legend}>
                <Legend color={colors.fillLight} label={`Concluídas (${completed})`} />
                <Legend color={colors.textDim} label={`Abandonadas (${abandoned})`} />
              </View>
            </>
          )}
        </Card>
      </View>

      <View style={styles.block}>
        <Card>
          <View style={styles.insightHeader}>
            <Icon name="bulb" size={18} strokeWidth={1.6} color={colors.textMuted} />
            <AppText variant="overlineSmall" color="textMuted">
              Insight principal
            </AppText>
          </View>
          <AppText variant="supporting" color="textMuted" style={styles.note}>
            {buildInsight(sessions.length, todaySessions.length, secondsToday, doneTasks)}
          </AppText>
        </Card>
      </View>

      <View style={styles.block}>
        <Card>
          <View style={styles.cardHeader}>
            <AppText variant="sectionTitle">Últimos 7 dias</AppText>
            <AppText variant="caption" color="textDim">
              {peakDay === 0 ? 'Sem registros' : `Melhor: ${durationLabel(peakDay)}`}
            </AppText>
          </View>

          <View style={styles.chart} accessibilityLabel="Gráfico de foco por dia">
            {days.map((day) => (
              <View key={day.date} style={styles.column}>
                <View style={styles.track}>
                  <View
                    style={[
                      styles.bar,
                      day.date === today && styles.barToday,
                      { height: `${barPercent(day.seconds, peakDay)}%` },
                    ]}
                  />
                </View>
                <AppText
                  variant="caption"
                  color={day.date === today ? 'text' : 'textDim'}
                  style={styles.axis}
                >
                  {day.label}
                </AppText>
              </View>
            ))}
          </View>
        </Card>
      </View>

      <Card>
        <AppText variant="sectionTitle" style={styles.areaTitle}>
          Onde seu foco foi
        </AppText>

        {areas.length === 0 ? (
          <AppText variant="supporting" color="textDim">
            Ainda não há sessões suficientes para montar esta lista.
          </AppText>
        ) : (
          areas.map((area) => (
            <View key={area.label} style={styles.areaRow}>
              <View style={styles.areaLabels}>
                <AppText variant="bodyStrong" numberOfLines={1} style={styles.areaName}>
                  {area.label}
                </AppText>
                <AppText variant="caption" color="textDim">
                  {durationLabel(area.seconds)}
                </AppText>
              </View>
              <View style={styles.areaBar}>
                <Progress percent={barPercent(area.seconds, peakArea)} />
              </View>
            </View>
          ))
        )}
      </Card>
    </>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <AppText variant="caption" color="textMuted">
        {label}
      </AppText>
    </View>
  );
}

/** Frase do insight, escolhida pelo estado real dos dados. */
function buildInsight(
  total: number,
  todayCount: number,
  secondsToday: number,
  doneTasks: number,
): string {
  if (total === 0) {
    return 'Assim que você encerrar a primeira sessão de foco, os números desta tela começam a aparecer.';
  }

  if (todayCount === 0) {
    const plural = total === 1 ? 'sessão registrada' : 'sessões registradas';
    return `Você tem ${total} ${plural}, mas nenhuma hoje. Uma sessão curta já mantém o ritmo.`;
  }

  const tarefas =
    doneTasks > 0
      ? ` e ${doneTasks} ${doneTasks === 1 ? 'tarefa concluída' : 'tarefas concluídas'}`
      : '';

  return `${durationLabel(secondsToday)} de foco hoje em ${todayCount} ${todayCount === 1 ? 'sessão' : 'sessões'}${tarefas}.`;
}

const CHART_HEIGHT = 120;

const styles = StyleSheet.create({
  block: {
    marginBottom: spacing.section,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.xxl,
    marginBottom: spacing.xl,
  },
  titles: {
    flex: 1,
    minWidth: 0,
  },
  delta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  total: {
    fontSize: 40,
    letterSpacing: -1,
  },
  note: {
    marginTop: spacing.lg,
  },
  splitBar: {
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
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
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
  axis: {
    marginTop: spacing.md,
  },
  areaTitle: {
    marginBottom: spacing.xxl,
  },
  areaRow: {
    marginBottom: spacing.xxl,
  },
  areaLabels: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.xxl,
    marginBottom: spacing.md,
  },
  areaName: {
    flex: 1,
    minWidth: 0,
  },
  areaBar: {
    flexDirection: 'row',
  },
});
