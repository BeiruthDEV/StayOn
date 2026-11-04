import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { AppText, Button, Screen, TextField } from '@/components';
import { useAuth } from '@/state/AuthContext';
import { radius, spacing } from '@/theme';

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
      <View style={styles.brand}>
        <Image
          source={require('../../assets/icon.png')}
          style={styles.logo}
          accessibilityIgnoresInvertColors
        />
        <AppText variant="display" style={styles.name}>
          StayOn
        </AppText>
        <AppText variant="supporting" color="textDim">
          Foco no que importa.
        </AppText>
      </View>

      <TextField
        label="SEU NOME"
        placeholder="Como devemos te chamar?"
        value={nome}
        onChangeText={setNome}
        maxLength={40}
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
  brand: {
    alignItems: 'center',
    marginBottom: spacing.section * 2,
  },
  logo: {
    width: 84,
    height: 84,
    borderRadius: radius.xl,
  },
  name: {
    marginTop: spacing.xxl,
    marginBottom: spacing.xs,
  },
  desabilitado: {
    opacity: 0.4,
  },
});
