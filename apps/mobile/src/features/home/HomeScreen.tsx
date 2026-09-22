import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, IconButton, Screen } from '@/components';
import {
  defaultUserName,
  distractionSummary,
  homeGreetingDate,
  nextAction,
  upcomingEvent,
} from '@/data/home';
import { computeDayProgress } from '@/domain/dayProgress';
import { habitsForToday } from '@/domain/habit';
import { useHabits, useTasks } from '@/state';

import { DayProgressBar } from './DayProgressBar';
import { DistractionNote } from './DistractionNote';
import { NextActionCard } from './NextActionCard';
import { PriorityList } from './PriorityList';
import { TodayHabitsList } from './TodayHabitsList';
import { UpcomingEventRow } from './UpcomingEventRow';
import { useHomeActions } from './useHomeActions';

/** Tela inicial: próxima ação, progresso do dia, prioridades, hábitos e insight. */
export function HomeScreen() {
  const { tasks } = useTasks();
  const { habits } = useHabits();
  const actions = useHomeActions();

  const progress = useMemo(() => computeDayProgress(tasks), [tasks]);
  const todayHabits = useMemo(() => habitsForToday(habits), [habits]);

  return (
    <View style={styles.root}>
      <Screen bottomInset={SCROLL_BOTTOM_INSET}>
        <AppText variant="overline" color="textDim">
          {homeGreetingDate}
        </AppText>
        <AppText variant="display" style={styles.greeting}>
          Boa tarde, {defaultUserName}.
        </AppText>

        <NextActionCard action={nextAction} onStartFocus={actions.goToFocus} />
        <DayProgressBar progress={progress} />

        <PriorityList
          tasks={tasks}
          onToggleTask={actions.completeTask}
          onAddTask={() => actions.notifyPending('Captura rápida')}
        />

        <TodayHabitsList
          habits={todayHabits}
          onToggleHabit={actions.completeHabit}
          onSeeAll={() => actions.notifyPending('Hábitos')}
        />

        <UpcomingEventRow event={upcomingEvent} onPress={actions.goToPlanner} />
        <DistractionNote summary={distractionSummary} onSeeInsights={actions.goToInsights} />
      </Screen>

      <IconButton
        name="plus"
        variant="raised"
        size={24}
        onPress={() => actions.notifyPending('Captura rápida')}
        accessibilityLabel="Captura rápida"
        style={styles.fab}
      />
    </View>
  );
}

/** Espaço no fim do scroll para o conteúdo não ficar sob o botão flutuante. */
const SCROLL_BOTTOM_INSET = 96;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  greeting: {
    marginTop: 6,
    marginBottom: 24,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
});
