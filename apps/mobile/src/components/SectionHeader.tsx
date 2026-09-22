import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from './AppText';

type SectionHeaderProps = {
  title: string;
  /** Ação alinhada à direita: botão de texto ou ícone. */
  action?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Cabeçalho de seção com ação opcional à direita. */
export function SectionHeader({ title, action, style }: SectionHeaderProps) {
  return (
    <View style={[styles.header, style]}>
      <AppText variant="sectionTitle">{title}</AppText>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
});
