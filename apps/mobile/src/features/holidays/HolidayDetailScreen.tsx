import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppText, Button, Card, EmptyState, Screen } from '@/components';
import { longDateLabel, todayIso } from '@/domain/clock';
import { distanceLabel, isIsoDate } from '@/domain/holiday';
import { useFetch } from '@/hooks/useFetch';
import { getHolidays } from '@/services/holidays';
import { colors, spacing } from '@/theme';

const TYPE_LABELS: Record<string, string> = { national: 'Nacional' };

/**
 * Detalhe de um feriado. A rota leva só a data (o identificador); o resto vem
 * da API/cache, então o dado nunca fica desatualizado por ter sido copiado.
 */
export function HolidayDetailScreen() {
  const params = useLocalSearchParams<{ date?: string | string[] }>();
  const rawDate = Array.isArray(params.date) ? params.date[0] : params.date;

  // Parâmetro de rota é entrada externa (link profundo): valida antes de usar.
  const date = isIsoDate(rawDate) ? rawDate : null;

  const load = useCallback(
    async ({ force, signal }: { force: boolean; signal: AbortSignal }) => {
      if (date === null) return null;
      const year = Number(date.slice(0, 4));
      const { data } = await getHolidays(year, { force, signal });
      return data.find((holiday) => holiday.date === date) ?? null;
    },
    [date],
  );
  const { data: holiday, loading, error, reload } = useFetch(load);

  const title = <Stack.Screen options={{ title: 'Feriado' }} />;

  if (date === null) {
    return (
      <Screen>
        {title}
        <EmptyState
          icon="info"
          title="Data inválida"
          description="Esse link não aponta para um feriado."
        />
      </Screen>
    );
  }

  if (loading) {
    return (
      <Screen scroll={false}>
        {title}
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.text} />
        </View>
      </Screen>
    );
  }

  if (error !== null) {
    return (
      <Screen>
        {title}
        <EmptyState
          icon="info"
          title="Não foi possível carregar"
          description={error}
          action={<Button label="Tentar de novo" onPress={reload} style={styles.retry} />}
        />
      </Screen>
    );
  }

  if (holiday === null) {
    return (
      <Screen>
        {title}
        <EmptyState
          icon="calendar"
          title="Não é feriado nacional"
          description={`${longDateLabel(date)} não consta na lista de feriados.`}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      {title}
      <AppText variant="overline" color="textDim" style={styles.overline}>
        {TYPE_LABELS[holiday.type] ?? 'Feriado'}
      </AppText>
      <AppText variant="display">{holiday.name}</AppText>
      <AppText variant="supporting" color="textMuted" style={styles.subtitle}>
        {longDateLabel(holiday.date)}
      </AppText>

      <Card>
        <View style={styles.row}>
          <AppText variant="body" color="textMuted">
            Quando
          </AppText>
          <AppText variant="bodyStrong">{distanceLabel(todayIso(), holiday.date)}</AppText>
        </View>
        <View style={styles.row}>
          <AppText variant="body" color="textMuted">
            Dia da semana
          </AppText>
          <AppText variant="bodyStrong">{holiday.weekday}</AppText>
        </View>
        <View style={styles.row}>
          <AppText variant="body" color="textMuted">
            Data
          </AppText>
          <AppText variant="bodyStrong">{`${holiday.date.slice(8)}/${holiday.date.slice(5, 7)}/${holiday.date.slice(0, 4)}`}</AppText>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  retry: {
    minWidth: 200,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overline: {
    marginBottom: spacing.md,
  },
  subtitle: {
    marginTop: spacing.md,
    marginBottom: spacing.section,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
});
