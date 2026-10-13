import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Button, Checkbox, Chip, EmptyState, Progress, SectionHeader } from '@/components';
import { rangeLabel, todayIso } from '@/domain/clock';
import {
  dayScore,
  isDone,
  itemsForWeekday,
  pastWeeks,
  percentOf,
  weekDates,
  weekdayOf,
  weekdayShort,
  weekScoreUntil,
  type RoutineItem,
} from '@/domain/routine';
import { useRoutine, useToast } from '@/state';
import { colors, motion, radius, spacing } from '@/theme';

import { RoutineImportSheet } from './RoutineImportSheet';
import { RoutineItemSheet } from './RoutineItemSheet';

/**
 * Rotina semanal fixa: os blocos de cada dia da semana, marcados dia a dia.
 * Cada data começa sem nada marcado e os dias anteriores viram histórico.
 */
export function RoutineView() {
  const { items, log, toggle, hydrated } = useRoutine();
  const { showToast } = useToast();

  const today = todayIso();
  const dates = useMemo(() => weekDates(today), [today]);
  const [selected, setSelected] = useState(today);

  const [importOpen, setImportOpen] = useState(false);
  const [itemSheetOpen, setItemSheetOpen] = useState(false);
  const [editing, setEditing] = useState<RoutineItem | undefined>(undefined);

  const selectedWeekday = weekdayOf(selected);
  const dayItems = useMemo(() => itemsForWeekday(items, selectedWeekday), [items, selectedWeekday]);
  const week = useMemo(() => weekScoreUntil(items, log, today), [items, log, today]);
  const history = useMemo(() => pastWeeks(items, log, today, 4), [items, log, today]);
  const isFuture = selected > today;

  const handleToggle = (item: RoutineItem) => {
    if (isFuture) {
      showToast('Esse dia ainda não chegou');
      return;
    }
    toggle(selected, item.id);
  };

  const openNew = () => {
    setEditing(undefined);
    setItemSheetOpen(true);
  };

  const openEdit = (item: RoutineItem) => {
    setEditing(item);
    setItemSheetOpen(true);
  };

  if (!hydrated) return null;

  if (items.length === 0) {
    return (
      <>
        <EmptyState
          icon="planner"
          title="Sem rotina ainda"
          description="Monte a semana fixa: os mesmos blocos todo dia da semana. Cada dia você marca o que cumpriu, e o app guarda o histórico."
          action={<Button label="Importar rotina" onPress={() => setImportOpen(true)} />}
        />
        <RoutineImportSheet visible={importOpen} onClose={() => setImportOpen(false)} />
      </>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.summary}>
        <View style={styles.summaryText}>
          <AppText variant="overlineSmall" color="textDim">
            Semana até hoje
          </AppText>
          <AppText variant="title">
            {week.done} de {week.total} blocos
          </AppText>
        </View>
        <AppText variant="captionStrong" color={percentOf(week) >= 80 ? 'success' : 'textMuted'}>
          {percentOf(week)}%
        </AppText>
      </View>
      <View style={styles.progress}>
        <Progress percent={percentOf(week)} />
      </View>

      <View style={styles.days}>
        {dates.map((date) => {
          const active = date === selected;
          const score = dayScore(items, log, date);
          const past = date < today;
          const complete = score.total > 0 && score.done === score.total;

          return (
            <Pressable
              key={date}
              onPress={() => setSelected(date)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${weekdayShort(weekdayOf(date))}, ${score.done} de ${score.total}`}
              style={[styles.day, active && styles.dayActive, date === today && styles.dayToday]}
            >
              <AppText variant="captionMedium" color={active ? 'text' : 'textDim'}>
                {weekdayShort(weekdayOf(date))}
              </AppText>
              <AppText
                variant="tag"
                color={
                  complete ? 'success' : past && score.done < score.total ? 'danger' : 'textDim'
                }
              >
                {date > today ? `${score.total}` : `${score.done}/${score.total}`}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      {dayItems.length === 0 ? (
        <AppText variant="supporting" color="textDim" style={styles.dayEmpty}>
          Nenhum bloco neste dia.
        </AppText>
      ) : null}

      {dayItems.map((item) => {
        const done = isDone(log, selected, item.id);

        return (
          <Pressable
            key={item.id}
            onPress={() => handleToggle(item)}
            onLongPress={() => openEdit(item)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: done, disabled: isFuture }}
            accessibilityHint="Toque longo para editar"
            style={({ pressed }) => [
              styles.row,
              isFuture && styles.rowFuture,
              pressed && styles.pressed,
            ]}
          >
            <Checkbox checked={done} />
            <View style={styles.rowBody}>
              <AppText variant="caption" color="textDim">
                {item.start} – {item.end}
              </AppText>
              <AppText
                variant="bodyStrong"
                color={done ? 'textMuted' : 'text'}
                style={done && styles.doneTitle}
              >
                {item.title}
              </AppText>
            </View>
            <Chip label={item.tag} tone="outline" />
          </Pressable>
        );
      })}

      <View style={styles.actions}>
        <Button
          label={`Novo bloco na ${weekdayShort(selectedWeekday).toLowerCase()}`}
          variant="ghost"
          onPress={openNew}
        />
        <Button label="Importar rotina" variant="ghost" onPress={() => setImportOpen(true)} />
      </View>

      {history.length > 0 ? (
        <View style={styles.history}>
          <SectionHeader title="Semanas anteriores" />
          {history.map((row) => (
            <View key={row.from} style={styles.historyRow}>
              <AppText variant="supporting" color="textMuted" style={styles.historyLabel}>
                {rangeLabel(row.from, row.to)}
              </AppText>
              <AppText variant="captionMedium" color="textDim">
                {row.score.done}/{row.score.total}
              </AppText>
              <AppText
                variant="captionStrong"
                color={percentOf(row.score) >= 80 ? 'success' : 'text'}
                style={styles.historyPercent}
              >
                {percentOf(row.score)}%
              </AppText>
            </View>
          ))}
        </View>
      ) : null}

      <RoutineItemSheet
        visible={itemSheetOpen}
        item={editing}
        weekday={selectedWeekday}
        onClose={() => setItemSheetOpen(false)}
      />
      <RoutineImportSheet visible={importOpen} onClose={() => setImportOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.md,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  summaryText: {
    gap: spacing.xs,
  },
  progress: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
  },
  days: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  day: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xxs,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayActive: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.borderStrong,
  },
  dayToday: {
    borderColor: colors.textDim,
  },
  dayEmpty: {
    paddingVertical: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  rowFuture: {
    opacity: 0.55,
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
  doneTitle: {
    textDecorationLine: 'line-through',
  },
  pressed: {
    opacity: motion.pressedOpacity,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  history: {
    marginTop: spacing.section,
    gap: spacing.md,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    paddingVertical: spacing.sm,
  },
  historyLabel: {
    flex: 1,
  },
  historyPercent: {
    width: 44,
    textAlign: 'right',
  },
});
