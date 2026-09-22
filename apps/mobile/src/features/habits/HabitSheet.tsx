import { useEffect, useState } from 'react';

import { Button, Sheet, TextField } from '@/components';
import type { Habit } from '@/domain/habit';
import { useHabits, useToast } from '@/state';

type HabitSheetProps = {
  visible: boolean;
  /** Hábito em edição. Ausente significa criação. */
  habit?: Habit | undefined;
  onClose: () => void;
};

/** Formulário de criação e edição de hábito, com pausar e remover. */
export function HabitSheet({ visible, habit, onClose }: HabitSheetProps) {
  const { add, edit, remove, restoreRemoved, togglePause } = useHabits();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!visible) return;
    setName(habit?.name ?? '');
    setGoal(habit?.goal ?? '');
    setError(undefined);
  }, [visible, habit]);

  const handleSave = () => {
    if (name.trim() === '') {
      setError('Dê um nome ao hábito');
      return;
    }

    if (habit) {
      edit(habit.id, name, goal);
      showToast('Hábito atualizado');
    } else {
      add(name, goal);
      showToast('Hábito criado');
    }

    onClose();
  };

  const handleTogglePause = () => {
    if (!habit) return;
    togglePause(habit.id);
    showToast(habit.paused ? 'Hábito retomado' : 'Hábito pausado');
    onClose();
  };

  const handleDelete = () => {
    if (!habit) return;
    remove(habit.id);
    showToast('Hábito removido', () => restoreRemoved(habit));
    onClose();
  };

  return (
    <Sheet
      visible={visible}
      title={habit ? 'Editar hábito' : 'Novo hábito'}
      onClose={onClose}
      footer={
        <>
          <Button label={habit ? 'Salvar' : 'Criar hábito'} onPress={handleSave} />
          {habit ? (
            <>
              <Button
                label={habit.paused ? 'Retomar hábito' : 'Pausar hábito'}
                variant="ghost"
                onPress={handleTogglePause}
              />
              <Button label="Remover hábito" variant="ghost" onPress={handleDelete} />
            </>
          ) : null}
        </>
      }
    >
      <TextField
        label="Hábito"
        value={name}
        onChangeText={(text) => {
          setName(text);
          if (error !== undefined) setError(undefined);
        }}
        placeholder="Ler 20 minutos"
        error={error}
        maxLength={60}
        autoFocus
      />

      <TextField
        label="Meta"
        value={goal}
        onChangeText={setGoal}
        placeholder="20 min/dia"
        hint="Aparece ao lado do hábito na lista."
        maxLength={30}
      />
    </Sheet>
  );
}
