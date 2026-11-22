import { Stack, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import {
  AppText,
  Button,
  EmptyState,
  IconButton,
  ListRow,
  Screen,
  ScreenHeader,
} from '@/components';
import { todayIso } from '@/domain/clock';
import {
  distanceLabel,
  isValidHolidayYear,
  type Holiday,
} from '@/domain/holiday';
import { useFetch } from '@/hooks/useFetch';
import { getHolidays } from '@/services/holidays';
import { colors, spacing } from '@/theme';

import { formatSavedAt } from './format';

/** Feriados nacionais do ano, vindos da BrasilAPI, com cache para uso offline. */
export function HolidaysScreen() {
  const router = useRouter();
  const today = todayIso();
  const [year, setYear] = useState(() => Number(today.slice(0, 4)));

  const load = useCallback(
    ({ force, signal }: { force: boolean; signal: AbortSignal }) =>
      getHolidays(year, { force, signal }),
    [year],
  );
  const { data, loading, refreshing, error, reload, refresh } = useFetch(load);

  const shiftYear = (delta: number) => {
    const next = year + delta;
    if (isValidHolidayYear(next)) setYear(next);
  };

  const header = (
    <ScreenHeader
      overline="Brasil"
      title="Feriados"
      subtitle={`Feriados nacionais de ${year}.`}
      action={
        <View style={styles.yearControls}>
          <IconButton
            name="chevronLeft"
            onPress={() => shiftYear(-1)}
            accessibilityLabel="Ano anterior"
          />
          <IconButton
            name="chevronRight"
            onPress={() => shiftYear(1)}
            accessibilityLabel="Próximo ano"
          />
        </View>
      }
    />
  );

  // Ordem dos estados: carregando → erro → vazio → sucesso. Nunca dois juntos.
  if (loading) {
    return (
      <Screen scroll={false}>
        <Stack.Screen options={{ title: '' }} />
        {header}
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.text} />
          <AppText variant="supporting" color="textDim" style={styles.centeredText}>
            Carregando feriados…
          </AppText>
        </View>
      </Screen>
    );
  }

  if (error !== null || data === null) {
    return (
      <Screen scroll={false}>
        <Stack.Screen options={{ title: '' }} />
        {header}
        <EmptyState
          icon="info"
          title="Não foi possível carregar"
          description={error ?? 'Tente de novo em instantes.'}
          action={<Button label="Tentar de novo" onPress={reload} style={styles.retry} />}
        />
      </Screen>
    );
  }

  const openDetail = (holiday: Holiday) =>
    router.push({ pathname: '/feriado/[date]', params: { date: holiday.date } });

  return (
    <Screen scroll={false}>
      <Stack.Screen options={{ title: '' }} />
      <FlatList
        data={data.data}
        keyExtractor={(holiday) => holiday.date}
        refreshing={refreshing}
        onRefresh={refresh}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            {header}
            {data.stale ? (
              <AppText variant="caption" color="textDim" style={styles.staleNotice}>
                Sem conexão. Mostrando dados salvos em {formatSavedAt(data.savedAt)}.
              </AppText>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="calendar"
            title="Nenhum feriado"
            description={`A API não retornou feriados para ${year}.`}
          />
        }
        renderItem={({ item }) => (
          <ListRow
            title={item.name}
            subtitle={`${item.weekday}, ${formatDay(item.date)}`}
            muted={item.date < today}
            onPress={() => openDetail(item)}
            trailing={
              <AppText variant="tag" color="textDim">
                {distanceLabel(today, item.date)}
              </AppText>
            }
          />
        )}
      />
    </Screen>
  );
}

/** "2026-09-07" → "07/09". */
function formatDay(iso: string): string {
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
}

const styles = StyleSheet.create({
  retry: {
    minWidth: 200,
  },
  yearControls: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  list: {
    paddingBottom: spacing.section * 2,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.section * 3,
  },
  centeredText: {
    marginTop: spacing.xxl,
  },
  staleNotice: {
    marginBottom: spacing.xxl,
  },
});
