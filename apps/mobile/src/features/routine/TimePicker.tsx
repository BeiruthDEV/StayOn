import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components';
import { Icon } from '@/icons';
import { colors, motion, radius, spacing } from '@/theme';

import { SelectChip } from './SelectChip';

type TimeDisplayProps = {
  label: string;
  /** HH:MM, ou vazio quando ainda não foi escolhido. */
  value: string;
  open: boolean;
  onToggle: () => void;
  error?: string | undefined;
};

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const MINUTES = [0, 10, 15, 20, 30, 40, 45, 50];

const pad = (value: number) => String(value).padStart(2, '0');

/** Campo de horário: mostra o valor e abre o seletor ao toque. */
export function TimeDisplay({ label, value, open, onToggle, error }: TimeDisplayProps) {
  return (
    <View style={styles.field}>
      <AppText variant="overlineSmall" color="textDim" style={styles.label}>
        {label}
      </AppText>

      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value || 'não escolhido'}`}
        accessibilityState={{ expanded: open }}
        style={({ pressed }) => [
          styles.display,
          open && styles.displayOpen,
          error !== undefined && styles.displayError,
          pressed && styles.pressed,
        ]}
      >
        <AppText variant="title" color={value ? 'text' : 'textFaint'}>
          {value || '--:--'}
        </AppText>
        <Icon name="clock" size={18} color={open ? colors.text : colors.textDim} />
      </Pressable>

      {error !== undefined ? (
        <AppText variant="caption" color="danger" style={styles.helper}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

type TimePanelProps = {
  /** O que está sendo escolhido, para o título do painel. */
  label: string;
  value: string;
  onChange: (time: string) => void;
};

/**
 * Seletor de horário por toque: hora numa grade e minutos em etiquetas.
 * Nada é digitado, então não existe horário em formato errado.
 */
export function TimePanel({ label, value, onChange }: TimePanelProps) {
  const [hourText = '', minuteText = ''] = value.split(':');
  const hour = value ? Number(hourText) : undefined;
  const minute = value ? Number(minuteText) : undefined;

  return (
    <View style={styles.panel}>
      <AppText variant="caption" color="textDim">
        {label}: hora
      </AppText>
      <View style={styles.grid}>
        {HOURS.map((option) => (
          <View key={option} style={styles.cell}>
            <SelectChip
              compact
              label={pad(option)}
              selected={hour === option}
              onPress={() => onChange(`${pad(option)}:${pad(minute ?? 0)}`)}
            />
          </View>
        ))}
      </View>

      <AppText variant="caption" color="textDim">
        {label}: minutos
      </AppText>
      <View style={styles.grid}>
        {MINUTES.map((option) => (
          <View key={option} style={styles.cellWide}>
            <SelectChip
              compact
              label={`:${pad(option)}`}
              selected={minute === option && hour !== undefined}
              onPress={() => onChange(`${pad(hour ?? 8)}:${pad(option)}`)}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    marginBottom: spacing.md,
  },
  display: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  displayOpen: {
    borderColor: colors.textDim,
  },
  displayError: {
    borderColor: colors.dangerBorder,
  },
  helper: {
    marginTop: spacing.sm,
  },
  panel: {
    marginBottom: spacing.xxl,
    padding: spacing.xl,
    gap: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xxs,
  },
  cell: {
    width: '16.66%',
    padding: spacing.xxs,
  },
  cellWide: {
    width: '25%',
    padding: spacing.xxs,
  },
  pressed: {
    opacity: motion.pressedOpacity,
  },
});
