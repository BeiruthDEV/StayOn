import { StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/icons';
import { colors, radius, spacing } from '@/theme';

import { AppText } from './AppText';

type EmptyStateProps = {
  icon: IconName;
  title: string;
  description: string;
  /** Botão ou atalho exibido abaixo do texto. */
  action?: React.ReactNode;
};

/** Estado vazio de uma lista: o que é aquele espaço e como preenchê-lo. */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <View style={styles.root}>
      <View style={styles.badge}>
        <Icon name={icon} size={22} strokeWidth={1.6} color={colors.textDim} />
      </View>

      <AppText variant="bodyStrong" style={styles.title}>
        {title}
      </AppText>
      <AppText variant="supporting" color="textDim" style={styles.description}>
        {description}
      </AppText>

      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: spacing.section,
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: spacing.xxl,
  },
  description: {
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  action: {
    marginTop: spacing.xxl,
  },
});
