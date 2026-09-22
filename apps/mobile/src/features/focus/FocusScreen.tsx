import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Chip, ProgressRing, Screen, StatTile } from '@/components';
import { todayIso } from '@/domain/clock';
import { elapsedPercent, formatRemaining } from '@/domain/focusSession';
import { sessionsOn } from '@/domain/session';
import { durationOf, nextBlock, type TimeBlock } from '@/domain/timeBlock';
import { durationLabel } from '@/domain/usage';
import { Icon } from '@/icons';
import { useBlocks, usePreferences, useSessions, useToast } from '@/state';
import { colors, motion, spacing } from '@/theme';

import { SessionControls } from './SessionControls';
import { SessionSetup } from './SessionSetup';
import { useFocusSession } from './useFocusSession';

/** Tela Foco: monta a sessão, roda o cronômetro e grava no histórico. */
export function FocusScreen() {
  const { showToast } = useToast();
  const { blocks, setStatus } = useBlocks();
  const { sessions, record } = useSessions();
  const { preferences } = usePreferences();

  const session = useFocusSession();

  const suggested = useMemo(() => nextBlock(blocks), [blocks]);
  const todaySessions = useMemo(() => sessionsOn(sessions, todayIso()), [sessions]);

  const [label, setLabel] = useState('');
  const [minutes, setMinutes] = useState(String(preferences.sessionMinutes));
  const [error, setError] = useState<string | undefined>(undefined);
  /** Bloco vinculado à sessão em andamento, para marcar como concluído no fim. */
  const [linkedBlock, setLinkedBlock] = useState<TimeBlock | undefined>(undefined);

  const runningLabel = label.trim() === '' ? 'Sessão livre' : label.trim();

  const handleStart = useCallback(() => {
    const parsed = Number(minutes);

    if (!Number.isFinite(parsed) || parsed < 1 || parsed > 180) {
      setError('Escolha entre 1 e 180 minutos');
      return;
    }

    setError(undefined);
    setLinkedBlock(undefined);
    session.start(parsed);
  }, [minutes, session]);

  const handleUseBlock = useCallback(
    (block: TimeBlock) => {
      setLabel(block.title);
      setMinutes(String(durationOf(block)));
      setError(undefined);
      setLinkedBlock(block);
      session.start(durationOf(block));
    },
    [session],
  );

  const finish = useCallback(() => {
    record(runningLabel, session.elapsed, 'completed');
    if (linkedBlock) setStatus(linkedBlock.id, 'done');
    showToast(`Sessão registrada: ${durationLabel(session.elapsed)}`);
    session.stop();
  }, [record, runningLabel, session, linkedBlock, setStatus, showToast]);

  const abandon = useCallback(() => {
    if (session.elapsed > 0) {
      record(runningLabel, session.elapsed, 'abandoned');
      showToast(`Sessão abandonada aos ${durationLabel(session.elapsed)}`);
    } else {
      showToast('Sessão cancelada');
    }
    session.stop();
  }, [session, record, runningLabel, showToast]);

  if (session.status === 'idle') {
    return (
      <Screen bottomInset={spacing.section}>
        <SessionSetup
          label={label}
          onChangeLabel={setLabel}
          minutes={minutes}
          onChangeMinutes={(value) => {
            setMinutes(value);
            setError(undefined);
          }}
          error={error}
          block={suggested}
          onUseBlock={handleUseBlock}
          onStart={handleStart}
          todayCount={todaySessions.length}
        />
      </Screen>
    );
  }

  const running = session.status === 'running';
  const finished = session.remaining === 0;

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
          label={running ? 'Foco profundo ativo' : 'Sessão pausada'}
          tone="outline"
          leading={
            <Icon
              name={running ? 'focus' : 'pause'}
              size={14}
              strokeWidth={1.7}
              color={colors.textDim}
            />
          }
        />
      </View>

      <View style={styles.header}>
        <Chip
          label={`${preferences.interventionLevel} · ${Math.round(session.total / 60)} min`}
          leading={<Icon name="check" size={13} strokeWidth={2} color={colors.textMuted} />}
          style={styles.blockChip}
        />
        <AppText variant="display" style={styles.goal}>
          {runningLabel}
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
        running={running}
        onToggleRunning={session.togglePause}
        onExtend={session.extend}
        onFinish={finish}
      />

      <View style={styles.stats}>
        <StatTile label="Interrupções" value={String(session.pauses)} />
        <StatTile
          label="Focado até agora"
          value={durationLabel(session.elapsed)}
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
