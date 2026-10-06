import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Chip, ProgressRing, Screen, StatTile } from '@/components';
import { todayIso } from '@/domain/clock';
import { elapsedPercent, formatRemaining } from '@/domain/focusSession';
import { sessionsOn } from '@/domain/session';
import { durationOf, nextBlock, type TimeBlock } from '@/domain/timeBlock';
import { durationLabel } from '@/domain/usage';
import { Icon } from '@/icons';
import { useBlockedApps, useBlocks, usePreferences, useSessions, useToast } from '@/state';
import { colors, motion, spacing } from '@/theme';

import { SessionControls } from './SessionControls';
import { SessionSetup } from './SessionSetup';
import { useFocusSession } from './useFocusSession';

/** Tela Foco: monta a sessão, roda o cronômetro e grava no histórico. */
export function FocusScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { blocks, setStatus } = useBlocks();
  const { sessions, record } = useSessions();
  const { preferences } = usePreferences();
  const blocked = useBlockedApps();

  const session = useFocusSession();

  // O bloqueio acompanha o estado da sessão em vez de ser ligado e desligado
  // em cada ação: assim começar, pausar, retomar, estender e encerrar ficam
  // cobertos por um caminho só, sem risco de alguma ação esquecer de avisar.
  const { startBlocking, stopBlocking } = blocked;
  useEffect(() => {
    if (!session.hydrated) return;

    if (session.status === 'running' && session.endsAt > 0) {
      startBlocking(session.endsAt);
    } else {
      stopBlocking();
    }
  }, [session.hydrated, session.status, session.endsAt, startBlocking, stopBlocking]);

  const suggested = useMemo(() => nextBlock(blocks), [blocks]);
  const todaySessions = useMemo(() => sessionsOn(sessions, todayIso()), [sessions]);

  const [label, setLabel] = useState('');
  const [minutes, setMinutes] = useState(String(preferences.sessionMinutes));
  const [error, setError] = useState<string | undefined>(undefined);

  /** Rótulo da sessão salva; o campo do formulário só vale antes de começar. */
  const runningLabel = session.label === '' ? 'Sessão livre' : session.label;

  const handleStart = useCallback(() => {
    const parsed = Number(minutes);

    if (!Number.isFinite(parsed) || parsed < 1 || parsed > 180) {
      setError('Escolha entre 1 e 180 minutos');
      return;
    }

    if (blocked.packages.length > 0 && !blocked.hasPermission()) {
      showToast('Sem a permissão de acessibilidade, nada será bloqueado');
    }

    setError(undefined);
    session.start(parsed, label.trim() === '' ? 'Sessão livre' : label.trim());
  }, [minutes, label, session, blocked, showToast]);

  const handleUseBlock = useCallback(
    (block: TimeBlock) => {
      setLabel(block.title);
      setMinutes(String(durationOf(block)));
      setError(undefined);
      session.start(durationOf(block), block.title, block.id);
    },
    [session],
  );

  const finish = useCallback(() => {
    record(runningLabel, session.elapsed, 'completed');
    if (session.blockId !== undefined) setStatus(session.blockId, 'done');
    showToast(`Sessão registrada: ${durationLabel(session.elapsed)}`);
    session.stop();
  }, [record, runningLabel, session, setStatus, showToast]);

  const abandon = useCallback(() => {
    if (session.elapsed > 0) {
      record(runningLabel, session.elapsed, 'abandoned');
      showToast(`Sessão abandonada aos ${durationLabel(session.elapsed)}`);
    } else {
      showToast('Sessão cancelada');
    }
    session.stop();
  }, [session, record, runningLabel, showToast]);

  // Enquanto a sessão salva não chega do disco, qualquer tela seria a errada.
  if (!session.hydrated) return <Screen scroll={false}>{null}</Screen>;

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
          blockedCount={blocked.packages.length}
          onOpenBlocked={
            blocked.available ? () => router.navigate('/blocked-apps') : undefined
          }
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
