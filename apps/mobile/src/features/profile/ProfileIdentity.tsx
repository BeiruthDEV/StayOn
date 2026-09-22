import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Chip } from '@/components';
import { initials, type Preferences } from '@/domain/preferences';
import { colors, motion, radius, spacing } from '@/theme';

type ProfileIdentityProps = {
  preferences: Preferences;
  /** Abre o formulário de edição do nome. */
  onEdit: () => void;
};

/** Avatar, nome e áreas de foco escolhidas. */
export function ProfileIdentity({ preferences, onEdit }: ProfileIdentityProps) {
  const hasName = preferences.name.trim() !== '';

  return (
    <Pressable
      onPress={onEdit}
      accessibilityRole="button"
      accessibilityLabel="Editar perfil"
      style={({ pressed }) => [styles.root, pressed && styles.pressed]}
    >
      <View style={styles.avatar}>
        <AppText variant="title">{initials(preferences)}</AppText>
      </View>

      <AppText variant="title" style={styles.name}>
        {hasName ? preferences.name : 'Sem nome'}
      </AppText>
      <AppText variant="caption" color="textDim">
        {hasName ? 'Toque para editar' : 'Toque para se apresentar'}
      </AppText>

      {preferences.focusAreas.length > 0 ? (
        <View style={styles.badges}>
          {preferences.focusAreas.slice(0, 3).map((area) => (
            <Chip key={area} label={area} />
          ))}
        </View>
      ) : null}
    </Pressable>
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
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.xxl,
  },
  pressed: {
    opacity: motion.pressedOpacity,
  },
});
