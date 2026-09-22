import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components';
import { minutesLabel } from '@/domain/usage';
import { colors, motion } from '@/theme';

type FocusSummaryProps = {
  /** Sessões de foco encerradas hoje. */
  sessions: number;
  /** Minutos focados hoje. */
  minutes: number;
  onSeeInsights: () => void;
};

/** Resumo do foco de hoje, medido pelas sessões que a pessoa realmente fez. */
export function FocusSummary({ sessions, minutes, onSeeInsights }: FocusSummaryProps) {
  return (
    <View style={styles.container}>
      <View style={styles.rule} />
      <View style={styles.content}>
        {sessions === 0 ? (
          <AppText variant="supporting" color="textMuted">
            Nenhuma sessão de foco hoje ainda. A primeira começa pela próxima ação.
          </AppText>
        ) : (
          <AppText variant="supporting" color="textMuted">
            Você focou <AppText variant="supportingStrong">{minutesLabel(minutes)}</AppText> hoje
            em <AppText variant="supportingStrong">{sessions}</AppText>{' '}
            {sessions === 1 ? 'sessão' : 'sessões'}.
          </AppText>
        )}

        <Pressable
          onPress={onSeeInsights}
          accessibilityRole="button"
          style={({ pressed }) => [styles.link, pressed && styles.pressed]}
        >
          <AppText variant="captionMedium" style={styles.linkLabel}>
            Ver insights
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 13,
    paddingTop: 18,
    paddingHorizontal: 2,
  },
  rule: {
    width: 2,
    borderRadius: 1,
    backgroundColor: colors.borderStrong,
  },
  content: {
    flex: 1,
  },
  link: {
    alignSelf: 'flex-start',
    paddingTop: 8,
  },
  linkLabel: {
    textDecorationLine: 'underline',
  },
  pressed: {
    opacity: motion.pressedOpacity,
  },
});
