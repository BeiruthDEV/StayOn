import { StyleSheet, View } from 'react-native';

import { AppText, Button, Card } from '@/components';
import { Icon } from '@/icons';
import type { NextAction } from '@/data/home';
import { colors } from '@/theme';

type NextActionCardProps = {
  action: NextAction;
  onStartFocus: () => void;
};

/** Cartão de destaque com o próximo bloco planejado e o CTA de foco. */
export function NextActionCard({ action, onStartFocus }: NextActionCardProps) {
  return (
    <Card>
      <View style={styles.header}>
        <AppText variant="overlineSmall" color="textMuted">
          Próxima ação
        </AppText>
        <AppText variant="captionMedium" color="textMuted">
          {action.timeRange}
        </AppText>
      </View>
      <AppText variant="title" style={styles.title}>
        {action.title}
      </AppText>
      <AppText variant="supporting" color="textMuted">
        {action.goal}
      </AppText>
      <Button
        label="Iniciar foco"
        onPress={onStartFocus}
        style={styles.cta}
        trailing={<Icon name="play" size={16} strokeWidth={1.8} color={colors.onLight} />}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    marginTop: 10,
    marginBottom: 4,
  },
  cta: {
    marginTop: 16,
  },
});
