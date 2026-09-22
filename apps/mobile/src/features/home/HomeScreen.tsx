import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, EmptyState, IconButton, Screen } from '@/components';
import { greeting, longDateLabel, todayIso } from '@/domain/clock';
import { computeDayProgress } from '@/domain/dayProgress';
import { habitsForToday } from '@/domain/habit';
import { firstName } from '@/domain/preferences';
import { sessionsOn, totalFocusSeconds } from '@/domain/session';
import { nextBlock } from '@/domain/timeBlock';
import type { Task } from '@/domain/task';
import { TaskSheet } from '@/features/tasks';
import { useBlocks, useEvents, useHabits, usePreferences, useSessions, useTasks } from '@/state';

import { DayProgressBar } from './DayProgressBar';
import { FocusSummary } from './FocusSummary';
import { NextActionCard } from './NextActionCard';
import { PriorityList } from './PriorityList';
import { TodayHabitsList } from './TodayHabitsList';
import { UpcomingEventRow } from './UpcomingEventRow';
import { useHomeActions } from './useHomeActions';

/** Tela inicial: próxima ação, progresso do dia, prioridades, hábitos e foco. */
export function HomeScreen() {
  const { tasks } = useTasks();
  const { habits } = useHabits();
  const { blocks } = useBlocks();
  const { events } = useEvents();
  const { sessions } = useSessions();
  const { preferences } = usePreferences();
  const actions = useHomeActions();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Task | undefined>(undefined);

  const today = todayIso();
  const progress = useMemo(() => computeDayProgress(tasks, habits), [tasks, habits]);
  const todayHabits = useMemo(() => habitsForToday(habits), [habits]);
  const action = useMemo(() => nextBlock(blocks), [blocks]);
  const upcoming = events[0];

  const focusToday = useMemo(
    () => sessionsOn(sessions, today),
    [sessions, today],
  );

  const openNewTask = () => {
    setEditing(undefined);
    setSheetOpen(true);
  };

  const openEditTask = (task: Task) => {
    setEditing(task);
    setSheetOpen(true);
  };

  const name = firstName(preferences);

  return (
    <View style={styles.root}>
      <Screen bottomInset={SCROLL_BOTTOM_INSET}>
        <AppText variant="overline" color="textDim">
          {longDateLabel(today)}
        </AppText>
        <AppText variant="display" style={styles.greeting}>
          {name === '' ? `${greeting()}.` : `${greeting()}, ${name}.`}
        </AppText>

        {action ? (
          <NextActionCard action={action} onStartFocus={actions.goToFocus} />
        ) : (
          <EmptyState
            icon="planner"
            title="Nada planejado agora"
            description="Crie um bloco na agenda para o StayOn saber o que vem a seguir."
          />
        )}

        {progress.total > 0 ? <DayProgressBar progress={progress} /> : null}

        <PriorityList
          tasks={tasks}
          onToggleTask={actions.completeTask}
          onEditTask={openEditTask}
          onAddTask={openNewTask}
        />

        <TodayHabitsList
          habits={todayHabits}
          onToggleHabit={actions.completeHabit}
          onSeeAll={actions.goToHabits}
        />

        {upcoming ? <UpcomingEventRow event={upcoming} onPress={actions.goToDates} /> : null}

        <FocusSummary
          sessions={focusToday.length}
          seconds={totalFocusSeconds(focusToday)}
          onSeeInsights={actions.goToInsights}
        />
      </Screen>

      <IconButton
        name="plus"
        variant="raised"
        size={24}
        onPress={openNewTask}
        accessibilityLabel="Nova tarefa"
        style={styles.fab}
      />

      <TaskSheet visible={sheetOpen} task={editing} onClose={() => setSheetOpen(false)} />
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
