import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Card } from '@/components';
import { categoryLabels, type EventCategory } from '@/domain/event';
import { Icon } from '@/icons';
import { colors, motion, radius, spacing } from '@/theme';

type EventFiltersProps = {
  /** Conjunto vazio significa "todos os eventos". */
  selected: ReadonlySet<EventCategory>;
  onToggle: (category: EventCategory) => void;
  onSelectAll: () => void;
};

const CATEGORIES = Object.keys(categoryLabels) as EventCategory[];

/** Filtros por categoria, com a opção "todos os eventos" no topo. */
export function EventFilters({ selected, onToggle, onSelectAll }: EventFiltersProps) {
  return (
    <Card>
      <AppText variant="overlineSmall" color="textDim" style={styles.title}>
        Filtros
      </AppText>

      <FilterRow label="Todos os eventos" checked={selected.size === 0} onPress={onSelectAll} />
      {CATEGORIES.map((category) => (
        <FilterRow
          key={category}
          label={categoryLabels[category]}
          checked={selected.has(category)}
          onPress={() => onToggle(category)}
        />
      ))}
    </Card>
  );
}

function FilterRow({
  label,
  checked,
  onPress,
}: {
  label: string;
  checked: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked ? <Icon name="check" size={12} strokeWidth={2.4} color={colors.onLight} /> : null}
      </View>
      <AppText variant="body" color={checked ? 'text' : 'textMuted'}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    paddingVertical: spacing.lg,
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: radius.xs + 3,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: {
    borderColor: colors.fillLight,
    backgroundColor: colors.fillLight,
  },
  pressed: {
    opacity: motion.pressedOpacity,
  },
});
