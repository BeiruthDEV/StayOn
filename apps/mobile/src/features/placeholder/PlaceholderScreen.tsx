import { StyleSheet, View } from 'react-native';

import { AppText, Screen } from '@/components';

type PlaceholderScreenProps = {
  title: string;
  /** Fase do plano de migração em que a tela será construída. */
  phase: string;
};

/**
 * Marcador temporário das abas ainda não migradas do protótipo.
 * Removido conforme cada tela real entra (fases 3 a 5).
 */
export function PlaceholderScreen({ title, phase }: PlaceholderScreenProps) {
  return (
    <Screen scroll={false}>
      <View style={styles.content}>
        <AppText variant="display">{title}</AppText>
        <AppText variant="supporting" color="textDim" style={styles.phase}>
          Migração prevista para a {phase}.
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  phase: {
    marginTop: 8,
  },
});
