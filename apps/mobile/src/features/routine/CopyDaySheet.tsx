import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, SegmentedControl, Sheet } from '@/components';
import { copyDay, itemsForWeekday, weekdayShort, WEEK_ORDER, type Weekday } from '@/domain/routine';
import { useRoutine, useToast } from '@/state';
import { spacing } from '@/theme';

import { DayPicker } from './RoutinePickers';

type CopyDaySheetProps = {
  visible: boolean;
  /** Dia de origem: o que está aberto na tela. */
  from: Weekday;
  onClose: () => void;
};

const MODES = ['Substituir', 'Somar'] as const;

/** Copia todos os blocos de um dia para outros dias da semana. */
export function CopyDaySheet({ visible, from, onClose }: CopyDaySheetProps) {
  const { items, replaceAll } = useRoutine();
  const { showToast } = useToast();
  const [targets, setTargets] = useState<Weekday[]>([]);
  const [mode, setMode] = useState<(typeof MODES)[number]>('Substituir');
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!visible) return;
    setTargets([]);
    setMode('Substituir');
    setError(undefined);
  }, [visible]);

  const sourceCount = itemsForWeekday(items, from).length;
  const chosen = WEEK_ORDER.filter((day) => targets.includes(day) && day !== from);
  const replacedCount = chosen.reduce<number>(
    (sum, day) => sum + itemsForWeekday(items, day).length,
    0,
  );

  const handleCopy = () => {
    if (chosen.length === 0) {
      setError('Escolha pelo menos um dia de destino');
      return;
    }
    const previous = items;
    replaceAll(copyDay(items, from, chosen, mode === 'Substituir'));
    showToast(`${weekdayShort(from)} copiada para ${chosen.map(weekdayShort).join(', ')}`, () =>
      replaceAll(previous),
    );
    onClose();
  };

  return (
    <Sheet
      visible={visible}
      title={`Copiar ${weekdayShort(from).toLowerCase()} para…`}
      onClose={onClose}
      footer={
        <Button
          label={
            chosen.length > 0
              ? `Copiar ${sourceCount} blocos para ${chosen.length} ${chosen.length === 1 ? 'dia' : 'dias'}`
              : 'Escolha os dias'
          }
          onPress={handleCopy}
        />
      }
    >
      <AppText variant="supporting" color="textMuted" style={styles.intro}>
        Os {sourceCount} blocos de {weekdayShort(from).toLowerCase()} vão para os dias que você
        marcar, com os mesmos horários.
      </AppText>

      <DayPicker
        label="Para os dias"
        value={targets.filter((day) => day !== from)}
        onChange={(next) => {
          setTargets(next.filter((day) => day !== from));
          setError(undefined);
        }}
        multiple
        error={error}
      />

      <View style={styles.mode}>
        <AppText variant="overlineSmall" color="textDim">
          O que já existe nesses dias
        </AppText>
        <SegmentedControl options={MODES} value={mode} onChange={setMode} />
        <AppText variant="caption" color="textDim">
          {mode === 'Substituir'
            ? replacedCount > 0
              ? `Os ${replacedCount} blocos que já estão nesses dias saem.`
              : 'Esses dias estão vazios.'
            : 'Os blocos que já existem continuam, e os novos se somam a eles.'}
        </AppText>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  intro: {
    marginBottom: spacing.xxl,
  },
  mode: {
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
});
