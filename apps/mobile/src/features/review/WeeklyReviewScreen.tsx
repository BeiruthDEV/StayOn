import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  AppText,
  Button,
  Card,
  IconButton,
  Progress,
  Screen,
  ScreenHeader,
  SectionHeader,
} from '@/components';
import { currentWeekReview } from '@/data/weeklyReview';
import { executionDeltaLabel, metTarget, planningAccuracy } from '@/domain/weeklyReview';
import { Icon } from '@/icons';
import { useToast } from '@/state';
import { colors, spacing } from '@/theme';

import { MetricCard } from './MetricCard';
import { ReflectionField } from './ReflectionField';

/** Tela Revisão semanal: métricas da semana, recomendação e reflexão. */
export function WeeklyReviewScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const review = currentWeekReview;

  const [worked, setWorked] = useState('');
  const [toChange, setToChange] = useState('');

  const accuracy = planningAccuracy(review);

  return (
    <Screen bottomInset={spacing.section}>
      <ScreenHeader
        title="Revisão semanal"
        subtitle={review.range}
        action={
          <IconButton
            name="close"
            onPress={() => router.back()}
            accessibilityLabel="Fechar"
            size={22}
          />
        }
      />

      <View style={styles.block}>
        <MetricCard
          title="Taxa de execução"
          icon="target"
          value={String(review.executionRate)}
          unit="%"
          note={`Meta: ${review.executionTarget}% · ${executionDeltaLabel(review)} vs semana passada`}
          footer={
            <View style={styles.progress}>
              <Progress percent={review.executionRate} />
            </View>
          }
        />
      </View>

      <View style={styles.block}>
        <MetricCard
          title="Foco profundo"
          icon="stopwatch"
          value={String(review.deepFocusHours)}
          unit="h"
          note={
            metTarget(review)
              ? 'Meta da semana atingida, hábito diário mantido.'
              : 'Abaixo da meta da semana.'
          }
        />
      </View>

      <View style={styles.block}>
        <Card>
          <AppText variant="overlineSmall" color="textDim">
            Janela de pico
          </AppText>
          <View style={styles.peak}>
            <Icon name="sunrise" size={20} strokeWidth={1.6} color={colors.textMuted} />
            <AppText variant="title">{review.peakWindow}</AppText>
          </View>
          <AppText variant="caption" color="textDim">
            Maior densidade de produção
          </AppText>
        </Card>
      </View>

      <View style={styles.block}>
        <Card>
          <AppText variant="overlineSmall" color="textDim" style={styles.cardTitle}>
            Precisão do planejamento
          </AppText>
          <View style={styles.statRow}>
            <AppText variant="body" color="textMuted">
              Concluídos
            </AppText>
            <AppText variant="bodyStrong">{review.completedBlocks}</AppText>
          </View>
          <View style={styles.statRow}>
            <AppText variant="body" color="textMuted">
              Reagendados
            </AppText>
            <AppText variant="bodyStrong">{review.rescheduledBlocks}</AppText>
          </View>
          <View style={styles.progress}>
            <Progress percent={accuracy} />
          </View>
          <AppText variant="caption" color="textDim" style={styles.accuracy}>
            {accuracy}% dos blocos aconteceram no horário planejado.
          </AppText>
        </Card>
      </View>

      <View style={styles.block}>
        <Card>
          <AppText variant="overlineSmall" color="textDim" style={styles.cardTitle}>
            Maior distração
          </AppText>
          <View style={styles.distraction}>
            <AppText variant="title">{review.topDistraction}</AppText>
            <Icon name="phone" size={20} strokeWidth={1.6} color={colors.textMuted} />
          </View>
          <AppText variant="caption" color="danger" style={styles.accuracy}>
            {review.topDistractionShare}% do tempo de distração
          </AppText>
        </Card>
      </View>

      <View style={styles.block}>
        <Card>
          <View style={styles.recommendationHeader}>
            <Icon name="sparkles" size={19} strokeWidth={1.6} color={colors.textMuted} />
            <AppText variant="sectionTitle">Recomendação do sistema</AppText>
          </View>
          <AppText variant="supporting" color="textMuted" style={styles.accuracy}>
            {review.recommendation}
          </AppText>
          <Button
            label="Aplicar regra"
            onPress={() => showToast('Regra aplicada para a próxima semana')}
            style={styles.apply}
          />
        </Card>
      </View>

      <SectionHeader title="Reflexão" style={styles.reflectionHeader} />

      <ReflectionField
        label="O que funcionou?"
        placeholder="Anote as estratégias que deram certo…"
        value={worked}
        onChangeText={setWorked}
      />
      <ReflectionField
        label="O que mudar?"
        placeholder="Aponte os pontos de melhoria…"
        value={toChange}
        onChangeText={setToChange}
      />

      <Button label="Salvar reflexão" onPress={() => showToast('Reflexão salva')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  accuracy: {
    marginTop: spacing.lg,
  },
  distraction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.sm,
  },
  apply: {
    marginTop: spacing.section,
  },
  reflectionHeader: {
    marginBottom: spacing.xxl,
  },
});
