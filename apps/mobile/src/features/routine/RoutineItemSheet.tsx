import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, OptionPicker, Sheet, TextField } from '@/components';
import { WEEK_ORDER, weekdayShort, type RoutineItem, type Weekday } from '@/domain/routine';
import { isValidRange, isValidTime } from '@/domain/timeBlock';
import { useRoutine, useToast } from '@/state';
import { spacing } from '@/theme';

type RoutineItemSheetProps = {
  visible: boolean;
  /** Bloco em edição. Ausente significa criação. */
  item?: RoutineItem | undefined;
  /** Dia em que o bloco novo entra. */
  weekday: Weekday;
  onClose: () => void;
};

type Errors = { title?: string; start?: string; end?: string };

/** Formulário de criação e edição de um bloco da rotina semanal. */
export function RoutineItemSheet({ visible, item, weekday, onClose }: RoutineItemSheetProps) {
  const { add, edit, remove, restore } = useRoutine();
  const { showToast } = useToast();

  const [day, setDay] = useState<Weekday>(weekday);
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [tag, setTag] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (!visible) return;
    setDay(item?.weekday ?? weekday);
    setTitle(item?.title ?? '');
    setStart(item?.start ?? '');
    setEnd(item?.end ?? '');
    setTag(item?.tag ?? '');
    setErrors({});
  }, [visible, item, weekday]);

  const validate = (): boolean => {
    const next: Errors = {};
    if (title.trim() === '') next.title = 'Dê um nome ao bloco';
    if (!isValidTime(start)) next.start = 'Use HH:MM, ex.: 09:00';
    if (!isValidTime(end)) next.end = 'Use HH:MM, ex.: 12:00';
    else if (isValidTime(start) && !isValidRange(start, end)) {
      next.end = 'O fim precisa vir depois do início';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    if (item) {
      edit(item.id, title, start, end, tag);
      showToast('Bloco atualizado');
    } else {
      add(day, title, start, end, tag);
      showToast(`Bloco criado na ${weekdayShort(day).toLowerCase()}`);
    }
    onClose();
  };

  const handleDelete = () => {
    if (!item) return;
    remove(item.id);
    showToast('Bloco removido da rotina', () => restore(item));
    onClose();
  };

  return (
    <Sheet
      visible={visible}
      title={item ? 'Editar bloco da rotina' : 'Novo bloco da rotina'}
      onClose={onClose}
      footer={
        <>
          <Button label={item ? 'Salvar' : 'Criar bloco'} onPress={handleSave} />
          {item ? (
            <Button label="Remover da rotina" variant="ghost" onPress={handleDelete} />
          ) : null}
        </>
      }
    >
      {item ? null : (
        <OptionPicker
          label="Dia da semana"
          options={WEEK_ORDER.map((option) => ({
            value: String(option),
            label: weekdayShort(option),
          }))}
          value={String(day)}
          onChange={(value) => setDay(Number(value) as Weekday)}
        />
      )}

      <TextField
        label="Bloco"
        value={title}
        onChangeText={(text) => {
          setTitle(text);
          setErrors((current) => ({ ...current, title: undefined }));
        }}
        placeholder="Específicos: teoria"
        error={errors.title}
        maxLength={60}
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
            placeholder="09:00"
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
            placeholder="12:00"
            error={errors.end}
            keyboardType="numbers-and-punctuation"
            maxLength={5}
          />
        </View>
      </View>

      <TextField
        label="Área"
        value={tag}
        onChangeText={setTag}
        placeholder="Concurso"
        hint="Aparece como etiqueta. Vazio vira Rotina."
        maxLength={24}
      />
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
