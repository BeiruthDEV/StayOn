import { StyleSheet } from 'react-native';

import { AppText, ListRow } from '@/components';
import type { UpcomingEvent } from '@/data/home';
import { Icon } from '@/icons';
import { colors } from '@/theme';

type UpcomingEventRowProps = {
  event: UpcomingEvent;
  onPress: () => void;
};

/** Linha do próximo compromisso importante, com contagem regressiva. */
export function UpcomingEventRow({ event, onPress }: UpcomingEventRowProps) {
  return (
    <ListRow
      title={event.title}
      subtitle={event.schedule}
      onPress={onPress}
      style={styles.row}
      leading={<Icon name="calendar" size={20} color={colors.textMuted} />}
      trailing={<AppText variant="captionStrong">{event.countdown}</AppText>}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    paddingTop: 18,
  },
});
