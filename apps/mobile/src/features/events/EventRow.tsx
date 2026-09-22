import { StyleSheet, View } from 'react-native';

import { AppText, Chip, IconButton } from '@/components';
import type { CalendarEvent } from '@/domain/event';
import { Icon } from '@/icons';
import { colors, radius, spacing } from '@/theme';

type EventRowProps = {
  event: CalendarEvent;
  onRemove: () => void;
};

/** Linha da lista de compromissos, com remoção à direita. */
export function EventRow({ event, onRemove }: EventRowProps) {
  return (
    <View style={styles.row}>
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

      <IconButton
        name="trash"
        size={18}
        onPress={onRemove}
        accessibilityLabel={`Remover ${event.title}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
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
});
