import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Chip } from '@/components';
import type { CalendarEvent } from '@/domain/event';
import { Icon } from '@/icons';
import { colors, motion, radius, spacing } from '@/theme';

type EventRowProps = {
  event: CalendarEvent;
  onPress: (event: CalendarEvent) => void;
};

/** Linha da lista de próximos compromissos. */
export function EventRow({ event, onPress }: EventRowProps) {
  return (
    <Pressable
      onPress={() => onPress(event)}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.badge}>
        <Icon name={event.icon} size={19} strokeWidth={1.6} color={colors.textMuted} />
      </View>

      <View style={styles.content}>
        <AppText variant="bodyStrong" numberOfLines={1}>
          {event.title}
        </AppText>
        <AppText variant="caption" color="textDim" style={styles.meta}>
          {event.meta ? `${event.dateLabel} · ${event.meta}` : event.dateLabel}
        </AppText>
        <Chip label={event.countdown} tone="outline" style={styles.countdown} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.xl,
    paddingVertical: spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  meta: {
    marginTop: spacing.xs,
  },
  countdown: {
    marginTop: spacing.lg,
  },
  pressed: {
    opacity: motion.pressedOpacity,
  },
});
