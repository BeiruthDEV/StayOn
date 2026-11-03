import { Stack, useLocalSearchParams } from "expo-router";

import { AppText, Screen } from "@/components";
import { useTasks } from "@/state";

export default function Detalhe() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tasks } = useTasks();
  const tarefa = tasks.find((item) => item.id === id);

  return (
    <Screen>
      <Stack.Screen options={{ title: "Detalhe" }} />
      <AppText>{tarefa?.title ?? "Tarefa não encontrada"}</AppText>
    </Screen>
  );
}