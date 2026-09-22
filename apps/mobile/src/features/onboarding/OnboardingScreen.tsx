import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Button, Screen } from '@/components';
import { currentStep, focusAreas, onboardingSteps } from '@/data/onboarding';
import { Icon } from '@/icons';
import { useToast } from '@/state';
import { colors, motion, radius, spacing } from '@/theme';

/** Configuração inicial: escolha das áreas de foco da pessoa. */
export function OnboardingScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());

  const toggleArea = useCallback((id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleContinue = useCallback(() => {
    if (selected.size === 0) {
      showToast('Escolha ao menos uma área');
      return;
    }
    showToast(`${selected.size} ${selected.size === 1 ? 'área salva' : 'áreas salvas'}`);
    router.navigate('/');
  }, [router, selected, showToast]);

  return (
    <Screen bottomInset={spacing.section}>
      <View style={styles.brandRow}>
        <AppText variant="title">StayOn</AppText>
        <View style={styles.steps}>
          {Array.from({ length: onboardingSteps }, (_, index) => (
            <View
              key={index}
              style={[styles.step, index < currentStep && styles.stepActive]}
            />
          ))}
        </View>
      </View>

      <AppText variant="display" style={styles.question}>
        Em que você quer avançar?
      </AppText>
      <AppText variant="supporting" color="textMuted" style={styles.hint}>
        Escolha suas áreas de foco principais. Dá para ajustar depois.
      </AppText>

      {focusAreas.map((area) => {
        const isSelected = selected.has(area.id);

        return (
          <Pressable
            key={area.id}
            onPress={() => toggleArea(area.id)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isSelected }}
            style={({ pressed }) => [
              styles.option,
              isSelected && styles.optionSelected,
              pressed && styles.pressed,
            ]}
          >
            <Icon
              name={area.icon}
              size={21}
              strokeWidth={1.6}
              color={isSelected ? colors.text : colors.textDim}
            />
            <AppText variant="body" color={isSelected ? 'text' : 'textMuted'}>
              {area.label}
            </AppText>
            {isSelected ? (
              <View style={styles.optionCheck}>
                <Icon name="check" size={16} strokeWidth={2} color={colors.text} />
              </View>
            ) : null}
          </Pressable>
        );
      })}

      <Button
        label="Continuar"
        onPress={handleContinue}
        trailing={<Icon name="arrowRight" size={16} strokeWidth={1.8} color={colors.onLight} />}
        style={styles.continue}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 48,
  },
  steps: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  step: {
    width: 26,
    height: 3,
    borderRadius: radius.xs,
    backgroundColor: colors.border,
  },
  stepActive: {
    backgroundColor: colors.fillLight,
  },
  question: {
    marginBottom: spacing.md,
  },
  hint: {
    marginBottom: spacing.section,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxl,
    paddingHorizontal: spacing.xxl,
    paddingVertical: 18,
    marginBottom: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionCheck: {
    marginLeft: 'auto',
  },
  optionSelected: {
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceRaised,
  },
  continue: {
    alignSelf: 'flex-end',
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.section,
    minWidth: 180,
  },
  pressed: {
    opacity: motion.pressedOpacity,
  },
});
