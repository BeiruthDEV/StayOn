import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components';
import { connections, type Connection } from '@/data/profile';
import { Icon } from '@/icons';
import { colors, motion, radius, spacing } from '@/theme';

type ConnectionGridProps = {
  onPress: (connection: Connection) => void;
};

/** Grade das integrações, com o estado de cada uma. */
export function ConnectionGrid({ onPress }: ConnectionGridProps) {
  return (
    <View style={styles.grid}>
      {connections.map((connection) => {
        const connected = connection.status === 'connected';

        return (
          <Pressable
            key={connection.id}
            onPress={() => onPress(connection)}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.tile,
              !connected && styles.tileAvailable,
              pressed && styles.pressed,
            ]}
          >
            <Icon
              name={connection.icon}
              size={22}
              strokeWidth={1.6}
              color={connected ? colors.text : colors.textDim}
            />
            <AppText variant="bodyStrong" color={connected ? 'text' : 'textMuted'}>
              {connection.name}
            </AppText>
            <AppText variant="overlineSmall" color={connected ? 'success' : 'textDim'}>
              {connection.statusLabel}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xl,
  },
  tile: {
    flexBasis: '47%',
    flexGrow: 1,
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.section,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tileAvailable: {
    backgroundColor: colors.transparent,
  },
  pressed: {
    opacity: motion.pressedOpacity,
  },
});
