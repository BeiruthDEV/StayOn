import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, Sheet, TextField } from '@/components';
import {
  addMinutes,
  overlapping,
  usedTags,
  weekdayShort,
  WEEK_ORDER,
  type RoutineItem,
  type Weekday,
} from '@/domain/routine';
import { toMinutes } from '@/domain/timeBlock';
import { useRoutine, useToast } from '@/state';
import { colors, radius, spacing } from '@/theme';

import { DayPicker, TagPicker } from './RoutinePickers';
import { SelectChip } from './SelectChip';
import { TimeDisplay, TimePanel } from './TimePicker';

type RoutineItemSheetProps = {
  visible: boolean;
  /** Bloco em edição. Ausente significa criação. */
  item?: RoutineItem | undefined;
  /** Dia sugerido para o bloco novo: o dia aberto na tela. */
  weekday: Weekday;
  onClose: () => void;
};

type Errors = { days?: string; title?: string; start?: string; end?: string };

const DURATIONS: readonly { label: string; minutes: number }[] = [
  { label: '30 min', minutes: 30 },
  { label: '1h', minutes: 60 },
  { label: '1h30', minutes: 90 },
  { label: '2h', minutes: 120 },
  { label: '3h', minutes: 180 },
  { label: '4h', minutes: 240 },
];

