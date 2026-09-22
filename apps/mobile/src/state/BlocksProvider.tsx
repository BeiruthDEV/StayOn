import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { initialBlocks } from '@/data/planner';
import { rescheduleBlock, sortByStart, type TimeBlock } from '@/domain/timeBlock';

type BlocksContextValue = {
  blocks: readonly TimeBlock[];
  /** Move um bloco para outro horário preservando a duração. */
  reschedule: (id: string, newStart: string) => void;
  /** Devolve um bloco ao estado anterior (ação de desfazer). */
  restoreBlock: (block: TimeBlock) => void;
};

const BlocksContext = createContext<BlocksContextValue | null>(null);

export function BlocksProvider({ children }: { children: React.ReactNode }) {
  const [blocks, setBlocks] = useState<readonly TimeBlock[]>(() => sortByStart(initialBlocks));

  const reschedule = useCallback((id: string, newStart: string) => {
    setBlocks((current) => rescheduleBlock(current, id, newStart));
  }, []);

  const restoreBlock = useCallback((block: TimeBlock) => {
    setBlocks((current) =>
      sortByStart(current.map((item) => (item.id === block.id ? block : item))),
    );
  }, []);

  const value = useMemo(
    () => ({ blocks, reschedule, restoreBlock }),
    [blocks, reschedule, restoreBlock],
  );

  return <BlocksContext.Provider value={value}>{children}</BlocksContext.Provider>;
}

export function useBlocks(): BlocksContextValue {
  const context = useContext(BlocksContext);
  if (context === null) {
    throw new Error('useBlocks precisa estar dentro de BlocksProvider.');
  }
  return context;
}
