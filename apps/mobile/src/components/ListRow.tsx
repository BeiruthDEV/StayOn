import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, motion } from '@/theme';

import { AppText } from './AppText';

type ListRowProps = {
  title: string;
  onPress: () => void;
  /** Ação secundária no toque longo, normalmente editar. */
  onLongPress?: () => void;
  /** Elemento à esquerda: checkbox ou ícone. */
  leading?: React.ReactNode;
  /** Texto de apoio abaixo do título. */
  subtitle?: string;
  /** Elemento à direita: etiqueta, progresso ou contagem. */
  trailing?: React.ReactNode;
  /** Aplica cor apagada no título (item concluído). */
  completed?: boolean;
  /** Risca o título — o protótipo usa risco apenas em tarefas. */
  strikethrough?: boolean;
  /** Reduz a opacidade da linha inteira (item pausado). */
  muted?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Linha de lista com separador inferior — base das listas da Home. */
export function ListRow({
  title,
  onPress,
  onLongPress,
  leading,
  subtitle,
  trailing,
  completed = false,
  strikethrough = false,
  muted = false,
  style,
}: ListRowProps) {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.row,
        muted && styles.muted,
        pressed && styles.pressed,
        style,
      ]}
    >
      {leading}
      <View style={styles.content}>
        <AppText
          variant={subtitle ? 'bodyStrong' : 'body'}
          color={completed ? 'textDim' : 'text'}
          style={strikethrough && styles.strikethrough}
        >
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" color="textDim" style={styles.subtitle}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {trailing}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 14,
    paddingHorizontal: 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  subtitle: {
    marginTop: 2,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  muted: {
    opacity: 0.55,
  },
  pressed: {
    opacity: motion.pressedOpacity,
  },
});
