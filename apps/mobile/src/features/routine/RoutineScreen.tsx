import { Screen, ScreenHeader } from '@/components';
import { longDateLabel, todayIso } from '@/domain/clock';
import { spacing } from '@/theme';

import { RoutineView } from './RoutineView';

/** Aba Rotina: a semana fixa, marcada de novo a cada dia. */
export function RoutineScreen() {
  return (
    <Screen bottomInset={spacing.section}>
      <ScreenHeader title="Rotina" subtitle={longDateLabel(todayIso())} />
      <RoutineView />
    </Screen>
  );
}
