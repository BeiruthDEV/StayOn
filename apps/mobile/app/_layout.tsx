import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  useFonts,
} from '@expo-google-fonts/geist';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '@/state/AuthContext';

import {
  BlockedAppsProvider,
  BlocksProvider,
  EventsProvider,
  HabitsProvider,
  PreferencesProvider,
  RoutineProvider,
  SessionsProvider,
  TasksProvider,
  ToastProvider,
} from '@/state';
import { colors } from '@/theme';

// Mantém a splash nativa visível até a sessão salva ser lida. Decidir a rota
// antes disso faria o login piscar na tela de quem já estava logado.
SplashScreen.preventAutoHideAsync().catch(() => undefined);

/** Só libera as rotas depois que a sessão foi lida do disco. */
function BootGate({ children }: { children: React.ReactNode }) {
  const { pronto } = useAuth();

  useEffect(() => {
    if (pronto) void SplashScreen.hideAsync().catch(() => undefined);
  }, [pronto]);

  return pronto ? <>{children}</> : null;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
  });

  if (!fontsLoaded) {
    return <View style={styles.splash} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <PreferencesProvider>
        <TasksProvider>
          <HabitsProvider>
            <BlocksProvider>
              <RoutineProvider>
                <EventsProvider>
                  <SessionsProvider>
                    <BlockedAppsProvider>
                      <ToastProvider>
                        <AuthProvider>
                          <BootGate>
                            <Stack
                              screenOptions={{
                                headerShown: false,
                                contentStyle: styles.screen,
                              }}
                            />
                          </BootGate>
                        </AuthProvider>
                      </ToastProvider>
                    </BlockedAppsProvider>
                  </SessionsProvider>
                </EventsProvider>
              </RoutineProvider>
            </BlocksProvider>
          </HabitsProvider>
        </TasksProvider>
      </PreferencesProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    backgroundColor: colors.background,
  },
});