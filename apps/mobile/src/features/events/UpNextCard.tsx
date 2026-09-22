import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Card, Chip } from '@/components';
import type { CalendarEvent } from '@/domain/event';
import { Icon } from '@/icons';
import { colors, motion, radius, spacing } from '@/theme';

type UpNextCardProps = {
  event: CalendarEvent;
  onRemove: () => void;
};

/** Destaque do compromisso mais próximo. */
export function UpNextCard({ event, onRemove }: UpNextCardProps) {
  return (
    <Card>
      <View style={styles.header}>
        <Chip label="A seguir" />
        <AppText variant="caption" color="textDim">
          {event.countdown}
        </AppText>
      </View>

      <AppText variant="title" style={styles.title}>
        {event.title}
      </AppText>

      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <Icon name="calendar" size={15} strokeWidth={1.6} color={colors.textDim} />
          <AppText variant="caption" color="textMuted">
            {event.dateLabel}
          </AppText>
        </View>
        {event.meta ? (
          <View style={styles.metaItem}>
            <Icon name="mapPin" size={15} strokeWidth={1.6} color={colors.textDim} />
            <AppText variant="caption" color="textMuted">
              {event.meta}
            </AppText>
          </View>
        ) : null}
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={onRemove}
          accessibilityRole="button"
          style={({ pressed }) => [styles.join, pressed && styles.pressed]}
        >
          <AppText variant="captionMedium" color="textMuted">
            Remover
          </AppText>
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    marginTop: spacing.xl,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xxl,
    marginTop: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxl,
    marginTop: spacing.section,
  },
  join: {
    paddingHorizontal: spacing.section,
    paddingVertical: spacing.lg,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceRaised,
  },
  pressed: {
    opacity: motion.pressedOpacity,
  },
});
