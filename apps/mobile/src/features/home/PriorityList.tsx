import { StyleSheet, View } from 'react-native';

import { AppText, Checkbox, EmptyState, IconButton, ListRow, SectionHeader } from '@/components';
import type { Task } from '@/domain/task';

type PriorityListProps = {
  tasks: readonly Task[];
  onToggleTask: (task: Task) => void;
  /** Abre o formulário de edição — disparado pelo toque longo. */
  onEditTask: (task: Task) => void;
  onAddTask: () => void;
};

/** Seção "Prioridades" com as tarefas do dia. */
export function PriorityList({ tasks, onToggleTask, onEditTask, onAddTask }: PriorityListProps) {
  return (
    <View>
      <SectionHeader
        title="Prioridades"
        style={styles.header}
        action={
          <IconButton name="plus" onPress={onAddTask} accessibilityLabel="Adicionar tarefa" />
        }
      />
      {tasks.length === 0 ? (
        <EmptyState
          icon="check"
          title="Sem prioridades hoje"
          description="Toque em + para escrever a primeira tarefa do dia."
        />
      ) : null}

      {tasks.map((task) => (
        <ListRow
          key={task.id}
          title={task.title}
          completed={task.done}
          strikethrough={task.done}
          onPress={() => onToggleTask(task)}
          onLongPress={() => onEditTask(task)}
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
