import { StyleSheet, View } from 'react-native';

import { AppText, Card, Progress, SectionHeader } from '@/components';
import { rangeLabel, shiftDate, todayIso, weekRange } from '@/domain/clock';
import type { FocusSessionRecord } from '@/domain/session';
import type { TimeBlock } from '@/domain/timeBlock';
import { durationLabel } from '@/domain/usage';
import {
  buildWeeklyReview,
  emptyReflection,
  planningAccuracy,
  recommendation,
  targetProgress,
  WEEKLY_FOCUS_TARGET,
  type Reflection,
} from '@/domain/weeklyReview';
import { Icon } from '@/icons';
import { storageKeys, usePersistentState } from '@/storage';
import { colors, spacing } from '@/theme';

import { MetricCard } from './MetricCard';
import { ReflectionField } from './ReflectionField';

type WeekTabProps = {
  sessions: readonly FocusSessionRecord[];
  blocks: readonly TimeBlock[];
};

/** Aba Semana: consolidado dos últimos sete dias e a reflexão. */
export function WeekTab({ sessions, blocks }: WeekTabProps) {
  const { from, to } = weekRange(todayIso());
  const dates = Array.from({ length: 7 }, (_, index) => shiftDate(from, index));
  const review = buildWeeklyReview(sessions, blocks, dates);
  const accuracy = planningAccuracy(review);

  // A reflexão é guardada por semana, com a segunda-feira como chave.
  const { value: reflections, setValue: setReflections } = usePersistentState<
    Record<string, Reflection>
  >(storageKeys.reflections, {});

  const reflection = reflections[from] ?? emptyReflection;

  const updateReflection = (patch: Partial<Reflection>) => {
    setReflections((current) => ({
      ...current,
      [from]: { ...(current[from] ?? emptyReflection), ...patch },
    }));
  };

  return (
    <>
      <AppText variant="caption" color="textDim" style={styles.range}>
        {rangeLabel(from, to)}
      </AppText>

      <View style={styles.block}>
        <MetricCard
          title="Foco na semana"
          icon="stopwatch"
          value={durationLabel(review.focusSeconds)}
          note={`Meta: ${durationLabel(WEEKLY_FOCUS_TARGET)} · ${targetProgress(review)}% cumprido`}
          footer={
            <View style={styles.progress}>
              <Progress percent={targetProgress(review)} />
            </View>
          }
        />
      </View>

      <View style={styles.block}>
        <MetricCard
          title="Taxa de execução"
          icon="target"
          value={String(review.completionRate)}
          unit="%"
          note={
            review.sessionCount === 0
              ? 'Nenhuma sessão registrada nesta semana.'
              : `${review.sessionCount} ${review.sessionCount === 1 ? 'sessão encerrada' : 'sessões encerradas'}.`
          }
          footer={
            <View style={styles.progress}>
              <Progress percent={review.completionRate} />
            </View>
          }
        />
      </View>

      <View style={styles.block}>
        <Card>
          <AppText variant="overlineSmall" color="textDim">
            Melhor dia
          </AppText>
          <View style={styles.peak}>
            <Icon name="sunrise" size={20} strokeWidth={1.6} color={colors.textMuted} />
            <AppText variant="title">
              {review.bestDayLabel === ''
                ? 'Sem registros'
                : `${review.bestDayLabel} · ${durationLabel(review.bestDaySeconds)}`}
            </AppText>
          </View>
          <AppText variant="caption" color="textDim">
            O dia em que você somou mais tempo de foco.
          </AppText>
        </Card>
      </View>

      <View style={styles.block}>
        <Card>
          <AppText variant="overlineSmall" color="textDim" style={styles.cardTitle}>
            Execução da agenda
          </AppText>
          <View style={styles.statRow}>
            <AppText variant="body" color="textMuted">
              Blocos concluídos
            </AppText>
            <AppText variant="bodyStrong">{review.blocksDone}</AppText>
          </View>
          <View style={styles.statRow}>
            <AppText variant="body" color="textMuted">
              Blocos na agenda
            </AppText>
            <AppText variant="bodyStrong">{review.blocksTotal}</AppText>
          </View>
          <View style={styles.progress}>
            <Progress percent={accuracy} />
          </View>
          <AppText variant="caption" color="textDim" style={styles.note}>
            {review.blocksTotal === 0
              ? 'Nenhum bloco na agenda de hoje.'
              : `${accuracy}% da agenda de hoje foi cumprida.`}
          </AppText>
        </Card>
      </View>

      {review.topArea !== '' ? (
        <View style={styles.block}>
          <Card>
            <AppText variant="overlineSmall" color="textDim" style={styles.cardTitle}>
              Onde foi o tempo
            </AppText>
            <View style={styles.topArea}>
              <AppText variant="title" numberOfLines={1} style={styles.topAreaName}>
                {review.topArea}
              </AppText>
              <Icon name="target" size={20} strokeWidth={1.6} color={colors.textMuted} />
            </View>
            <AppText variant="caption" color="textDim" style={styles.note}>
              {durationLabel(review.topAreaSeconds)} nesta semana
            </AppText>
          </Card>
        </View>
      ) : null}

      <View style={styles.block}>
        <Card>
          <View style={styles.recommendationHeader}>
            <Icon name="sparkles" size={19} strokeWidth={1.6} color={colors.textMuted} />
            <AppText variant="sectionTitle">Recomendação</AppText>
          </View>
          <AppText variant="supporting" color="textMuted" style={styles.note}>
            {recommendation(review)}
          </AppText>
        </Card>
      </View>

      <SectionHeader title="Reflexão" style={styles.reflectionHeader} />

      <ReflectionField
        label="O que funcionou?"
        placeholder="Anote as estratégias que deram certo…"
        value={reflection.worked}
        onChangeText={(worked) => updateReflection({ worked })}
      />
      <ReflectionField
        label="O que mudar?"
        placeholder="Aponte os pontos de melhoria…"
        value={reflection.toChange}
        onChangeText={(toChange) => updateReflection({ toChange })}
      />

      <AppText variant="caption" color="textDim">
        A reflexão é salva sozinha, por semana.
      </AppText>
    </>
  );
}

const styles = StyleSheet.create({
  range: {
    marginBottom: spacing.xxl,
  },
  block: {
    marginBottom: spacing.section,
  },
  cardTitle: {
    marginBottom: spacing.xl,
  },
  progress: {
    flexDirection: 'row',
    marginTop: spacing.xxl,
  },
  peak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  note: {
    marginTop: spacing.lg,
  },
  topArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xxl,
  },
  topAreaName: {
    flex: 1,
    minWidth: 0,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.sm,
  },
  reflectionHeader: {
    marginBottom: spacing.xxl,
  },
});
