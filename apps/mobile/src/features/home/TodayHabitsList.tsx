import { StyleSheet, View } from 'react-native';

import { AppText, Button, Checkbox, EmptyState, ListRow, SectionHeader } from '@/components';
import type { Habit } from '@/domain/habit';

type TodayHabitsListProps = {
  habits: readonly Habit[];
  onToggleHabit: (habit: Habit) => void;
  onSeeAll: () => void;
};

/** Seção "Hábitos de hoje" com os hábitos ativos em destaque. */
export function TodayHabitsList({ habits, onToggleHabit, onSeeAll }: TodayHabitsListProps) {
  return (
    <View>
      <SectionHeader
        title="Hábitos de hoje"
        style={styles.header}
        action={<Button label="Ver todos" variant="ghost" onPress={onSeeAll} />}
      />
      {habits.length === 0 ? (
        <EmptyState
          icon="check"
          title="Nenhum hábito ativo"
          description="Toque em Ver todos para criar ou retomar um hábito."
        />
      ) : null}

      {habits.map((habit) => (
        <ListRow
          key={habit.id}
          title={habit.name}
          completed={habit.done}
          onPress={() => onToggleHabit(habit)}
          leading={<Checkbox checked={habit.done} />}
          trailing={
            <AppText variant="caption" color="textDim">
              {habit.progressLabel}
            </AppText>
          }
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 26,
    marginBottom: 4,
  },
});
