import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, Screen, TextField } from '@/components';
import { useAuth } from '@/state/AuthContext';
import { spacing } from '@/theme';

export default function Login() {
  const [nome, setNome] = useState('');
  const { entrar } = useAuth();
  const router = useRouter();

  const podeEntrar = nome.trim().length > 0;

  const handleEntrar = () => {
    if (!podeEntrar) {
      return;
    }
    entrar(nome.trim());
    router.replace('/');
  };

  return (
    <Screen scroll={false} contentStyle={styles.content}>
      <View style={styles.header}>
        <AppText variant="display">StayOn</AppText>
        <AppText variant="supporting" color="textMuted" style={styles.subtitle}>
          Foco no que importa. Diga como podemos te chamar para começar.
        </AppText>
      </View>

      <TextField
        label="SEU NOME"
        placeholder="Ex.: Matheus"
        value={nome}
        onChangeText={setNome}
        maxLength={40}
        autoFocus
      />

      <Button
        label="Entrar"
        onPress={handleEntrar}
        style={podeEntrar ? undefined : styles.desabilitado}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
    paddingBottom: spacing.section * 3,
  },
  header: {
    marginBottom: spacing.section * 1.5,
  },
  subtitle: {
    marginTop: spacing.md,
  },
  desabilitado: {
    opacity: 0.4,
  },
});
