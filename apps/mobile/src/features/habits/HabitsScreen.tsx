import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  AppText,
  Checkbox,
  EmptyState,
  IconButton,
  ListRow,
  Screen,
  ScreenHeader,
  SectionHeader,
} from '@/components';
import { canToggleHabit, completedToday, type Habit } from '@/domain/habit';
import { useHabits, useToast } from '@/state';
import { spacing } from '@/theme';

import { HabitSheet } from './HabitSheet';

/** Tela de hábitos: lista completa com criar, editar, pausar e remover. */
export function HabitsScreen() {
  const router = useRouter();
  const { habits, toggleHabit, restoreHabit } = useHabits();
  const { showToast } = useToast();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | undefined>(undefined);

  const active = useMemo(() => habits.filter((habit) => !habit.paused), [habits]);
  const paused = useMemo(() => habits.filter((habit) => habit.paused), [habits]);
  const done = completedToday(habits);

  const openNew = () => {
    setEditing(undefined);
    setSheetOpen(true);
  };

  const openEdit = (habit: Habit) => {
    setEditing(habit);
    setSheetOpen(true);
  };

  const handleToggle = (habit: Habit) => {
    if (!canToggleHabit(habit)) {
      showToast('Retome o hábito para marcá-lo');
      return;
    }

    toggleHabit(habit.id);
    if (!habit.done) {
      showToast('Hábito concluído', () => restoreHabit(habit.id, false));
    }
  };

  return (
    <Screen bottomInset={spacing.section}>
      <ScreenHeader
        title="Hábitos"
        subtitle={
          active.length === 0
            ? 'Nenhum hábito ativo.'
            : `${done} de ${active.length} cumpridos hoje.`
        }
        action={
          <View style={styles.headerActions}>
            <IconButton
              name="plus"
              onPress={openNew}
              accessibilityLabel="Novo hábito"
              size={22}
            />
            <IconButton
              name="close"
              onPress={() => router.back()}
              accessibilityLabel="Fechar"
              size={22}
            />
          </View>
        }
      />

      {habits.length === 0 ? (
        <EmptyState
          icon="check"
          title="Nenhum hábito ainda"
          description="Hábitos são as coisas que você repete todo dia. Toque em + para criar o primeiro."
        />
      ) : null}

      {active.map((habit) => (
        <ListRow
          key={habit.id}
          title={habit.name}
          subtitle={habit.streak > 0 ? `${habit.streak} dias seguidos` : 'Comece a sequência hoje'}
          completed={habit.done}
          onPress={() => handleToggle(habit)}
          onLongPress={() => openEdit(habit)}
          leading={<Checkbox checked={habit.done} />}
          trailing={
            <AppText variant="caption" color="textDim">
              {habit.goal}
            </AppText>
          }
        />
      ))}

      {paused.length > 0 ? (
        <>
          <SectionHeader title="Pausados" style={styles.pausedHeader} />
          {paused.map((habit) => (
            <ListRow
              key={habit.id}
              title={habit.name}
              subtitle="Pausado"
              muted
              onPress={() => openEdit(habit)}
              leading={<Checkbox checked={false} />}
              trailing={
                <AppText variant="caption" color="textDim">
                  {habit.goal}
                </AppText>
              }
            />
          ))}
        </>
      ) : null}

      {habits.length > 0 ? (
        <AppText variant="caption" color="textDim" style={styles.hint}>
          Toque para marcar, segure para editar.
        </AppText>
      ) : null}

      <HabitSheet visible={sheetOpen} habit={editing} onClose={() => setSheetOpen(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    gap: spacing.section,
  },
  pausedHeader: {
    marginTop: spacing.section,
    marginBottom: spacing.xs,
  },
  hint: {
    marginTop: spacing.xxl,
    textAlign: 'center',
  },
});
