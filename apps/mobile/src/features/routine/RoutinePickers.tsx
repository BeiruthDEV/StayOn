import { StyleSheet, View } from 'react-native';

import { AppText, TextField } from '@/components';
import { WEEK_ORDER, weekdayShort, type Weekday } from '@/domain/routine';
import { spacing } from '@/theme';

import { SelectChip } from './SelectChip';

type DayPickerProps = {
  label: string;
  value: readonly Weekday[];
  onChange: (days: Weekday[]) => void;
  /** Vários dias de uma vez (criação) ou um só (edição). */
  multiple: boolean;
  error?: string | undefined;
};

const WORKDAYS: readonly Weekday[] = [1, 2, 3, 4, 5];

/** Seleção dos dias da semana, com atalhos para seg a sex e todos. */
export function DayPicker({ label, value, onChange, multiple, error }: DayPickerProps) {
  const toggle = (day: Weekday) => {
    if (!multiple) {
      onChange([day]);
      return;
    }
    onChange(value.includes(day) ? value.filter((d) => d !== day) : [...value, day]);
  };

  const same = (days: readonly Weekday[]) =>
    days.length === value.length && days.every((day) => value.includes(day));

  return (
    <View style={styles.field}>
      <AppText variant="overlineSmall" color="textDim" style={styles.label}>
        {label}
      </AppText>
      <View style={styles.days}>
        {WEEK_ORDER.map((day) => (
          <View key={day} style={styles.day}>
            <SelectChip
              compact
              role={multiple ? 'checkbox' : 'radio'}
              label={weekdayShort(day)}
              selected={value.includes(day)}
              onPress={() => toggle(day)}
            />
          </View>
        ))}
      </View>
      {multiple ? (
        <View style={styles.shortcuts}>
          <SelectChip
            role="button"
            label="Seg a sex"
            selected={same(WORKDAYS)}
            onPress={() => onChange([...WORKDAYS])}
          />
          <SelectChip
            role="button"
            label="Todos os dias"
            selected={same(WEEK_ORDER)}
            onPress={() => onChange([...WEEK_ORDER])}
          />
        </View>
      ) : null}
      {error !== undefined ? (
        <AppText variant="caption" color="danger" style={styles.helper}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

type TagPickerProps = {
  value: string;
  onChange: (tag: string) => void;
  /** Áreas já usadas na rotina, mostradas primeiro. */
  suggestions: readonly string[];
  custom: boolean;
  onCustomChange: (custom: boolean) => void;
};

const DEFAULT_TAGS = ['Estudo', 'Treino', 'Trabalho', 'Faculdade', 'Pessoal'];

/** Área do bloco: escolhe uma existente com um toque ou escreve uma nova. */
export function TagPicker({
  value,
  onChange,
  suggestions,
  custom,
  onCustomChange,
}: TagPickerProps) {
  const options = Array.from(new Set([...suggestions, ...DEFAULT_TAGS])).slice(0, 10);

  return (
    <View style={styles.field}>
      <AppText variant="overlineSmall" color="textDim" style={styles.label}>
        Área
      </AppText>
      <View style={styles.shortcuts}>
        {options.map((tag) => (
          <SelectChip
            key={tag}
            label={tag}
            selected={!custom && value === tag}
            onPress={() => {
              onCustomChange(false);
              onChange(tag);
            }}
          />
        ))}
        <SelectChip
          label="Outra…"
          selected={custom}
          onPress={() => {
            onCustomChange(true);
            onChange('');
          }}
        />
      </View>
      {custom ? (
        <View style={styles.custom}>
          <TextField
            label="Nome da área"
            value={value}
            onChangeText={onChange}
            placeholder="Ex.: Concurso"
            maxLength={24}
            autoFocus
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: spacing.xxl,
  },
  label: {
    marginBottom: spacing.md,
  },
  days: {
    flexDirection: 'row',
    marginHorizontal: -spacing.xxs,
  },
  day: {
    flex: 1,
    paddingHorizontal: spacing.xxs,
  },
  shortcuts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  custom: {
    marginTop: spacing.xl,
  },
  helper: {
    marginTop: spacing.sm,
  },
});
