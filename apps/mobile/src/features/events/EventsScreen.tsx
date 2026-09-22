import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  Button,
  EmptyState,
  IconButton,
  Screen,
  ScreenHeader,
  SectionHeader,
} from '@/components';
import { todayIso } from '@/domain/clock';
import { filterEvents, markedDates, type CalendarEvent, type EventCategory } from '@/domain/event';
import { Icon } from '@/icons';
import { useEvents, useToast } from '@/state';
import { colors, spacing } from '@/theme';

import { EventFilters } from './EventFilters';
import { EventRow } from './EventRow';
import { EventSheet } from './EventSheet';
import { MonthCalendar } from './MonthCalendar';
import { UpNextCard } from './UpNextCard';

/** Tela Datas importantes: calendário, filtros e compromissos com CRUD. */
export function EventsScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { events, remove, restoreRemoved } = useEvents();

  const today = todayIso();
  const [selected, setSelected] = useState(today);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [categories, setCategories] = useState<ReadonlySet<EventCategory>>(new Set());
  const [sheetOpen, setSheetOpen] = useState(false);

  const visibleEvents = useMemo(() => filterEvents(events, categories), [events, categories]);
  const marked = useMemo(() => markedDates(events), [events]);
  const upNext = useMemo(() => events.find((event) => event.date >= today), [events, today]);

  const toggleCategory = useCallback((category: EventCategory) => {
    setCategories((current) => {
      const next = new Set(current);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }, []);

  const shiftMonth = useCallback((delta: number) => {
    setMonth((current) => {
      const next = new Date(current.year, current.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  }, []);

  const handleRemove = useCallback(
    (event: CalendarEvent) => {
      remove(event.id);
      showToast('Compromisso removido', () => restoreRemoved(event));
    },
    [remove, restoreRemoved, showToast],
  );

  return (
    <Screen bottomInset={spacing.section}>
      <ScreenHeader
        title="Datas importantes"
        subtitle={
          events.length === 0
            ? 'Nenhum compromisso marcado.'
            : `${events.length} ${events.length === 1 ? 'compromisso' : 'compromissos'} na agenda.`
        }
        action={
          <IconButton
            name="close"
            onPress={() => router.back()}
            accessibilityLabel="Fechar"
            size={22}
          />
        }
      />

      <Button
        label="Novo compromisso"
        onPress={() => setSheetOpen(true)}
        trailing={<Icon name="plus" size={16} strokeWidth={2} color={colors.onLight} />}
        style={styles.newEvent}
      />

      <View style={styles.block}>
        <MonthCalendar
          year={month.year}
          month={month.month}
          selected={selected}
          today={today}
          marked={marked}
          onSelect={setSelected}
          onPreviousMonth={() => shiftMonth(-1)}
          onNextMonth={() => shiftMonth(1)}
        />
      </View>

      {events.length > 0 ? (
        <View style={styles.block}>
          <EventFilters
            selected={categories}
            onToggle={toggleCategory}
            onSelectAll={() => setCategories(new Set())}
          />
        </View>
      ) : null}

      {upNext ? (
        <View style={styles.block}>
          <UpNextCard event={upNext} onRemove={() => handleRemove(upNext)} />
        </View>
      ) : null}

      <SectionHeader title="Próximos" style={styles.sectionHeader} />

      {events.length === 0 ? (
        <EmptyState
          icon="calendar"
          title="Agenda limpa"
          description="Escolha um dia no calendário e toque em Novo compromisso."
        />
      ) : visibleEvents.length === 0 ? (
        <EmptyState
          icon="calendar"
          title="Nada nesses filtros"
          description="Marque Todos os eventos para ver a agenda inteira."
        />
      ) : (
        visibleEvents.map((event) => (
          <EventRow key={event.id} event={event} onRemove={() => handleRemove(event)} />
        ))
      )}

      <EventSheet visible={sheetOpen} date={selected} onClose={() => setSheetOpen(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  newEvent: {
    marginBottom: spacing.section,
  },
  block: {
    marginBottom: spacing.section,
  },
  sectionHeader: {
    marginBottom: spacing.md,
  },
});
