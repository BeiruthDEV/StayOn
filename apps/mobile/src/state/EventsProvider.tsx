import { createContext, useCallback, useContext, useMemo } from 'react';

import { todayIso } from '@/domain/clock';
import {
  addEvent,
  createEvent,
  refreshCountdowns,
  removeEvent,
  type CalendarEvent,
  type EventCategory,
} from '@/domain/event';
import { storageKeys, usePersistentState } from '@/storage';

type EventsContextValue = {
  /** Compromissos com a contagem regressiva sempre atualizada. */
  events: readonly CalendarEvent[];
  /** Cria um compromisso e devolve o que foi criado. */
  add: (title: string, date: string, category: EventCategory, meta: string) => CalendarEvent;
  remove: (id: string) => void;
  /** Recoloca um compromisso removido na lista (ação de desfazer). */
  restoreRemoved: (event: CalendarEvent) => void;
  replaceAll: (events: readonly CalendarEvent[]) => void;
};

const EventsContext = createContext<EventsContextValue | null>(null);

/** A agenda começa vazia: só entra o que a pessoa marcar. */
const NO_EVENTS: readonly CalendarEvent[] = [];

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const { value: stored, setValue } = usePersistentState<readonly CalendarEvent[]>(
    storageKeys.events,
    NO_EVENTS,
  );

  const today = todayIso();

  // A contagem regressiva depende do dia de hoje, então é recalculada na
  // leitura em vez de ficar congelada no que foi salvo.
  const events = useMemo(() => refreshCountdowns(stored, today), [stored, today]);

  const add = useCallback(
    (title: string, date: string, category: EventCategory, meta: string) => {
      const event = createEvent(title, date, category, meta, today);
      setValue((current) => addEvent(current, event));
      return event;
    },
    [setValue, today],
  );

  const remove = useCallback(
    (id: string) => setValue((current) => removeEvent(current, id)),
    [setValue],
  );

  const restoreRemoved = useCallback(
    (event: CalendarEvent) => setValue((current) => addEvent(current, event)),
    [setValue],
  );

  const replaceAll = useCallback(
    (next: readonly CalendarEvent[]) => setValue(() => next),
    [setValue],
  );

  const value = useMemo(
    () => ({ events, add, remove, restoreRemoved, replaceAll }),
    [events, add, remove, restoreRemoved, replaceAll],
  );

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
}

export function useEvents(): EventsContextValue {
  const context = useContext(EventsContext);
  if (context === null) {
    throw new Error('useEvents precisa estar dentro de EventsProvider.');
  }
  return context;
}
