import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Chip, ProgressRing, Screen, StatTile } from '@/components';
import { blockedAttempts, defaultSessionMinutes, interruptionCount, sessionGoal } from '@/data/focus';
import { elapsedPercent, formatRemaining } from '@/domain/focusSession';
import { durationOf } from '@/domain/timeBlock';
import { Icon } from '@/icons';
import { useBlocks, useToast } from '@/state';
import { colors, motion, spacing } from '@/theme';

import { SessionControls } from './SessionControls';
import { useFocusSession } from './useFocusSession';

/** Tela Foco: sessão imersiva com contador regressivo e controles. */
export function FocusScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { blocks } = useBlocks();

  const block = useMemo(() => blocks.find((item) => item.status === 'upcoming'), [blocks]);
  const minutes = block ? durationOf(block) : defaultSessionMinutes;

  const session = useFocusSession(minutes);
  const finished = session.remaining === 0;

  const leave = useCallback(
    (message: string) => {
      showToast(message);
      router.navigate('/');
    },
    [router, showToast],
  );

  return (
    <Screen scroll={false} contentStyle={styles.content}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => leave('Sessão abandonada')}
          accessibilityRole="button"
          style={({ pressed }) => [styles.abandon, pressed && styles.pressed]}
        >
          <Icon name="close" size={20} strokeWidth={1.8} color={colors.text} />
          <AppText variant="bodyStrong">Abandonar</AppText>
        </Pressable>

        <Chip
          label={session.running ? 'Foco profundo ativo' : 'Sessão pausada'}
          tone="outline"
          leading={
            <Icon
              name={session.running ? 'focus' : 'pause'}
              size={14}
              strokeWidth={1.7}
              color={colors.textDim}
            />
          }
        />
      </View>

      <View style={styles.header}>
        <Chip
          label={block ? block.title : 'Sessão livre'}
          leading={<Icon name="check" size={13} strokeWidth={2} color={colors.textMuted} />}
          style={styles.blockChip}
        />
        <AppText variant="display" style={styles.goal}>
          {sessionGoal}
        </AppText>
      </View>

      <View style={styles.ring}>
        <ProgressRing percent={elapsedPercent(session.total, session.remaining)}>
          <AppText variant="display" style={styles.countdown}>
            {formatRemaining(session.remaining)}
          </AppText>
          <AppText variant="caption" color="textDim">
            {finished ? 'Sessão concluída' : 'Restante'}
          </AppText>
        </ProgressRing>
      </View>

      <SessionControls
        running={session.running}
        onToggleRunning={session.toggleRunning}
        onExtend={session.extend}
        onFinish={() => leave('Sessão encerrada')}
      />

      <View style={styles.stats}>
        <StatTile label="Interrupções" value={String(interruptionCount)} />
        <StatTile label="Apps bloqueados" value={String(blockedAttempts)} unit="tentativas" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'space-between',
    paddingBottom: spacing.section,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  abandon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  header: {
    alignItems: 'center',
  },
  blockChip: {
    alignSelf: 'center',
  },
  goal: {
    marginTop: spacing.xl,
    textAlign: 'center',
  },
  ring: {
    alignItems: 'center',
  },
  countdown: {
    fontSize: 46,
    letterSpacing: -1,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  pressed: {
    opacity: motion.pressedOpacity,
  },
});
