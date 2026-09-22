import { useEffect, useState } from 'react';

import { AppText, Button, OptionPicker, Sheet, TextField } from '@/components';
import { availableTags } from '@/domain/preferences';
import type { Task } from '@/domain/task';
import { usePreferences, useTasks, useToast } from '@/state';

type TaskSheetProps = {
  visible: boolean;
  /** Tarefa em edição. Ausente significa criação. */
  task?: Task | undefined;
  onClose: () => void;
};

/** Formulário de criação e edição de tarefa, com remoção desfazível. */
export function TaskSheet({ visible, task, onClose }: TaskSheetProps) {
  const { preferences } = usePreferences();
  const { add, edit, remove, restoreRemoved } = useTasks();
  const { showToast } = useToast();

  const tags = availableTags(preferences);
  const [title, setTitle] = useState('');
  const [tag, setTag] = useState<string>(tags[0] ?? '');
  const [error, setError] = useState<string | undefined>(undefined);

  // Reabrir o painel recomeça do estado certo: vazio ao criar, preenchido ao editar.
  useEffect(() => {
    if (!visible) return;
    setTitle(task?.title ?? '');
    setTag(task?.tag ?? tags[0] ?? '');
    setError(undefined);
  }, [visible, task, tags]);

  const handleSave = () => {
    if (title.trim() === '') {
      setError('Escreva o que precisa ser feito');
      return;
    }

    if (task) {
      edit(task.id, title, tag);
      showToast('Tarefa atualizada');
    } else {
      add(title, tag);
      showToast('Tarefa criada');
    }

    onClose();
  };

  const handleDelete = () => {
    if (!task) return;
    remove(task.id);
    showToast('Tarefa removida', () => restoreRemoved(task));
    onClose();
  };

  return (
    <Sheet
      visible={visible}
      title={task ? 'Editar tarefa' : 'Nova tarefa'}
      onClose={onClose}
      footer={
        <>
          <Button label={task ? 'Salvar' : 'Criar tarefa'} onPress={handleSave} />
          {task ? <Button label="Remover tarefa" variant="ghost" onPress={handleDelete} /> : null}
        </>
      }
    >
      <TextField
        label="Tarefa"
        value={title}
        onChangeText={(text) => {
          setTitle(text);
          if (error !== undefined) setError(undefined);
        }}
        placeholder="Estudar documentação da API"
        error={error}
        maxLength={80}
        autoFocus
      />

      {tags.length > 0 ? (
        <OptionPicker
          label="Área"
          options={tags.map((option) => ({ value: option, label: option }))}
          value={tag}
          onChange={setTag}
        />
      ) : (
        <AppText variant="caption" color="textDim">
          Escolha suas áreas na configuração inicial para classificar as tarefas.
        </AppText>
      )}
    </Sheet>
  );
}