/** Criação e edição de bloco da rotina, sem nada para digitar além do nome. */
export function RoutineItemSheet({ visible, item, weekday, onClose }: RoutineItemSheetProps) {
  const { items, addToDays, edit, remove, restore, removeMany } = useRoutine();
  const { showToast } = useToast();
  const tags = useMemo(() => usedTags(items), [items]);

  const [days, setDays] = useState<Weekday[]>([weekday]);
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [tag, setTag] = useState('');
  const [customTag, setCustomTag] = useState(false);
  const [picking, setPicking] = useState<'start' | 'end' | null>(null);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (!visible) return;
    setDays([item?.weekday ?? weekday]);
    setTitle(item?.title ?? '');
    setStart(item?.start ?? '');
    setEnd(item?.end ?? '');
    const initialTag = item?.tag ?? tags[0] ?? 'Estudo';
    setTag(initialTag);
    setCustomTag(false);
    setPicking(item ? null : 'start');
    setErrors({});
    // só ao abrir: as áreas mudam enquanto o formulário está aberto
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, item, weekday]);

  const duration = start && end ? toMinutes(end) - toMinutes(start) : undefined;

  const changeStart = (next: string) => {
    setStart(next);
    setErrors((current) => ({ ...current, start: undefined, end: undefined }));
    // mantém a duração já escolhida ao mudar o início
    if (duration !== undefined && duration > 0) {
      setEnd(addMinutes(next, duration) ?? '');
    } else if (end && toMinutes(end) <= toMinutes(next)) {
      setEnd('');
    }
  };

  const changeEnd = (next: string) => {
    setEnd(next);
    setErrors((current) => ({ ...current, end: undefined }));
  };

  const conflicts = useMemo(() => {
    if (!start || !end || toMinutes(end) <= toMinutes(start)) return [];
    return days.flatMap((day) => overlapping(items, day, start, end, item?.id));
  }, [days, start, end, items, item]);

  const validate = (): boolean => {
    const next: Errors = {};
    if (days.length === 0) next.days = 'Escolha pelo menos um dia';
    if (title.trim() === '') next.title = 'Dê um nome ao bloco';
    if (!start) next.start = 'Escolha o início';
    if (!end) next.end = 'Escolha o fim';
    else if (start && toMinutes(end) <= toMinutes(start))
      next.end = 'O fim precisa ser depois do início';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const draft = { title, start, end, tag: tag.trim() || 'Rotina' };

    if (item) {
      edit(item.id, days[0] ?? item.weekday, draft);
      showToast('Bloco atualizado', () => restore([item]));
    } else {
      const ordered = WEEK_ORDER.filter((day) => days.includes(day));
      const created = addToDays(ordered, draft);
      showToast(
        created.length === 1 ? 'Bloco criado' : `Bloco criado em ${created.length} dias`,
        () => removeMany(created.map((c) => c.id)),
      );
    }
    onClose();
  };

  const handleDelete = () => {
    if (!item) return;
    remove(item.id);
    showToast('Bloco removido da rotina', () => restore([item]));
    onClose();
  };

  return (
    <Sheet
      visible={visible}
      title={item ? 'Editar bloco' : 'Novo bloco'}
      onClose={onClose}
      footer={
        <>
          <Button
            label={
              item ? 'Salvar' : days.length > 1 ? `Criar em ${days.length} dias` : 'Criar bloco'
            }
            onPress={handleSave}
          />
          {item ? (
            <Button label="Remover da rotina" variant="ghost" onPress={handleDelete} />
          ) : null}
        </>
      }
    >
      <DayPicker
        label={item ? 'Dia' : 'Dias (pode marcar vários)'}
        value={days}
        onChange={(next) => {
          setDays(next);
          setErrors((current) => ({ ...current, days: undefined }));
        }}
        multiple={!item}
        error={errors.days}
      />

      <View style={styles.times}>
        <TimeDisplay
          label="Início"
          value={start}
          open={picking === 'start'}
          onToggle={() => setPicking(picking === 'start' ? null : 'start')}
          error={errors.start}
        />
        <TimeDisplay
          label="Fim"
          value={end}
          open={picking === 'end'}
          onToggle={() => setPicking(picking === 'end' ? null : 'end')}
          error={errors.end}
        />
      </View>

      {picking === 'start' ? (
        <TimePanel label="Início" value={start} onChange={changeStart} />
      ) : null}
      {picking === 'end' ? <TimePanel label="Fim" value={end} onChange={changeEnd} /> : null}

      {start ? (
        <View style={styles.field}>
          <AppText variant="overlineSmall" color="textDim" style={styles.label}>
            Duração
          </AppText>
          <View style={styles.chips}>
            {DURATIONS.map((option) => {
              const fits = addMinutes(start, option.minutes) !== undefined;
              return (
                <SelectChip
                  key={option.minutes}
                  label={option.label}
                  selected={duration === option.minutes}
                  disabled={!fits}
                  onPress={() => {
                    changeEnd(addMinutes(start, option.minutes) ?? end);
                    setPicking(null);
                  }}
                />
              );
            })}
          </View>
        </View>
      ) : null}

      {conflicts.length > 0 ? (
        <View style={styles.warning} accessibilityRole="alert">
          <AppText variant="captionStrong" color="danger">
            Esse horário bate com{' '}
            {conflicts.length === 1 ? 'outro bloco' : `${conflicts.length} blocos`}
          </AppText>
          {conflicts.slice(0, 3).map((conflict) => (
            <AppText key={conflict.id} variant="caption" color="textMuted">
              {weekdayShort(conflict.weekday)} {conflict.start}–{conflict.end} · {conflict.title}
            </AppText>
          ))}
          <AppText variant="caption" color="textDim">
            Dá para salvar mesmo assim.
          </AppText>
        </View>
      ) : null}

      <TextField
        label="Nome do bloco"
        value={title}
        onChangeText={(text) => {
          setTitle(text);
          setErrors((current) => ({ ...current, title: undefined }));
        }}
        placeholder="Ex.: Estudar teoria, Academia, Aula"
        error={errors.title}
        maxLength={60}
      />

      <TagPicker
        value={tag}
        onChange={setTag}
        suggestions={tags}
        custom={customTag}
        onCustomChange={setCustomTag}
      />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  times: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginBottom: spacing.xxl,
  },
  field: {
    marginBottom: spacing.xxl,
  },
  label: {
    marginBottom: spacing.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  warning: {
    gap: spacing.xs,
    marginBottom: spacing.xxl,
    padding: spacing.xl,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    backgroundColor: colors.dangerSurface,
  },
});
