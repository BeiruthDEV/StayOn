import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import {
  AppText,
  Card,
  ListRow,
  Screen,
  SectionHeader,
  SegmentedControl,
} from '@/components';
import { Icon } from '@/icons';
import {
  useBlocks,
  useEvents,
  useHabits,
  usePreferences,
  useSessions,
  useTasks,
  useToast,
} from '@/state';
import { clearAll } from '@/storage';
import { colors, spacing } from '@/theme';

import { ProfileIdentity } from './ProfileIdentity';
import { ProfileSheet } from './ProfileSheet';

const INTERVENTION_LEVELS = ['Suave', 'Rígido'] as const;

/** Tela Perfil: identidade, preferências de foco, dados e informações do app. */
export function ProfileScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { preferences, setInterventionLevel, reset } = usePreferences();
  const tasks = useTasks();
  const habits = useHabits();
  const blocks = useBlocks();
  const events = useEvents();
  const sessions = useSessions();

  const [sheetOpen, setSheetOpen] = useState(false);

  const handleReset = useCallback(() => {
    Alert.alert(
      'Apagar todos os dados?',
      'Tarefas, hábitos, agenda, compromissos, sessões e preferências são apagados. Não dá para desfazer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: () => {
            void clearAll().then(() => {
              tasks.replaceAll([]);
              habits.replaceAll([]);
              blocks.replaceAll([]);
              events.replaceAll([]);
              sessions.replaceAll([]);
              reset();
              showToast('Dados apagados');
              // Sem preferências, o app volta a ser uma primeira abertura.
              router.replace('/onboarding');
            });
          },
        },
      ],
    );
  }, [tasks, habits, blocks, events, sessions, reset, showToast, router]);

  return (
    <Screen bottomInset={spacing.section}>
      <ProfileIdentity preferences={preferences} onEdit={() => setSheetOpen(true)} />

      <SectionHeader title="Foco" style={styles.sectionHeader} />

      <ListRow
        title="Áreas de foco"
        subtitle={
          preferences.focusAreas.length === 0
            ? 'Nenhuma escolhida'
            : preferences.focusAreas.join(', ')
        }
        onPress={() => router.navigate('/onboarding')}
        leading={<Icon name="target" size={20} strokeWidth={1.6} color={colors.textMuted} />}
        trailing={<Icon name="chevronRight" size={16} strokeWidth={1.6} color={colors.textDim} />}
      />

      <ListRow
        title="Duração padrão da sessão"
        subtitle="Usada quando não há bloco planejado"
        onPress={() => setSheetOpen(true)}
        leading={<Icon name="stopwatch" size={20} strokeWidth={1.6} color={colors.textMuted} />}
        trailing={
          <AppText variant="caption" color="textDim">
            {preferences.sessionMinutes} min
          </AppText>
        }
      />

      <ListRow
        title="Hábitos"
        subtitle="Criar, pausar e remover"
        onPress={() => router.navigate('/habits')}
        leading={<Icon name="check" size={20} strokeWidth={1.6} color={colors.textMuted} />}
        trailing={<Icon name="chevronRight" size={16} strokeWidth={1.6} color={colors.textDim} />}
      />

      <Card style={styles.card}>
        <AppText variant="bodyStrong">Nível de intervenção</AppText>
        <AppText variant="caption" color="textDim" style={styles.cardNote}>
          Define o tom dos avisos durante uma sessão de foco.
        </AppText>
        <View style={styles.segmented}>
          <SegmentedControl
            options={INTERVENTION_LEVELS}
            value={preferences.interventionLevel}
            onChange={setInterventionLevel}
          />
        </View>
      </Card>

      <SectionHeader title="Seus dados" style={styles.sectionHeaderSpaced} />

      <Card>
        <AppText variant="supporting" color="textMuted">
          Tudo o que você cria fica guardado só neste aparelho. O StayOn não envia nada para
          servidor nenhum e funciona sem internet.
        </AppText>
      </Card>

      <ListRow
        title="Apagar todos os dados"
        subtitle="Deixa o aplicativo vazio, como na primeira abertura"
        onPress={handleReset}
        leading={<Icon name="trash" size={20} strokeWidth={1.6} color={colors.danger} />}
        style={styles.destructive}
      />

      <SectionHeader title="Sobre" style={styles.sectionHeaderSpaced} />

      <Card>
        <View style={styles.aboutRow}>
          <AppText variant="body" color="textMuted">
            Preço
          </AppText>
          <AppText variant="bodyStrong" color="success">
            Gratuito
          </AppText>
        </View>
        <View style={styles.aboutRow}>
          <AppText variant="body" color="textMuted">
            Conta
          </AppText>
          <AppText variant="bodyStrong">Não precisa</AppText>
        </View>
        <View style={styles.aboutRow}>
          <AppText variant="body" color="textMuted">
            Versão
          </AppText>
          <AppText variant="bodyStrong">1.0.0</AppText>
        </View>
      </Card>

      <ProfileSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    marginBottom: spacing.md,
  },
  sectionHeaderSpaced: {
    marginTop: spacing.section,
    marginBottom: spacing.xxl,
  },
  card: {
    marginTop: spacing.xxl,
  },
  cardNote: {
    marginTop: spacing.xxs,
  },
  segmented: {
    marginTop: spacing.xxl,
  },
  destructive: {
    marginTop: spacing.md,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
});
