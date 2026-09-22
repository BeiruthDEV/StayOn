import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
  useFonts,
} from '@expo-google-fonts/geist';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  BlocksProvider,
  EventsProvider,
  HabitsProvider,
  PreferencesProvider,
  SessionsProvider,
  TasksProvider,
  ToastProvider,
} from '@/state';
import { colors } from '@/theme';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
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
              <EventsProvider>
                <SessionsProvider>
                  <ToastProvider>
                    <Stack
                      screenOptions={{ headerShown: false, contentStyle: styles.screen }}
                    />
                  </ToastProvider>
                </SessionsProvider>
              </EventsProvider>
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
