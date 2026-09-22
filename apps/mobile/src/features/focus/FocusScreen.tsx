import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Chip, ProgressRing, Screen, StatTile } from '@/components';
import { todayIso } from '@/domain/clock';
import { elapsedPercent, formatRemaining } from '@/domain/focusSession';
import { sessionsOn } from '@/domain/session';
import { durationLabel } from '@/domain/usage';
import { durationOf, nextBlock } from '@/domain/timeBlock';
import { Icon } from '@/icons';
import { useBlocks, usePreferences, useSessions, useToast } from '@/state';
import { colors, motion, spacing } from '@/theme';

import { SessionControls } from './SessionControls';
import { useFocusSession } from './useFocusSession';

/** Tela Foco: sessão imersiva com contador regressivo e registro no histórico. */
export function FocusScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { blocks, setStatus } = useBlocks();
  const { sessions, record } = useSessions();
  const { preferences } = usePreferences();

  const block = useMemo(() => nextBlock(blocks), [blocks]);
  const minutes = block ? durationOf(block) : preferences.sessionMinutes;
  const label = block ? block.title : 'Sessão livre';

  const session = useFocusSession(minutes);
  const finished = session.remaining === 0;

  const todaySessions = useMemo(() => sessionsOn(sessions, todayIso()), [sessions]);

  const finish = useCallback(() => {
    if (session.elapsed === 0) {
      showToast('A sessão nem começou');
      return;
    }

    record(label, session.elapsed, 'completed');
    if (block) setStatus(block.id, 'done');
    showToast(`Sessão registrada: ${durationLabel(session.elapsed)}`);
    // Continua na aba: o cronômetro volta ao início para a próxima sessão.
    session.reset();
  }, [session, record, label, block, setStatus, showToast]);

  const abandon = useCallback(() => {
    // Abandonar sem ter focado nada não vira registro.
    if (session.elapsed > 0) {
      record(label, session.elapsed, 'abandoned');
      showToast(`Sessão abandonada aos ${durationLabel(session.elapsed)}`);
    } else {
      showToast('Sessão abandonada');
    }
    session.reset();
    router.navigate('/');
  }, [session, record, label, showToast, router]);

  return (
    <Screen scroll={false} contentStyle={styles.content}>
      <View style={styles.topBar}>
        <Pressable
          onPress={abandon}
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
          label={block ? block.tag : `${preferences.interventionLevel} · ${minutes} min`}
          leading={<Icon name="check" size={13} strokeWidth={2} color={colors.textMuted} />}
          style={styles.blockChip}
        />
        <AppText variant="display" style={styles.goal}>
          {label}
        </AppText>
      </View>

      <View style={styles.ring}>
        <ProgressRing percent={elapsedPercent(session.total, session.remaining)}>
          <AppText variant="display" style={styles.countdown}>
            {formatRemaining(session.remaining)}
          </AppText>
          <AppText variant="caption" color="textDim">
            {finished ? 'Tempo esgotado' : 'Restante'}
          </AppText>
        </ProgressRing>
      </View>

      <SessionControls
        running={session.running}
        onToggleRunning={session.toggleRunning}
        onExtend={session.extend}
        onFinish={finish}
      />

      <View style={styles.stats}>
        <StatTile label="Interrupções" value={String(session.pauses)} />
        <StatTile
          label="Sessões hoje"
          value={String(todaySessions.length)}
          unit={todaySessions.length === 1 ? 'registro' : 'registros'}
        />
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
