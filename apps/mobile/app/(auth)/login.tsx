import { useState } from "react";
import { Button, TextInput } from "react-native";
import { useRouter } from "expo-router";

import { Screen } from "@/components";
import { useAuth } from "@/state/AuthContext";
import { colors } from "@/theme";

export default function Login() {
  const [nome, setNome] = useState("");
  const { entrar } = useAuth();
  const router = useRouter();

  return (
    <Screen>
      <TextInput
        placeholder="Seu nome"
        placeholderTextColor={colors.textMuted}
        style={{ color: colors.text, padding: 16 }}
        value={nome}
        onChangeText={setNome}
      />

      <Button
        title="Entrar"
        disabled={!nome.trim()}
        onPress={() => {
          entrar(nome.trim());
          router.replace("/");
        }}
      />
    </Screen>
  );
}