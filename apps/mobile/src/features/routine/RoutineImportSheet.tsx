import { useEffect, useMemo, useState } from 'react';

import { AppText, Button, Sheet, TextField } from '@/components';
import { parseRoutineText } from '@/domain/routine';
import { useRoutine, useToast } from '@/state';

type RoutineImportSheetProps = {
  visible: boolean;
  onClose: () => void;
};

const EXAMPLE = 'seg 09:00-12:00 Concurso | Específicos: teoria';

/**
 * Importa a rotina inteira de um texto colado, um bloco por linha.
 * Substitui a rotina atual; o histórico de dias marcados não é apagado.
 */
export function RoutineImportSheet({ visible, onClose }: RoutineImportSheetProps) {
  const { items, replaceAll } = useRoutine();
  const { showToast } = useToast();
  const [text, setText] = useState('');

  useEffect(() => {
    if (visible) setText('');
  }, [visible]);

  const parsed = useMemo(() => parseRoutineText(text), [text]);
  const firstError = parsed.errors[0];

  const handleImport = () => {
    if (parsed.items.length === 0 || firstError) return;
    const previous = items;
    replaceAll(parsed.items);
    showToast(`${parsed.items.length} blocos importados`, () => replaceAll(previous));
    onClose();
  };

  return (
    <Sheet
      visible={visible}
      title="Importar rotina"
      onClose={onClose}
      footer={
        <Button
          label={
            parsed.items.length > 0
              ? `Importar ${parsed.items.length} blocos`
              : 'Cole a rotina para importar'
          }
          onPress={handleImport}
        />
      }
    >
      <AppText variant="supporting" color="textMuted">
        Um bloco por linha: dia, horário, área e título. Exemplo: {EXAMPLE}
      </AppText>

      {items.length > 0 ? (
        <AppText variant="supporting" color="danger">
          A importação troca os {items.length} blocos atuais. O histórico dos dias já marcados
          continua salvo.
        </AppText>
      ) : null}

      <TextField
        label="Rotina"
        value={text}
        onChangeText={setText}
        placeholder={EXAMPLE}
        multiline
        error={
          firstError
            ? `Linha ${firstError.line}: ${firstError.reason}${
                parsed.errors.length > 1 ? ` (+${parsed.errors.length - 1} com erro)` : ''
              }`
            : undefined
        }
      />
    </Sheet>
  );
}
