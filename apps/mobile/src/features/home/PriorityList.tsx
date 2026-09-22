import { StyleSheet, View } from 'react-native';

import { AppText, Checkbox, IconButton, ListRow, SectionHeader } from '@/components';
import type { Task } from '@/domain/task';

type PriorityListProps = {
  tasks: readonly Task[];
  onToggleTask: (task: Task) => void;
  onAddTask: () => void;
};

/** Seção "Prioridades" com as tarefas do dia. */
export function PriorityList({ tasks, onToggleTask, onAddTask }: PriorityListProps) {
  return (
    <View>
      <SectionHeader
        title="Prioridades"
        style={styles.header}
        action={
          <IconButton name="plus" onPress={onAddTask} accessibilityLabel="Adicionar tarefa" />
        }
      />
      {tasks.map((task) => (
        <ListRow
          key={task.id}
          title={task.title}
          completed={task.done}
          strikethrough={task.done}
          onPress={() => onToggleTask(task)}
          leading={<Checkbox checked={task.done} />}
          trailing={
            <AppText variant="tag" color="textDim">
              {task.tag}
            </AppText>
          }
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 22,
    marginBottom: 4,
  },
});
