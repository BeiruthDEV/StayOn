import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { colors, motion, radius, shadows } from '@/theme';

import { AppText } from './AppText';

type ToastProps = {
  message: string;
  /** Quando presente, exibe a ação "Desfazer". */
  onUndo?: (() => void) | undefined;
  /** Distância do rodapé, em px. */
  bottom: number;
};

/** Aviso temporário na base da tela, com ação de desfazer opcional. */
export function Toast({ message, onUndo, bottom }: ToastProps) {
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: motion.base,
      useNativeDriver: true,
    }).start();
  }, [message, progress]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [8, 0] });

  return (
    <View style={[styles.overlay, { bottom }]} pointerEvents="box-none">
      <Animated.View style={[styles.toast, shadows.toast, { opacity: progress, transform: [{ translateY }] }]}>
        <AppText variant="supportingStrong">{message}</AppText>
        {onUndo ? (
          <Pressable
            onPress={onUndo}
            accessibilityRole="button"
            style={({ pressed }) => pressed && styles.pressed}
          >
            <AppText variant="supportingStrong" style={styles.undo}>
              Desfazer
            </AppText>
          </Pressable>
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    maxWidth: '100%',
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  undo: {
    textDecorationLine: 'underline',
  },
  pressed: {
    opacity: motion.pressedOpacity,
  },
});
