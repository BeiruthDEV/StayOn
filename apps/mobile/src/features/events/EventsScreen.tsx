import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, IconButton, Screen, ScreenHeader, SectionHeader } from '@/components';
import { calendarMonth, initialEvents, selectedDate, todayDate } from '@/data/events';
import { filterEvents, markedDates, type CalendarEvent, type EventCategory } from '@/domain/event';
import { Icon } from '@/icons';
import { useToast } from '@/state';
import { colors, spacing } from '@/theme';

import { EventFilters } from './EventFilters';
import { EventRow } from './EventRow';
import { MonthCalendar } from './MonthCalendar';
import { UpNextCard } from './UpNextCard';

/** Tela Datas importantes: calendário do mês, filtros e próximos compromissos. */
export function EventsScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [selected, setSelected] = useState(selectedDate);
  const [categories, setCategories] = useState<ReadonlySet<EventCategory>>(new Set());

  const visibleEvents = useMemo(() => filterEvents(initialEvents, categories), [categories]);
  const marked = useMemo(() => markedDates(initialEvents), []);

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

  const handleEventPress = useCallback(
    (event: CalendarEvent) => showToast(`${event.title} · ${event.dateLabel}`),
    [showToast],
  );

  return (
    <Screen bottomInset={spacing.section}>
      <ScreenHeader
        title="Datas importantes"
        subtitle={`${initialEvents.length} compromissos neste mês`}
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
        label="Novo evento"
        onPress={() => showToast('Novo evento chega em breve')}
        trailing={<Icon name="plus" size={16} strokeWidth={2} color={colors.onLight} />}
        style={styles.newEvent}
      />

      <View style={styles.block}>
        <MonthCalendar
          year={calendarMonth.year}
          month={calendarMonth.month}
          selected={selected}
          today={todayDate}
          marked={marked}
          onSelect={setSelected}
          onPreviousMonth={() => showToast('Mês anterior')}
          onNextMonth={() => showToast('Próximo mês')}
        />
      </View>

      <View style={styles.block}>
        <EventFilters
          selected={categories}
          onToggle={toggleCategory}
          onSelectAll={() => setCategories(new Set())}
        />
      </View>

      <View style={styles.block}>
        <UpNextCard
          onJoin={() => showToast('Abrindo a reunião')}
          onDetails={() => showToast('Detalhes chegam em breve')}
        />
      </View>

      <SectionHeader title="Próximos" style={styles.sectionHeader} />

      {visibleEvents.length === 0 ? (
        <AppText variant="supporting" color="textDim" style={styles.empty}>
          Nenhum compromisso nas categorias selecionadas.
        </AppText>
      ) : (
        visibleEvents.map((event) => (
          <EventRow key={event.id} event={event} onPress={handleEventPress} />
        ))
      )}
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
  empty: {
    paddingVertical: spacing.section,
  },
});
