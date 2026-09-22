import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components';
import type { DistractionSummary } from '@/data/home';
import { colors, motion } from '@/theme';

type DistractionNoteProps = {
  summary: DistractionSummary;
  onSeeInsights: () => void;
};

/** Nota de rodapé com o resumo de distração do dia e atalho para Insights. */
export function DistractionNote({ summary, onSeeInsights }: DistractionNoteProps) {
  return (
    <View style={styles.container}>
      <View style={styles.rule} />
      <View style={styles.content}>
        <AppText variant="supporting" color="textMuted">
          Você usou redes sociais por{' '}
          <AppText variant="supportingStrong">{summary.totalTime}</AppText> hoje —{' '}
          <AppText variant="supportingStrong">{summary.duringFocus}</AppText> durante blocos de
          estudo planejados.
        </AppText>
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
