import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  AppText,
  Card,
  ListRow,
  Screen,
  SectionHeader,
  SegmentedControl,
} from '@/components';
import { appSettings, systemItems, type Connection } from '@/data/profile';
import { Icon } from '@/icons';
import { useToast } from '@/state';
import { colors, motion, radius, spacing } from '@/theme';

import { ConnectionGrid } from './ConnectionGrid';
import { ProfileIdentity } from './ProfileIdentity';

const INTERVENTION_LEVELS = ['Suave', 'Rígido'] as const;

/** Tela Perfil: sistema pessoal, controle de distração, conexões e ajustes. */
export function ProfileScreen() {
  const { showToast } = useToast();
  const [intervention, setIntervention] =
    useState<(typeof INTERVENTION_LEVELS)[number]>('Suave');

  const handleConnection = useCallback(
    (connection: Connection) =>
      showToast(
        connection.status === 'connected'
          ? `${connection.name} já está conectado`
          : `Conectando ${connection.name}`,
      ),
    [showToast],
  );

  return (
    <Screen bottomInset={spacing.section}>
      <ProfileIdentity />

      <SectionHeader title="Sistema pessoal" style={styles.sectionHeader} />
      {systemItems.map((item) => (
        <ListRow
          key={item.id}
          title={item.title}
          subtitle={item.description}
          onPress={() => showToast(`${item.title} chega em breve`)}
          leading={<Icon name={item.icon} size={20} strokeWidth={1.6} color={colors.textMuted} />}
          trailing={
            <Icon name="chevronRight" size={16} strokeWidth={1.6} color={colors.textDim} />
          }
        />
      ))}

      <SectionHeader title="Controle de distração" style={styles.sectionHeaderSpaced} />
      <Card>
        <View style={styles.settingRow}>
          <View style={styles.settingText}>
            <AppText variant="bodyStrong">Apps bloqueados</AppText>
            <AppText variant="caption" color="textDim" style={styles.settingNote}>
              Restrições ativas durante o foco.
            </AppText>
          </View>
          <Pressable
            onPress={() => showToast('Gerenciamento chega em breve')}
            accessibilityRole="button"
            style={({ pressed }) => [styles.manage, pressed && styles.pressed]}
          >
            <AppText variant="captionMedium">Gerenciar</AppText>
          </Pressable>
        </View>

        <View style={styles.divider} />

        <View style={styles.settingColumn}>
          <View style={styles.settingText}>
            <AppText variant="bodyStrong">Nível de intervenção</AppText>
            <AppText variant="caption" color="textDim" style={styles.settingNote}>
              Rigidez dos bloqueios de foco.
            </AppText>
          </View>
          <SegmentedControl
            options={INTERVENTION_LEVELS}
            value={intervention}
            onChange={setIntervention}
          />
        </View>
      </Card>

      <SectionHeader title="Conexões" style={styles.sectionHeaderSpaced} />
      <ConnectionGrid onPress={handleConnection} />

      <SectionHeader title="Aplicativo" style={styles.sectionHeaderSpaced} />
      {appSettings.map((setting) => (
        <ListRow
          key={setting.id}
          title={setting.title}
          onPress={() => showToast(`${setting.title} chega em breve`)}
          trailing={
            setting.trailing ? (
              <AppText variant="caption" color="textDim">
                {setting.trailing}
              </AppText>
            ) : (
              <Icon name="chevronRight" size={16} strokeWidth={1.6} color={colors.textDim} />
            )
          }
        />
      ))}

      <Pressable
        onPress={() => showToast('Sessão encerrada')}
        accessibilityRole="button"
        style={({ pressed }) => [styles.signOut, pressed && styles.pressed]}
      >
        <Icon name="logout" size={18} strokeWidth={1.6} color={colors.textDim} />
        <AppText variant="captionMedium" color="textDim">
          Sair da conta
        </AppText>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    marginBottom: spacing.md,
  },
  sectionHeaderSpaced: {
    marginTop: spacing.section,
    marginBottom: spacing.xxl,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xxl,
  },
  settingColumn: {
    gap: spacing.xxl,
  },
  settingText: {
    flex: 1,
    minWidth: 0,
  },
  settingNote: {
    marginTop: spacing.xxs,
  },
  manage: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceRaised,
  },
  divider: {
    height: 1,
    marginVertical: spacing.xxl,
    backgroundColor: colors.hairline,
  },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: spacing.md,
    marginTop: spacing.section,
    paddingVertical: spacing.xl,
  },
  pressed: {
    opacity: motion.pressedOpacity,
  },
});
