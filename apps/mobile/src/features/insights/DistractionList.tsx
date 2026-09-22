import { StyleSheet, View } from 'react-native';

import { AppText, Card, IconButton } from '@/components';
import { minutesLabel, type Distraction } from '@/domain/usage';
import { Icon } from '@/icons';
import { colors, radius, spacing } from '@/theme';

type DistractionListProps = {
  distractions: readonly Distraction[];
  blockedAttempts: number;
  onManage: (distraction: Distraction) => void;
};

/** Aplicativos que mais consumiram tempo, com o recorte dentro dos blocos de foco. */
export function DistractionList({
  distractions,
  blockedAttempts,
  onManage,
}: DistractionListProps) {
  return (
    <Card>
      <View style={styles.header}>
        <AppText variant="sectionTitle">Principais distrações</AppText>
        <View style={styles.blocked}>
          <Icon name="ban" size={15} strokeWidth={1.6} color={colors.textDim} />
          <AppText variant="caption" color="textDim">
            {blockedAttempts} bloqueadas
          </AppText>
        </View>
      </View>

      {distractions.map((distraction, index) => (
        <View
          key={distraction.id}
          style={[styles.row, index === distractions.length - 1 && styles.lastRow]}
        >
          <View style={styles.badge}>
            <Icon name={distraction.icon} size={18} strokeWidth={1.6} color={colors.textMuted} />
          </View>

          <View style={styles.content}>
            <AppText variant="bodyStrong" numberOfLines={1}>
              {distraction.name}
            </AppText>
            <AppText variant="caption" color="textDim">
              {minutesLabel(distraction.totalMinutes)} no total
            </AppText>
          </View>

          <AppText
            variant="caption"
            color={distraction.duringFocusMinutes > 0 ? 'danger' : 'textDim'}
          >
            {minutesLabel(distraction.duringFocusMinutes)} em foco
          </AppText>

          <IconButton
            name="dots"
            size={18}
            onPress={() => onManage(distraction)}
            accessibilityLabel={`Opções de ${distraction.name}`}
          />
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  blocked: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  lastRow: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
});
