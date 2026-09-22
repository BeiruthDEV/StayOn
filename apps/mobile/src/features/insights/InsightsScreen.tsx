import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen, ScreenHeader, SegmentedControl } from '@/components';
import { useBlocks, useSessions, useTasks } from '@/state';
import { spacing } from '@/theme';

import { TodayTab } from './TodayTab';
import { WeekTab } from './WeekTab';

const PERIODS = ['Hoje', 'Semana'] as const;

/** Tela Insights: números do dia e o consolidado da semana, no mesmo lugar. */
export function InsightsScreen() {
  const { sessions } = useSessions();
  const { blocks } = useBlocks();
  const { tasks } = useTasks();

  const [period, setPeriod] = useState<(typeof PERIODS)[number]>('Hoje');

  return (
    <Screen bottomInset={spacing.section}>
      <ScreenHeader
        title="Seus números"
        subtitle="Calculados a partir das suas sessões de foco."
      />

      <View style={styles.tabs}>
        <SegmentedControl options={PERIODS} value={period} onChange={setPeriod} />
      </View>

      {period === 'Hoje' ? (
        <TodayTab sessions={sessions} doneTasks={tasks.filter((task) => task.done).length} />
      ) : (
        <WeekTab sessions={sessions} blocks={blocks} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: {
    marginBottom: spacing.section,
  },
});
