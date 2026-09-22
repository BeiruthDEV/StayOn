import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, Card, IconButton, Screen, ScreenHeader } from '@/components';
import { shiftDate, todayIso } from '@/domain/clock';
import {
  completionRate,
  focusByDay,
  focusByLabel,
  sessionsOn,
  totalFocusMinutes,
} from '@/domain/session';
import { minutesLabel } from '@/domain/usage';
import { Icon } from '@/icons';
import { useSessions, useTasks } from '@/state';
import { colors, spacing } from '@/theme';

import { FocusTodayCard } from './FocusTodayCard';
import { TimeByAreaList } from './TimeByAreaList';
import { WeeklyFocusChart } from './WeeklyFocusChart';

/** Tela Insights: foco de hoje, últimos sete dias e onde o tempo foi. */
export function InsightsScreen() {
  const router = useRouter();
  const { sessions } = useSessions();
  const { tasks } = useTasks();

  const today = todayIso();
  const yesterday = shiftDate(today, -1);

  const todaySessions = useMemo(() => sessionsOn(sessions, today), [sessions, today]);
  const minutesToday = totalFocusMinutes(todaySessions);
  const minutesYesterday = totalFocusMinutes(sessionsOn(sessions, yesterday));

  const lastSevenDays = useMemo(
    () => focusByDay(sessions, Array.from({ length: 7 }, (_, index) => shiftDate(today, index - 6))),
    [sessions, today],
  );

  const byArea = useMemo(() => focusByLabel(sessions), [sessions]);
  const rate = completionRate(sessions);
  const doneTasks = tasks.filter((task) => task.done).length;

  return (
    <Screen bottomInset={spacing.section}>
      <ScreenHeader
        title="Seus números"
        subtitle="Calculados a partir das suas sessões de foco."
        action={
          <IconButton
            name="calendar"
            onPress={() => router.navigate('/weekly-review')}
            accessibilityLabel="Revisão semanal"
            size={22}
          />
        }
      />

      <View style={styles.block}>
        <FocusTodayCard
          minutesToday={minutesToday}
          minutesYesterday={minutesYesterday}
          todaySessions={todaySessions}
        />
      </View>

      <View style={styles.block}>
        <Card>
          <View style={styles.insightHeader}>
            <Icon name="bulb" size={18} strokeWidth={1.6} color={colors.textMuted} />
            <AppText variant="overlineSmall" color="textMuted">
              Insight principal
            </AppText>
          </View>
          <AppText variant="supporting" color="textMuted" style={styles.insightText}>
            {buildInsight(sessions.length, rate, minutesToday, doneTasks)}
          </AppText>
        </Card>
      </View>

      <View style={styles.block}>
        <WeeklyFocusChart days={lastSevenDays} today={today} />
      </View>

      <View style={styles.block}>
        <TimeByAreaList entries={byArea} />
      </View>

      <Card>
        <AppText variant="sectionTitle">Revisão da semana</AppText>
        <AppText variant="supporting" color="textMuted" style={styles.reviewText}>
          O consolidado dos últimos sete dias, com taxa de execução e espaço para registrar o
          que funcionou.
        </AppText>
        <Button
          label="Abrir revisão semanal"
          onPress={() => router.navigate('/weekly-review')}
          trailing={<Icon name="arrowRight" size={16} strokeWidth={1.8} color={colors.onLight} />}
          style={styles.reviewAction}
        />
      </Card>
    </Screen>
  );
}

/** Frase do insight, escolhida pelo estado real dos dados. */
function buildInsight(
  totalSessions: number,
  rate: number,
  minutesToday: number,
  doneTasks: number,
): string {
  if (totalSessions === 0) {
    return 'Assim que você encerrar a primeira sessão de foco, os números desta tela começam a aparecer.';
  }

  if (minutesToday === 0) {
    const plural = totalSessions === 1 ? 'sessão registrada' : 'sessões registradas';
    return `Você tem ${totalSessions} ${plural}, mas nenhuma hoje. Uma sessão curta já mantém o ritmo.`;
  }

  if (rate < 60) {
    return `Você leva ${rate}% das sessões até o fim. Sessões mais curtas costumam elevar esse número.`;
  }

  const tasksPart =
    doneTasks > 0
      ? `${doneTasks} ${doneTasks === 1 ? 'tarefa concluída' : 'tarefas concluídas'}.`
      : 'Marque as tarefas concluídas para completar o quadro.';

  return `${minutesLabel(minutesToday)} de foco hoje e ${rate}% das sessões concluídas. ${tasksPart}`;
}

const styles = StyleSheet.create({
  block: {
    marginBottom: spacing.section,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  insightText: {
    marginTop: spacing.lg,
  },
  reviewText: {
    marginTop: spacing.sm,
  },
  reviewAction: {
    marginTop: spacing.xxl,
  },
});
