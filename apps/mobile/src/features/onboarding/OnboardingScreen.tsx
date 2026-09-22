import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Button, Screen, TextField } from '@/components';
import { focusAreas } from '@/data/onboarding';
import { Icon } from '@/icons';
import { usePreferences, useToast } from '@/state';
import { colors, motion, radius, spacing } from '@/theme';

/** Configuração inicial: nome e áreas de foco, salvos no aparelho. */
export function OnboardingScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { preferences, completeOnboarding } = usePreferences();

  const [name, setName] = useState('');
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [error, setError] = useState<string | undefined>(undefined);

  // Reabrir pelo Perfil mostra o que já estava escolhido.
  useEffect(() => {
    setName(preferences.name);
    setSelected(new Set(preferences.focusAreas));
  }, [preferences]);

  const toggleArea = useCallback((label: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  }, []);

  const handleContinue = useCallback(() => {
    if (selected.size === 0) {
      setError('Escolha ao menos uma área');
      return;
    }

    completeOnboarding(name, [...selected]);
    showToast(preferences.onboarded ? 'Preferências salvas' : 'Tudo pronto');

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, [selected, completeOnboarding, name, showToast, preferences.onboarded, router]);

  return (
    <Screen bottomInset={spacing.section}>
      <View style={styles.brandRow}>
        <AppText variant="title">StayOn</AppText>
        {preferences.onboarded ? (
          <AppText variant="caption" color="textDim">
            Editando
          </AppText>
        ) : null}
      </View>

      <AppText variant="display" style={styles.question}>
        Em que você quer avançar?
      </AppText>
      <AppText variant="supporting" color="textMuted" style={styles.hint}>
        As áreas escolhidas viram as etiquetas das suas tarefas e blocos. Dá para mudar
        depois no Perfil.
      </AppText>

      <TextField
        label="Como quer ser chamado"
        value={name}
        onChangeText={setName}
        placeholder="Seu nome"
        hint="Opcional. Aparece na saudação da tela inicial."
        maxLength={40}
      />

      {focusAreas.map((area) => {
        const isSelected = selected.has(area.label);

        return (
          <Pressable
            key={area.label}
            onPress={() => {
              toggleArea(area.label);
              if (error !== undefined) setError(undefined);
            }}
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

      {error !== undefined ? (
        <AppText variant="caption" color="danger" style={styles.error}>
          {error}
        </AppText>
      ) : null}

      <Button
        label={preferences.onboarded ? 'Salvar' : 'Continuar'}
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
    marginBottom: 40,
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
  error: {
    marginTop: spacing.md,
  },
  continue: {
    marginTop: spacing.section,
  },
  pressed: {
    opacity: motion.pressedOpacity,
  },
});
