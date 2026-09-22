import { useEffect, useState } from 'react';

import { Button, Sheet, TextField } from '@/components';
import { clampSessionMinutes } from '@/domain/preferences';
import { usePreferences, useToast } from '@/state';

type ProfileSheetProps = {
  visible: boolean;
  onClose: () => void;
};

/** Edição do nome e da duração padrão da sessão de foco. */
export function ProfileSheet({ visible, onClose }: ProfileSheetProps) {
  const { preferences, setName, setSessionMinutes } = usePreferences();
  const { showToast } = useToast();

  const [name, setLocalName] = useState('');
  const [minutes, setMinutes] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!visible) return;
    setLocalName(preferences.name);
    setMinutes(String(preferences.sessionMinutes));
    setError(undefined);
  }, [visible, preferences]);

  const handleSave = () => {
    const parsed = Number(minutes);

    if (!Number.isFinite(parsed) || parsed < 5 || parsed > 180) {
      setError('Escolha entre 5 e 180 minutos');
      return;
    }

    setName(name);
    setSessionMinutes(clampSessionMinutes(parsed));
    showToast('Perfil atualizado');
    onClose();
  };

  return (
    <Sheet
      visible={visible}
      title="Editar perfil"
      onClose={onClose}
      footer={<Button label="Salvar" onPress={handleSave} />}
    >
      <TextField
        label="Nome"
        value={name}
        onChangeText={setLocalName}
        placeholder="Como quer ser chamado"
        hint="Aparece na saudação da tela inicial."
        maxLength={40}
        autoFocus
      />

      <TextField
        label="Duração padrão da sessão"
        value={minutes}
        onChangeText={(text) => {
          setMinutes(text);
          if (error !== undefined) setError(undefined);
        }}
        placeholder="45"
        error={error}
        hint="Usada quando não há bloco planejado na agenda."
        keyboardType="number-pad"
        maxLength={3}
      />
    </Sheet>
  );
}
