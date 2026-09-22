import { useRouter } from 'expo-router';
import { Fragment, useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { EmptyState, IconButton, Screen, ScreenHeader, SegmentedControl } from '@/components';
import { currentTime, longDateLabel, todayIso } from '@/domain/clock';
import {
  findMissed,
  suggestNewStart,
  toMinutes,
  withEffectiveStatus,
  type TimeBlock,
} from '@/domain/timeBlock';
import { useBlocks, useToast } from '@/state';
import { spacing } from '@/theme';

import { BlockSheet } from './BlockSheet';
import { NowMarker } from './NowMarker';
import { ReplanAlert } from './ReplanAlert';
import { TimelineBlock } from './TimelineBlock';

const RANGES = ['Dia', 'Semana'] as const;

/** Tela Planejar: agenda do dia em linha do tempo, com criação e replanejamento. */
export function TimelineScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { blocks: stored, reschedule, restoreBlock } = useBlocks();
  const [range, setRange] = useState<(typeof RANGES)[number]>('Dia');

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<TimeBlock | undefined>(undefined);

  const now = currentTime();
  const nowMinutes = toMinutes(now);

  // A situação é recalculada contra o relógio: um bloco cujo horário passou
  // aparece como perdido mesmo que tenha sido salvo como futuro.
  const blocks = useMemo(() => withEffectiveStatus(stored, now), [stored, now]);
  const missed = useMemo(() => findMissed(blocks), [blocks]);
  const suggestedTime = useMemo(() => suggestNewStart(now), [now]);

  const openNew = () => {
    setEditing(undefined);
    setSheetOpen(true);
  };

  const openEdit = useCallback((block: TimeBlock) => {
    setEditing(block);
    setSheetOpen(true);
  }, []);

  const handleReplan = useCallback(() => {
    if (!missed) return;
    const original = stored.find((block) => block.id === missed.id);
    reschedule(missed.id, suggestedTime);
    showToast(`Bloco movido para ${suggestedTime}`, () => {
      if (original) restoreBlock(original);
    });
  }, [missed, stored, reschedule, restoreBlock, showToast, suggestedTime]);

  const handleBlockPress = useCallback(
    (block: TimeBlock) => {
      if (block.status === 'upcoming') {
        router.navigate('/focus');
        return;
      }
      openEdit(block);
    },
    [router, openEdit],
  );

  return (
    <Screen bottomInset={spacing.section}>
      <ScreenHeader
        title="Linha do tempo de hoje"
        subtitle={longDateLabel(todayIso())}
        action={
          <IconButton
            name="calendar"
            onPress={() => router.navigate('/dates')}
            accessibilityLabel="Datas importantes"
            size={22}
          />
        }
      />

      <View style={styles.controls}>
        <SegmentedControl options={RANGES} value={range} onChange={setRange} />
        <IconButton
          name="plus"
          variant="raised"
          size={20}
          onPress={openNew}
          accessibilityLabel="Novo bloco"
          style={styles.add}
        />
      </View>

      {range === 'Semana' ? (
        <EmptyState
          icon="calendar"
          title="Visão semanal"
          description="A semana inteira aparece na Revisão semanal, dentro de Insights."
        />
      ) : null}

      {range === 'Dia' ? (
        <>
          {missed ? (
            <ReplanAlert
              block={missed}
              suggestedTime={suggestedTime}
              onReplan={handleReplan}
            />
          ) : null}

          {blocks.length === 0 ? (
            <EmptyState
              icon="planner"
              title="Agenda vazia"
              description="Toque em + para reservar o primeiro bloco de tempo do dia."
            />
          ) : null}

          {blocks.map((block, index) => {
            const previous = blocks[index - 1];
            const showMarker =
              toMinutes(block.start) > nowMinutes &&
              (previous === undefined || toMinutes(previous.start) <= nowMinutes);

            return (
              <Fragment key={block.id}>
                {showMarker ? <NowMarker time={now} /> : null}
                <TimelineBlock
                  block={block}
                  onPress={handleBlockPress}
                  onLongPress={openEdit}
                />
              </Fragment>
            );
          })}
        </>
      ) : null}

      <BlockSheet visible={sheetOpen} block={editing} onClose={() => setSheetOpen(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxl,
    marginBottom: spacing.section,
  },
  add: {
    marginLeft: 'auto',
    width: 44,
    height: 44,
  },
});
