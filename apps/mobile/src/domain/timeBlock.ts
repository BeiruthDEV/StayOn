import type { IconName } from '@/icons';

/** Situação de um bloco na agenda do dia. */
export type BlockStatus = 'done' | 'missed' | 'upcoming';

/** Bloco de tempo planejado na linha do tempo. */
export type TimeBlock = {
  id: string;
  title: string;
  /** Início no formato HH:MM. */
  start: string;
  /** Fim no formato HH:MM. */
  end: string;
  /** Área a que o bloco pertence, exibida como etiqueta. */
  tag: string;
  icon: IconName;
  status: BlockStatus;
};

/** Converte HH:MM em minutos desde a meia-noite. */
export function toMinutes(time: string): number {
  const [hours = '0', minutes = '0'] = time.split(':');
  return Number(hours) * 60 + Number(minutes);
}

/** Converte minutos desde a meia-noite em HH:MM. */
export function toTime(minutes: number): string {
  const wrapped = ((minutes % 1440) + 1440) % 1440;
  const hours = Math.floor(wrapped / 60);
  const rest = wrapped % 60;
  return `${String(hours).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

/** Duração do bloco em minutos. */
export function durationOf(block: TimeBlock): number {
  return toMinutes(block.end) - toMinutes(block.start);
}

/** Duração legível: "2h", "30m" ou "1h 30m". */
export function durationLabel(block: TimeBlock): string {
  const total = durationOf(block);
  const hours = Math.floor(total / 60);
  const minutes = total % 60;

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

/** Linha de horário do bloco: "08:00 – 10:00 · 2h". */
export function scheduleLabel(block: TimeBlock): string {
  return `${block.start} – ${block.end} · ${durationLabel(block)}`;
}

/** Ordena os blocos pelo horário de início. */
export function sortByStart(blocks: readonly TimeBlock[]): TimeBlock[] {
  return [...blocks].sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
}

/** Primeiro bloco perdido do dia, se houver. */
export function findMissed(blocks: readonly TimeBlock[]): TimeBlock | undefined {
  return sortByStart(blocks).find((block) => block.status === 'missed');
}

/**
 * Move um bloco para um novo horário preservando a duração.
 * O bloco reagendado volta a ser um compromisso futuro.
 */
export function rescheduleBlock(
  blocks: readonly TimeBlock[],
  id: string,
  newStart: string,
): TimeBlock[] {
  return sortByStart(
    blocks.map((block) => {
      if (block.id !== id) return block;
      return {
        ...block,
        start: newStart,
        end: toTime(toMinutes(newStart) + durationOf(block)),
        status: 'upcoming',
      };
    }),
  );
}
