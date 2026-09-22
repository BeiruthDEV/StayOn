import { StyleSheet, View } from 'react-native';

import { Icon } from '@/icons';
import { colors, radius } from '@/theme';

type CheckboxProps = {
  checked: boolean;
};

/**
 * Indicador circular de conclusão (22px) usado em tarefas e hábitos.
 * Visual apenas — o toque é tratado pela linha que o contém.
 */
export function Checkbox({ checked }: CheckboxProps) {
  return (
    <View
      style={[styles.box, checked ? styles.checked : styles.unchecked]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      {checked ? <Icon name="check" size={13} strokeWidth={2.4} color={colors.onLight} /> : null}
    </View>
  );
}

const SIZE = 22;

const styles = StyleSheet.create({
  box: {
    width: SIZE,
    height: SIZE,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: {
    borderColor: colors.fillLight,
    backgroundColor: colors.fillLight,
  },
  unchecked: {
    borderColor: colors.borderStrong,
    backgroundColor: colors.transparent,
  },
});
