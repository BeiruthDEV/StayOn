import { createContext, useCallback, useContext, useMemo } from 'react';

import {
  addBlock,
  createBlock,
  editBlock,
  removeBlock,
  rescheduleBlock,
  setBlockStatus,
  sortByStart,
  type BlockStatus,
  type TimeBlock,
} from '@/domain/timeBlock';
import type { IconName } from '@/icons';
import { storageKeys, usePersistentState } from '@/storage';

type BlocksContextValue = {
  blocks: readonly TimeBlock[];
  /** Move um bloco para outro horário preservando a duração. */
  reschedule: (id: string, newStart: string) => void;
  /** Devolve um bloco ao estado anterior (ação de desfazer). */
  restoreBlock: (block: TimeBlock) => void;
  /** Cria um bloco e devolve o que foi criado. */
  add: (title: string, start: string, end: string, tag: string, icon: IconName) => TimeBlock;
  edit: (id: string, title: string, start: string, end: string, tag: string) => void;
  remove: (id: string) => void;
  /** Recoloca um bloco removido na agenda (ação de desfazer). */
  restoreRemoved: (block: TimeBlock) => void;
  setStatus: (id: string, status: BlockStatus) => void;
  replaceAll: (blocks: readonly TimeBlock[]) => void;
};

const BlocksContext = createContext<BlocksContextValue | null>(null);

/** A agenda começa vazia: só entra o que a pessoa planejar. */
const NO_BLOCKS: readonly TimeBlock[] = [];

export function BlocksProvider({ children }: { children: React.ReactNode }) {
  const { value: blocks, setValue } = usePersistentState<readonly TimeBlock[]>(
    storageKeys.blocks,
    NO_BLOCKS,
  );

  const reschedule = useCallback(
    (id: string, newStart: string) =>
      setValue((current) => rescheduleBlock(current, id, newStart)),
    [setValue],
  );

  const restoreBlock = useCallback(
    (block: TimeBlock) =>
      setValue((current) =>
        sortByStart(current.map((item) => (item.id === block.id ? block : item))),
      ),
    [setValue],
  );

  const add = useCallback(
    (title: string, start: string, end: string, tag: string, icon: IconName) => {
      const block = createBlock(title, start, end, tag, icon);
      setValue((current) => addBlock(current, block));
      return block;
    },
    [setValue],
  );

  const edit = useCallback(
    (id: string, title: string, start: string, end: string, tag: string) =>
      setValue((current) => editBlock(current, id, title, start, end, tag)),
    [setValue],
  );

  const remove = useCallback(
    (id: string) => setValue((current) => removeBlock(current, id)),
    [setValue],
  );

  const restoreRemoved = useCallback(
    (block: TimeBlock) => setValue((current) => addBlock(current, block)),
    [setValue],
  );

  const setStatus = useCallback(
    (id: string, status: BlockStatus) =>
      setValue((current) => setBlockStatus(current, id, status)),
    [setValue],
  );

  const replaceAll = useCallback(
    (next: readonly TimeBlock[]) => setValue(() => sortByStart(next)),
    [setValue],
  );

  const value = useMemo(
    () => ({
      blocks,
      reschedule,
      restoreBlock,
      add,
      edit,
      remove,
      restoreRemoved,
      setStatus,
      replaceAll,
    }),
    [blocks, reschedule, restoreBlock, add, edit, remove, restoreRemoved, setStatus, replaceAll],
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
