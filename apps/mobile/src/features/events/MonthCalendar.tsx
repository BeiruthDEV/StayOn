import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Card, IconButton } from '@/components';
import { buildMonthGrid, monthLabel, weekdayInitials } from '@/domain/calendar';
import { colors, radius, spacing } from '@/theme';

type MonthCalendarProps = {
  year: number;
  /** Índice do mês, 0 = janeiro. */
  month: number;
  /** Data selecionada no formato YYYY-MM-DD. */
  selected: string;
  /** Data de hoje no formato YYYY-MM-DD. */
  today: string;
  /** Datas com compromisso, marcadas com um ponto. */
  marked: ReadonlySet<string>;
  onSelect: (date: string) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
};

/** Grade mensal com dia selecionado, dia de hoje e marcadores de compromisso. */
export function MonthCalendar({
  year,
  month,
  selected,
  today,
  marked,
  onSelect,
  onPreviousMonth,
  onNextMonth,
}: MonthCalendarProps) {
  const grid = buildMonthGrid(year, month);

  return (
    <Card>
      <View style={styles.header}>
        <AppText variant="sectionTitle">{monthLabel(year, month)}</AppText>
        <View style={styles.headerActions}>
          <IconButton
            name="chevronLeft"
            size={18}
            onPress={onPreviousMonth}
            accessibilityLabel="Mês anterior"
          />
          <IconButton
            name="chevronRight"
            size={18}
            onPress={onNextMonth}
            accessibilityLabel="Próximo mês"
          />
        </View>
      </View>

      <View style={styles.week}>
        {weekdayInitials.map((initial, index) => (
          <AppText
            key={`${initial}-${index}`}
            variant="caption"
            color="textDim"
            style={styles.weekday}
          >
            {initial}
          </AppText>
        ))}
      </View>

      {grid.map((week) => (
        <View key={week[0]?.date} style={styles.week}>
          {week.map((cell) => {
            const isSelected = cell.date === selected;
            const isToday = cell.date === today;

            return (
              <Pressable
                key={cell.date}
                onPress={() => onSelect(cell.date)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                style={styles.cellTouch}
              >
                <View
                  style={[
                    styles.cell,
                    isToday && styles.cellToday,
                    isSelected && styles.cellSelected,
                  ]}
                >
                  <AppText
                    variant={isSelected ? 'captionStrong' : 'caption'}
                    color={isSelected ? 'onLight' : cell.inMonth ? 'text' : 'textFaint'}
                  >
                    {cell.day}
                  </AppText>
                </View>
                <View
                  style={[
                    styles.dot,
                    marked.has(cell.date) && cell.inMonth && styles.dotVisible,
                  ]}
                />
              </Pressable>
            );
          })}
        </View>
      ))}
    </Card>
  );
}

const CELL_SIZE = 30;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xxl,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.section,
  },
  week: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekday: {
    width: CELL_SIZE,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  cellTouch: {
    alignItems: 'center',
    width: CELL_SIZE,
    paddingVertical: spacing.xs,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellToday: {
    backgroundColor: colors.surfaceRaised,
  },
  cellSelected: {
    backgroundColor: colors.fillLight,
  },
  dot: {
    width: 3,
    height: 3,
    marginTop: spacing.xxs,
    borderRadius: radius.pill,
    backgroundColor: colors.transparent,
  },
  dotVisible: {
    backgroundColor: colors.textMuted,
  },
});
