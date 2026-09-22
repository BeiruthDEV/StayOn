import { StyleSheet, View } from 'react-native';

import { AppText, Progress } from '@/components';
import type { DayProgress } from '@/domain/dayProgress';

type DayProgressBarProps = {
  progress: DayProgress;
};

/** Linha "Hoje · barra · X de Y" logo abaixo do cartão de próxima ação. */
export function DayProgressBar({ progress }: DayProgressBarProps) {
  return (
    <View style={styles.row}>
      <AppText variant="caption" color="textMuted">
        Hoje
      </AppText>
      <Progress percent={progress.percent} />
      <AppText variant="captionStrong">{progress.label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingTop: 18,
    paddingBottom: 6,
    paddingHorizontal: 2,
  },
});
