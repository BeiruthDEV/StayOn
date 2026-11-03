import { Redirect, Stack } from "expo-router";

import { useAuth } from "@/state/AuthContext";
import { colors } from "@/theme";

export default function AppLayout() {
  const { usuario } = useAuth();

  if (!usuario) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}