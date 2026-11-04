import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

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
  const router = useRouter();

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
          onPress={() =>
            router.push({
              pathname: '/task/[id]',
              params: { id: task.id },
            })
          }
          onLongPress={() => onEditTask(task)}
          leading={
            <Pressable
              onPress={() => onToggleTask(task)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={task.done ? 'Desmarcar tarefa' : 'Concluir tarefa'}
            >
              <Checkbox checked={task.done} />
            </Pressable>
          }
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
