import { useEffect, useState } from 'react';

import { AppText, Button, OptionPicker, Sheet, TextField } from '@/components';
import { longDateLabel } from '@/domain/clock';
import { categoryLabels, type EventCategory } from '@/domain/event';
import { useEvents, useToast } from '@/state';

type EventSheetProps = {
  visible: boolean;
  /** Data escolhida no calendário, no formato YYYY-MM-DD. */
  date: string;
  onClose: () => void;
};

const CATEGORY_OPTIONS = (Object.keys(categoryLabels) as EventCategory[]).map((value) => ({
  value,
  label: categoryLabels[value],
}));

/** Formulário de criação de compromisso na data selecionada no calendário. */
export function EventSheet({ visible, date, onClose }: EventSheetProps) {
  const { add } = useEvents();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [meta, setMeta] = useState('');
  const [category, setCategory] = useState<EventCategory>('study');
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!visible) return;
    setTitle('');
    setMeta('');
    setCategory('study');
    setError(undefined);
  }, [visible]);

  const handleSave = () => {
    if (title.trim() === '') {
      setError('Dê um nome ao compromisso');
      return;
    }

    add(title, date, category, meta);
    showToast('Compromisso criado');
    onClose();
  };

  return (
    <Sheet
      visible={visible}
      title="Novo compromisso"
      onClose={onClose}
      footer={<Button label="Criar compromisso" onPress={handleSave} />}
    >
      <AppText variant="supporting" color="textMuted" style={{ marginBottom: 20 }}>
        Em {longDateLabel(date).toLowerCase()}. Para outra data, toque no dia no calendário
        antes de abrir este formulário.
      </AppText>

      <TextField
        label="Compromisso"
        value={title}
        onChangeText={(text) => {
          setTitle(text);
          if (error !== undefined) setError(undefined);
        }}
        placeholder="Prova de Banco de Dados"
        error={error}
        maxLength={60}
        autoFocus
      />

      <TextField
        label="Detalhe"
        value={meta}
        onChangeText={setMeta}
        placeholder="Sala B"
        hint="Local, valor ou qualquer observação. Opcional."
        maxLength={40}
      />

      <OptionPicker
        label="Categoria"
        options={CATEGORY_OPTIONS}
        value={category}
        onChange={setCategory}
      />
    </Sheet>
  );
}
