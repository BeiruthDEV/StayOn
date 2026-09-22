import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, Card, IconButton, Screen, ScreenHeader } from '@/components';
import {
  blockedAttemptsToday,
  hourlyUsage,
  keyInsight,
  todayScreenTime,
  topDistractions,
} from '@/data/insights';
import { Icon } from '@/icons';
import { useToast } from '@/state';
import { colors, spacing } from '@/theme';

import { DistractionList } from './DistractionList';
import { HourlyUsageChart } from './HourlyUsageChart';
import { ScreenTimeCard } from './ScreenTimeCard';

/** Tela Insights: tempo de tela, uso por hora e principais distrações do dia. */
export function InsightsScreen() {
  const router = useRouter();
  const { showToast } = useToast();

  return (
    <Screen bottomInset={spacing.section}>
      <ScreenHeader
        title="Análise comportamental"
        subtitle="Tempo de tela e distrações de hoje."
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
        <ScreenTimeCard screenTime={todayScreenTime} />
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
            {keyInsight}
          </AppText>
        </Card>
      </View>

      <View style={styles.block}>
        <HourlyUsageChart usage={hourlyUsage} />
      </View>

      <View style={styles.block}>
        <DistractionList
          distractions={topDistractions}
          blockedAttempts={blockedAttemptsToday}
          onManage={(distraction) => showToast(`Opções de ${distraction.name}`)}
        />
      </View>

      <Card>
        <AppText variant="sectionTitle">Limites de apps</AppText>
        <AppText variant="supporting" color="textMuted" style={styles.limitsText}>
          Ajuste a rigidez dos bloqueios para os blocos de foco de amanhã.
        </AppText>
        <Button
          label="Editar limites"
          onPress={() => showToast('Edição de limites chega em breve')}
          trailing={<Icon name="sliders" size={16} strokeWidth={1.8} color={colors.onLight} />}
          style={styles.limitsAction}
        />
        <Button
          label="Ver relatório completo"
          variant="ghost"
          onPress={() => router.navigate('/weekly-review')}
          style={styles.limitsGhost}
        />
      </Card>
    </Screen>
  );
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
  limitsText: {
    marginTop: spacing.sm,
  },
  limitsAction: {
    marginTop: spacing.xxl,
  },
  limitsGhost: {
    alignSelf: 'center',
    marginTop: spacing.xl,
  },
});
