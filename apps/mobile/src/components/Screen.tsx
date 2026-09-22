import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme';

type ScreenProps = {
  /** Envolve o conteúdo em ScrollView. Telas imersivas usam `false`. */
  scroll?: boolean;
  /** Espaço extra no fim do scroll, além da safe area. */
  bottomInset?: number;
  contentStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

/**
 * Contêiner de tela: fundo do app, padding horizontal padrão e safe area do topo.
 * A safe area inferior é tratada pela navegação inferior.
 */
export function Screen({ scroll = true, bottomInset = 0, contentStyle, children }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const padding = { paddingTop: insets.top + spacing.md, paddingBottom: bottomInset };

  if (!scroll) {
    return <View style={[styles.root, styles.content, padding, contentStyle]}>{children}</View>;
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, padding, contentStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.screen,
  },
});
