import { StyleSheet, View } from 'react-native';

import { AppText, Card } from '@/components';
import { Icon, type IconName } from '@/icons';
import { colors, spacing } from '@/theme';

type MetricCardProps = {
  title: string;
  icon: IconName;
  value: string;
  /** Complemento à direita do valor, ex.: "%" ou "h". */
  unit?: string;
  /** Texto de apoio abaixo do valor. */
  note?: string;
  /** Conteúdo extra no rodapé, como uma barra de progresso. */
  footer?: React.ReactNode;
};

/** Cartão de uma métrica da semana: título com ícone, valor grande e apoio. */
export function MetricCard({ title, icon, value, unit, note, footer }: MetricCardProps) {
  return (
    <Card>
      <View style={styles.header}>
        <AppText variant="sectionTitle">{title}</AppText>
        <Icon name={icon} size={19} strokeWidth={1.6} color={colors.textMuted} />
      </View>

      <View style={styles.valueRow}>
        <AppText variant="display" style={styles.value}>
          {value}
        </AppText>
        {unit ? (
          <AppText variant="body" color="textMuted">
            {unit}
          </AppText>
        ) : null}
      </View>

      {footer}

      {note ? (
        <AppText variant="caption" color="textDim" style={styles.note}>
          {note}
        </AppText>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
    marginTop: spacing.xl,
  },
  value: {
    fontSize: 46,
    letterSpacing: -1.2,
  },
  note: {
    marginTop: spacing.lg,
  },
});
