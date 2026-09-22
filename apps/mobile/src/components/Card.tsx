import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, shadows } from '@/theme';

type CardProps = {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

/** Superfície elevada com borda e sombra — o cartão "Próxima ação" do protótipo. */
export function Card({ style, children }: CardProps) {
  return <View style={[styles.card, shadows.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
  },
});
