import { StyleSheet, View } from 'react-native';

import { AppText, Card, Progress } from '@/components';
import { peakMinutes } from '@/domain/session';
import { minutesLabel } from '@/domain/usage';
import { spacing } from '@/theme';

type TimeByAreaListProps = {
  /** Minutos por tarefa ou bloco, do maior para o menor. */
  entries: readonly { label: string; minutes: number }[];
};

/** Onde o tempo de foco foi parar, somado por tarefa ou bloco. */
export function TimeByAreaList({ entries }: TimeByAreaListProps) {
  const peak = peakMinutes(entries);
  const top = entries.slice(0, 5);

  return (
    <Card>
      <AppText variant="sectionTitle" style={styles.title}>
        Onde seu foco foi
      </AppText>

      {top.length === 0 ? (
        <AppText variant="supporting" color="textDim">
          Ainda não há sessões suficientes para montar esta lista.
        </AppText>
      ) : (
        top.map((entry) => (
          <View key={entry.label} style={styles.row}>
            <View style={styles.labels}>
              <AppText variant="bodyStrong" numberOfLines={1} style={styles.name}>
                {entry.label}
              </AppText>
              <AppText variant="caption" color="textDim">
                {minutesLabel(entry.minutes)}
              </AppText>
            </View>
            <View style={styles.bar}>
              <Progress percent={peak === 0 ? 0 : (100 * entry.minutes) / peak} />
            </View>
          </View>
        ))
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: spacing.xxl,
  },
  row: {
    marginBottom: spacing.xxl,
  },
  labels: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.xxl,
    marginBottom: spacing.md,
  },
  name: {
    flex: 1,
    minWidth: 0,
  },
  bar: {
    flexDirection: 'row',
  },
});
