import { Redirect } from 'expo-router';

import { HomeScreen } from '@/features/home';
import { usePreferences } from '@/state';

export default function HomeRoute() {
  const { preferences, hydrated } = usePreferences();

  // Espera a leitura do disco para não piscar a configuração inicial em quem
  // já a concluiu.
  if (!hydrated) return null;
  if (!preferences.onboarded) return <Redirect href="/onboarding" />;

  return <HomeScreen />;
}
