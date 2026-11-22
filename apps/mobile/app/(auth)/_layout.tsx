import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/state/AuthContext';

export default function AuthLayout() {
  const { usuario } = useAuth();

  // Quem já tem sessão salva não precisa ver o login de novo.
  if (usuario) {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
