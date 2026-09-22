import { useRouter } from 'expo-router';
import { Fragment, useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { IconButton, Screen, ScreenHeader, SegmentedControl } from '@/components';
import { currentTime, plannerDate, suggestedReplanTime } from '@/data/planner';
import { findMissed, toMinutes, type TimeBlock } from '@/domain/timeBlock';
import { useBlocks, useToast } from '@/state';
import { spacing } from '@/theme';

import { NowMarker } from './NowMarker';
import { ReplanAlert } from './ReplanAlert';
import { TimelineBlock } from './TimelineBlock';

const RANGES = ['Dia', 'Semana'] as const;

/** Tela Planejar: agenda do dia em linha do tempo, com replanejamento. */
export function TimelineScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { blocks, reschedule, restoreBlock } = useBlocks();
  const [range, setRange] = useState<(typeof RANGES)[number]>('Dia');

  const missed = useMemo(() => findMissed(blocks), [blocks]);
  const nowMinutes = toMinutes(currentTime);

  const handleReplan = useCallback(() => {
    if (!missed) return;
    reschedule(missed.id, suggestedReplanTime);
    showToast(`Bloco movido para ${suggestedReplanTime}`, () => restoreBlock(missed));
  }, [missed, reschedule, restoreBlock, showToast]);

  const handleBlockPress = useCallback(
    (block: TimeBlock) => {
      if (block.status === 'upcoming') {
        router.navigate('/focus');
        return;
      }
      showToast(`${block.title} · ${block.start}`);
    },
    [router, showToast],
  );

  return (
    <Screen bottomInset={spacing.section}>
      <ScreenHeader
        title="Linha do tempo de hoje"
        subtitle={plannerDate}
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
        <View style={styles.navButtons}>
          <IconButton
            name="chevronLeft"
            onPress={() => showToast('Dia anterior')}
            accessibilityLabel="Dia anterior"
          />
          <IconButton
            name="chevronRight"
            onPress={() => showToast('Próximo dia')}
            accessibilityLabel="Próximo dia"
          />
        </View>
        <IconButton
          name="plus"
          variant="raised"
          size={20}
          onPress={() => showToast('Novo bloco chega em breve')}
          accessibilityLabel="Novo bloco"
          style={styles.add}
        />
      </View>

      {missed ? (
        <ReplanAlert block={missed} suggestedTime={suggestedReplanTime} onReplan={handleReplan} />
      ) : null}

      {blocks.map((block, index) => {
        const previous = blocks[index - 1];
        const showMarker =
          toMinutes(block.start) > nowMinutes &&
          (previous === undefined || toMinutes(previous.start) <= nowMinutes);

        return (
          <Fragment key={block.id}>
            {showMarker ? <NowMarker time={currentTime} /> : null}
            <TimelineBlock block={block} onPress={handleBlockPress} />
          </Fragment>
        );
      })}
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
  navButtons: {
    flexDirection: 'row',
    gap: spacing.section,
  },
  add: {
    marginLeft: 'auto',
    width: 44,
    height: 44,
  },
});
