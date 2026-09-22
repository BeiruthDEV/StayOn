import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Chip } from '@/components';
import { scheduleLabel, type TimeBlock } from '@/domain/timeBlock';
import { Icon } from '@/icons';
import { colors, motion, radius, spacing } from '@/theme';

type TimelineBlockProps = {
  block: TimeBlock;
  onPress: (block: TimeBlock) => void;
};

/** Cartão de um bloco da agenda, com a barra de status à esquerda. */
export function TimelineBlock({ block, onPress }: TimelineBlockProps) {
  const missed = block.status === 'missed';
  const done = block.status === 'done';

  return (
    <View style={styles.row}>
      <AppText variant="caption" color="textDim" style={styles.time}>
        {block.start}
      </AppText>

      <Pressable
        onPress={() => onPress(block)}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.card,
          missed && styles.cardMissed,
          done && styles.cardDone,
          pressed && styles.pressed,
        ]}
      >
        <View style={[styles.accent, missed && styles.accentMissed, done && styles.accentDone]} />
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Icon
              name={block.icon}
              size={17}
              strokeWidth={1.6}
              color={missed ? colors.danger : colors.textDim}
            />
            <AppText
              variant="bodyStrong"
              color={done ? 'textMuted' : 'text'}
              numberOfLines={1}
              style={missed && styles.missedTitle}
            >
              {block.title}
            </AppText>
          </View>

          <AppText variant="caption" color={missed ? 'danger' : 'textDim'} style={styles.schedule}>
            {missed ? `${block.start} – ${block.end} · Perdido` : scheduleLabel(block)}
          </AppText>

          <Chip label={block.tag} tone={missed ? 'danger' : 'neutral'} style={styles.tag} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xl,
    marginBottom: spacing.xxl,
  },
  time: {
    width: 42,
    paddingTop: spacing.xl,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  cardMissed: {
    borderColor: colors.dangerBorder,
    backgroundColor: colors.dangerSurface,
  },
  cardDone: {
    backgroundColor: colors.background,
  },
  accent: {
    width: 3,
    backgroundColor: colors.fillLight,
  },
  accentMissed: {
    backgroundColor: colors.dangerFill,
  },
  accentDone: {
    backgroundColor: colors.borderStrong,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xl,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  missedTitle: {
    textDecorationLine: 'line-through',
  },
  schedule: {
    marginTop: spacing.xs,
  },
  tag: {
    marginTop: spacing.lg,
  },
  pressed: {
    opacity: motion.pressedOpacity,
  },
});
