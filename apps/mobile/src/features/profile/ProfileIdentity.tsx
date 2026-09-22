import { StyleSheet, View } from 'react-native';

import { AppText, Chip } from '@/components';
import { account } from '@/data/profile';
import { colors, radius, spacing } from '@/theme';

/** Avatar, nome, papel e selos da conta. */
export function ProfileIdentity() {
  return (
    <View style={styles.root}>
      <View style={styles.avatar}>
        <AppText variant="title">{account.initials}</AppText>
      </View>

      <AppText variant="title" style={styles.name}>
        {account.name}
      </AppText>
      <AppText variant="caption" color="textDim">
        {account.role}
      </AppText>

      <View style={styles.badges}>
        {account.badges.map((badge) => (
          <Chip key={badge} label={badge} />
        ))}
      </View>
    </View>
  );
}

const AVATAR_SIZE = 76;

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    marginBottom: spacing.section,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    marginTop: spacing.xxl,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.xxl,
  },
});
