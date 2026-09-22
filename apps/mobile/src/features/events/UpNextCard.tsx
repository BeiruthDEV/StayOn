import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Card, Chip } from '@/components';
import { upNextEvent } from '@/data/events';
import { Icon } from '@/icons';
import { colors, motion, radius, spacing } from '@/theme';

type UpNextCardProps = {
  onJoin: () => void;
  onDetails: () => void;
};

/** Destaque do próximo compromisso com as ações de entrar e ver detalhes. */
export function UpNextCard({ onJoin, onDetails }: UpNextCardProps) {
  return (
    <Card>
      <View style={styles.header}>
        <Chip label="A seguir" />
        <AppText variant="caption" color="textDim">
          {upNextEvent.when}
        </AppText>
      </View>

      <AppText variant="title" style={styles.title}>
        {upNextEvent.title}
      </AppText>

      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <Icon name="clock" size={15} strokeWidth={1.6} color={colors.textDim} />
          <AppText variant="caption" color="textMuted">
            {upNextEvent.timeRange}
          </AppText>
        </View>
        <View style={styles.metaItem}>
          <Icon name="video" size={15} strokeWidth={1.6} color={colors.textDim} />
          <AppText variant="caption" color="textMuted">
            {upNextEvent.place}
          </AppText>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={onJoin}
          accessibilityRole="button"
          style={({ pressed }) => [styles.join, pressed && styles.pressed]}
        >
          <AppText variant="captionMedium">Abrir link</AppText>
        </Pressable>
        <Pressable
          onPress={onDetails}
          accessibilityRole="button"
          style={({ pressed }) => [styles.details, pressed && styles.pressed]}
        >
          <AppText variant="captionMedium" color="textMuted">
            Ver detalhes
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
  details: {
    paddingVertical: spacing.lg,
  },
  pressed: {
    opacity: motion.pressedOpacity,
  },
});
