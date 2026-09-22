import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, spacing } from '@/theme';

import { AppText } from './AppText';
import { IconButton } from './IconButton';

type SheetProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  /** Ações fixas no rodapé, fora da área rolável. */
  footer?: React.ReactNode;
  children: React.ReactNode;
};

/**
 * Painel que sobe pela base da tela, usado nos formulários de criação e edição.
 * Fecha ao tocar no fundo escurecido ou no X.
 */
export function Sheet({ visible, title, onClose, footer, children }: SheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Fechar" />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.panelWrapper}
        >
          <View style={[styles.panel, { paddingBottom: insets.bottom + spacing.section }]}>
            <View style={styles.grabber} />

            <View style={styles.header}>
              <AppText variant="title">{title}</AppText>
              <IconButton name="close" size={22} onPress={onClose} accessibilityLabel="Fechar" />
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={styles.body}
            >
              {children}
            </ScrollView>

            {footer ? <View style={styles.footer}>{footer}</View> : null}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  panelWrapper: {
    // O limite de altura fica aqui, e não no painel: este é filho direto de
    // `root`, que tem flex 1 e portanto altura definida. Uma porcentagem
    // contra um pai auto-dimensionado não resolve e o painel colapsa.
    maxHeight: '90%',
    justifyContent: 'flex-end',
  },
  panel: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.xl,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
    marginBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.section,
  },
  body: {
    // Precisa poder encolher: dentro do maxHeight do painel, um ScrollView que
    // não encolhe estoura o limite e o conteúdo é cortado em vez de rolar.
    flexShrink: 1,
  },
  footer: {
    gap: spacing.lg,
    marginTop: spacing.section,
  },
});
