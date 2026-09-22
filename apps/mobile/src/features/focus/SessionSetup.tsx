import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Button, Card, OptionPicker, TextField } from '@/components';
import { scheduleLabel, type TimeBlock } from '@/domain/timeBlock';
import { Icon } from '@/icons';
import { colors, motion, spacing } from '@/theme';

/** Durações oferecidas de atalho. */
const DURATIONS = ['15', '25', '45', '60'] as const;

type SessionSetupProps = {
  label: string;
  onChangeLabel: (label: string) => void;
  minutes: string;
  onChangeMinutes: (minutes: string) => void;
  /** Mensagem de erro do campo de duração. */
  error?: string | undefined;
  /** Próximo bloco da agenda, oferecido como atalho. */
  block?: TimeBlock | undefined;
  onUseBlock: (block: TimeBlock) => void;
  onStart: () => void;
  /** Sessões já registradas hoje. */
  todayCount: number;
};

/** Passo anterior ao cronômetro: escolher o que focar e por quanto tempo. */
export function SessionSetup({
  label,
  onChangeLabel,
  minutes,
  onChangeMinutes,
  error,
  block,
  onUseBlock,
  onStart,
  todayCount,
}: SessionSetupProps) {
  return (
    <>
      <AppText variant="display" style={styles.title}>
        Nova sessão
      </AppText>
      <AppText variant="supporting" color="textMuted" style={styles.subtitle}>
        {todayCount === 0
          ? 'Nenhuma sessão hoje ainda.'
          : `${todayCount} ${todayCount === 1 ? 'sessão registrada' : 'sessões registradas'} hoje.`}
      </AppText>

      <TextField
        label="No que você vai focar"
        value={label}
        onChangeText={onChangeLabel}
        placeholder="Estudar Spring Boot"
        maxLength={60}
      />

      <OptionPicker
        label="Duração"
        options={DURATIONS.map((value) => ({ value, label: `${value} min` }))}
        value={minutes}
        onChange={onChangeMinutes}
      />

      <TextField
        label="Ou outro tempo, em minutos"
        value={minutes}
        onChangeText={onChangeMinutes}
        placeholder="45"
        error={error}
        keyboardType="number-pad"
        maxLength={3}
      />

      <Button
        label="Começar sessão"
        onPress={onStart}
        trailing={<Icon name="play" size={16} strokeWidth={1.8} color={colors.onLight} />}
      />

      {block ? (
        <View style={styles.blockArea}>
          <AppText variant="overlineSmall" color="textDim" style={styles.blockTitle}>
            Próximo bloco da agenda
          </AppText>

          <Pressable
            onPress={() => onUseBlock(block)}
            accessibilityRole="button"
            style={({ pressed }) => pressed && styles.pressed}
          >
            <Card>
              <View style={styles.blockRow}>
                <Icon name={block.icon} size={20} strokeWidth={1.6} color={colors.textMuted} />
                <View style={styles.blockText}>
                  <AppText variant="bodyStrong" numberOfLines={1}>
                    {block.title}
                  </AppText>
                  <AppText variant="caption" color="textDim">
                    {scheduleLabel(block)}
                  </AppText>
                </View>
                <Icon name="arrowRight" size={18} strokeWidth={1.6} color={colors.textDim} />
              </View>
            </Card>
          </Pressable>
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.section,
  },
  blockArea: {
    marginTop: spacing.section,
  },
  blockTitle: {
    marginBottom: spacing.lg,
  },
  blockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  blockText: {
    flex: 1,
    minWidth: 0,
  },
  pressed: {
    opacity: motion.pressedOpacity,
  },
});
