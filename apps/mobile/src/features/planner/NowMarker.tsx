import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components';
import { colors, radius, spacing } from '@/theme';

type NowMarkerProps = {
  time: string;
};

/** Linha horizontal que marca o horário atual na linha do tempo. */
export function NowMarker({ time }: NowMarkerProps) {
  return (
    <View style={styles.row} accessibilityLabel={`Agora, ${time}`}>
      <AppText variant="captionStrong" style={styles.time}>
        {time}
      </AppText>
      <View style={styles.dot} />
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  time: {
    width: 42,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.fillLight,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.fillLight,
  },
});
