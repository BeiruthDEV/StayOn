import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, OptionPicker, Sheet, TextField } from '@/components';
import { availableTags } from '@/domain/preferences';
import { iconForTag, isValidRange, isValidTime, type TimeBlock } from '@/domain/timeBlock';
import { useBlocks, usePreferences, useToast } from '@/state';
import { spacing } from '@/theme';

type BlockSheetProps = {
  visible: boolean;
  /** Bloco em edição. Ausente significa criação. */
  block?: TimeBlock | undefined;
  onClose: () => void;
};

type Errors = {
  title?: string;
  start?: string;
  end?: string;
};

/** Formulário de criação e edição de bloco da agenda. */
export function BlockSheet({ visible, block, onClose }: BlockSheetProps) {
  const { preferences } = usePreferences();
  const { add, edit, remove, restoreRemoved, setStatus } = useBlocks();
  const { showToast } = useToast();

  const tags = availableTags(preferences);
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [tag, setTag] = useState<string>(tags[0] ?? '');
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (!visible) return;
    setTitle(block?.title ?? '');
    setStart(block?.start ?? '');
    setEnd(block?.end ?? '');
    setTag(block?.tag ?? tags[0] ?? '');
    setErrors({});
  }, [visible, block, tags]);

  const validate = (): boolean => {
    const next: Errors = {};

    if (title.trim() === '') next.title = 'Dê um nome ao bloco';
    if (!isValidTime(start)) next.start = 'Use o formato HH:MM, ex.: 14:30';
    if (!isValidTime(end)) next.end = 'Use o formato HH:MM, ex.: 16:00';
    else if (isValidTime(start) && !isValidRange(start, end)) {
      next.end = 'O fim precisa vir depois do início';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    if (block) {
      edit(block.id, title, start, end, tag);
      showToast('Bloco atualizado');
    } else {
      add(title, start, end, tag, iconForTag(tag));
      showToast('Bloco criado');
    }

    onClose();
  };

  const handleComplete = () => {
    if (!block) return;
    setStatus(block.id, 'done');
    showToast('Bloco concluído', () => setStatus(block.id, block.status));
    onClose();
  };

  const handleDelete = () => {
    if (!block) return;
    remove(block.id);
    showToast('Bloco removido', () => restoreRemoved(block));
    onClose();
  };

  return (
    <Sheet
      visible={visible}
      title={block ? 'Editar bloco' : 'Novo bloco'}
      onClose={onClose}
      footer={
        <>
          <Button label={block ? 'Salvar' : 'Criar bloco'} onPress={handleSave} />
          {block && block.status !== 'done' ? (
            <Button label="Marcar como concluído" variant="ghost" onPress={handleComplete} />
          ) : null}
          {block ? <Button label="Remover bloco" variant="ghost" onPress={handleDelete} /> : null}
        </>
      }
    >
      <TextField
        label="Bloco"
        value={title}
        onChangeText={(text) => {
          setTitle(text);
          setErrors((current) => ({ ...current, title: undefined }));
        }}
        placeholder="Estudar Spring Boot"
        error={errors.title}
        maxLength={60}
        autoFocus
      />

      <View style={styles.times}>
        <View style={styles.time}>
          <TextField
            label="Início"
            value={start}
            onChangeText={(text) => {
              setStart(text);
              setErrors((current) => ({ ...current, start: undefined }));
            }}
            placeholder="14:30"
            error={errors.start}
            keyboardType="numbers-and-punctuation"
            maxLength={5}
          />
        </View>
        <View style={styles.time}>
          <TextField
            label="Fim"
            value={end}
            onChangeText={(text) => {
              setEnd(text);
              setErrors((current) => ({ ...current, end: undefined }));
            }}
            placeholder="16:00"
            error={errors.end}
            keyboardType="numbers-and-punctuation"
            maxLength={5}
          />
        </View>
      </View>

      {tags.length > 0 ? (
        <OptionPicker
          label="Área"
          options={tags.map((option) => ({ value: option, label: option }))}
          value={tag}
          onChange={setTag}
        />
      ) : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  times: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  time: {
    flex: 1,
  },
});
