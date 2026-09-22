import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components';
import { Icon, type IconName } from '@/icons';
import { colors, motion, radius, spacing } from '@/theme';

type SessionControlsProps = {
  running: boolean;
  onToggleRunning: () => void;
  onExtend: () => void;
  onFinish: () => void;
};

/** Pausar, encerrar e estender — a barra de controles da sessão. */
export function SessionControls({
  running,
  onToggleRunning,
  onExtend,
  onFinish,
}: SessionControlsProps) {
  return (
    <View style={styles.row}>
      <RoundButton
        name={running ? 'pause' : 'play'}
        label={running ? 'Pausar sessão' : 'Retomar sessão'}
        onPress={onToggleRunning}
      />

      <Button
        label="Encerrar sessão"
        onPress={onFinish}
        style={styles.finish}
        trailing={<Icon name="stop" size={15} strokeWidth={1.8} color={colors.onLight} />}
      />

      <RoundButton name="timerPlus" label="Estender a sessão" onPress={onExtend} />
    </View>
  );
}

function RoundButton({
  name,
  label,
  onPress,
}: {
  name: IconName;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.round, pressed && styles.pressed]}
    >
      <Icon name={name} size={20} strokeWidth={1.7} color={colors.textMuted} />
    </Pressable>
  );
}

const ROUND_SIZE = 52;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxl,
  },
  round: {
    width: ROUND_SIZE,
    height: ROUND_SIZE,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finish: {
    flex: 1,
  },
  pressed: {
    opacity: motion.pressedOpacity,
  },
});
