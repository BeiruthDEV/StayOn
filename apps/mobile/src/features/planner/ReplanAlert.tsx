import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components';
import type { TimeBlock } from '@/domain/timeBlock';
import { Icon } from '@/icons';
import { colors, motion, radius, spacing } from '@/theme';

type ReplanAlertProps = {
  block: TimeBlock;
  suggestedTime: string;
  onReplan: () => void;
};

/** Aviso de bloco perdido com a sugestão de novo horário. */
export function ReplanAlert({ block, suggestedTime, onReplan }: ReplanAlertProps) {
  return (
    <View style={styles.card}>
      <View style={styles.message}>
        <Icon name="info" size={20} strokeWidth={1.6} color={colors.danger} />
        <AppText variant="supporting" color="danger" style={styles.text}>
          Você perdeu o bloco de {block.title.toLowerCase()} das {block.start}. Mover para{' '}
          {suggestedTime}?
        </AppText>
      </View>

      <Pressable
        onPress={onReplan}
        accessibilityRole="button"
        style={({ pressed }) => [styles.action, pressed && styles.pressed]}
      >
        <AppText variant="captionStrong" color="onLight">
          Replanejar
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.xxl,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    backgroundColor: colors.dangerSurface,
    marginBottom: spacing.section,
  },
  message: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  text: {
    flex: 1,
  },
  action: {
    alignSelf: 'flex-end',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.section,
    paddingVertical: spacing.lg,
    borderRadius: radius.sm,
    backgroundColor: colors.dangerFill,
  },
  pressed: {
    opacity: motion.pressedOpacity,
  },
});
