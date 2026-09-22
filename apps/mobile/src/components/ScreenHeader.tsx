import { StyleSheet, View } from 'react-native';

import { spacing } from '@/theme';

import { AppText } from './AppText';

type ScreenHeaderProps = {
  title: string;
  /** Linha de apoio abaixo do título. */
  subtitle?: string;
  /** Rótulo pequeno acima do título, em maiúsculas. */
  overline?: string;
  /** Ação alinhada à direita do título. */
  action?: React.ReactNode;
};

/** Cabeçalho das telas internas: rótulo, título grande e linha de apoio. */
export function ScreenHeader({ title, subtitle, overline, action }: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.titles}>
        {overline ? (
          <AppText variant="overline" color="textDim" style={styles.overline}>
            {overline}
          </AppText>
        ) : null}
        <AppText variant="display">{title}</AppText>
        {subtitle ? (
          <AppText variant="supporting" color="textMuted" style={styles.subtitle}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.xxl,
    marginBottom: spacing.section,
  },
  titles: {
    flex: 1,
    minWidth: 0,
  },
  overline: {
    marginBottom: spacing.sm,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
});
