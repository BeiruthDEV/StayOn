import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { EXTENSION_MINUTES } from '@/domain/focusSession';
import { storageKeys, usePersistentState } from '@/storage';

/** Em que ponto a sessão está. */
export type SessionStatus = 'idle' | 'running' | 'paused';

/** O que uma sessão carrega, independente de estar correndo ou pausada. */
type Active = {
  /** No que a pessoa escolheu focar. */
  label: string;
  /** Duração total, já considerando as extensões. */
  total: number;
  /** Quantas vezes a sessão foi pausada — as interrupções da sessão. */
  pauses: number;
  /** Bloco da agenda vinculado, marcado como concluído no fim. */
  blockId?: string;
};

/**
 * A sessão em andamento guarda o horário em que termina, e não quantos
 * segundos faltam. A diferença importa porque o cenário normal deste
 * aplicativo é a pessoa sair dele no meio da sessão para tentar abrir outro
 * app: com a tela em segundo plano o sistema estrangula o JavaScript, e uma
 * contagem feita de segundo em segundo atrasaria. Lendo o relógio, o tempo
 * restante está sempre correto, inclusive no instante em que a pessoa volta.
 *
 * Pausada, a sessão guarda o que sobrou; ao retomar, um novo horário de
 * término é calculado a partir dali.
 */
type SessionState =
  | { status: 'idle' }
  | ({ status: 'running'; endsAt: number } & Active)
  | ({ status: 'paused'; remaining: number } & Active);

const IDLE: SessionState = { status: 'idle' };

/** Segundos restantes do estado, medidos contra o relógio quando em andamento. */
function remainingOf(state: SessionState, now: number): number {
  if (state.status === 'idle') return 0;
  if (state.status === 'paused') return state.remaining;
  return Math.max(0, Math.round((state.endsAt - now) / 1000));
}

type FocusSession = {
  status: SessionStatus;
  /** Falso até a sessão salva ser lida do disco. */
  hydrated: boolean;
  label: string;
  /** Segundos restantes da sessão. */
  remaining: number;
  total: number;
  /** Segundos já focados. */
  elapsed: number;
  pauses: number;
  /** Horário em que a sessão termina, ou zero se não há sessão correndo. */
  endsAt: number;
  blockId: string | undefined;
  /** Começa uma sessão com a duração, o rótulo e o bloco escolhidos. */
  start: (minutes: number, label: string, blockId?: string) => void;
  /** Alterna entre pausado e em andamento. */
  togglePause: () => void;
  /** Acrescenta EXTENSION_MINUTES ao tempo restante e ao total. */
  extend: () => void;
  /** Encerra e volta ao estado de montar uma nova sessão. */
  stop: () => void;
};

/**
 * Cronômetro regressivo da sessão de foco.
 *
 * A sessão fica salva no aparelho, e não apenas na memória da tela. Sem isso,
 * fechar o StayOn à força seria um jeito trivial de derrubar o bloqueio: o
 * aplicativo reabriria sem sessão nenhuma e liberaria tudo.
 */
export function useFocusSession(): FocusSession {
  const { value: state, setValue: setState, hydrated } = usePersistentState<SessionState>(
    storageKeys.focusSession,
    IDLE,
  );
  const [now, setNow] = useState(() => Date.now());

  const running = state.status === 'running';
  const remaining = remainingOf(state, now);
  const finished = running && remaining === 0;

  // Reler o relógio é o que redesenha a tela. Além do intervalo, o retorno do
  // aplicativo ao primeiro plano força uma leitura, para o número aparecer
  // certo de imediato em vez de só no próximo segundo.
  useEffect(() => {
    if (!running || finished) return;

    const interval = setInterval(() => setNow(Date.now()), 1000);
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'active') setNow(Date.now());
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [running, finished]);

  const start = useCallback(
    (minutes: number, label: string, blockId?: string) => {
      const seconds = Math.max(1, Math.round(minutes)) * 60;
      const agora = Date.now();

      setNow(agora);
      setState({
        status: 'running',
        label,
        total: seconds,
        endsAt: agora + seconds * 1000,
        pauses: 0,
        ...(blockId === undefined ? {} : { blockId }),
      });
    },
    [setState],
  );

  const togglePause = useCallback(() => {
    // O horário é lido aqui fora: o atualizador de estado precisa ser função
    // pura, porque o React pode executá-lo mais de uma vez.
    const agora = Date.now();

    setNow(agora);
    setState((current) => {
      if (current.status === 'running') {
        const { status, endsAt, ...resto } = current;
        return { ...resto, status: 'paused', remaining: remainingOf(current, agora), pauses: resto.pauses + 1 };
      }

      if (current.status === 'paused') {
        const { status, remaining: sobrou, ...resto } = current;
        return { ...resto, status: 'running', endsAt: agora + sobrou * 1000 };
      }

      return current;
    });
  }, [setState]);

  const extend = useCallback(() => {
    const extra = EXTENSION_MINUTES * 60;
    const agora = Date.now();

    setNow(agora);
    setState((current) => {
      if (current.status === 'running') {
        // Com o tempo já esgotado o término ficou no passado, e somar a partir
        // dele daria menos que os minutos prometidos.
        const partida = Math.max(current.endsAt, agora);
        return { ...current, total: current.total + extra, endsAt: partida + extra * 1000 };
      }

      if (current.status === 'paused') {
        return { ...current, total: current.total + extra, remaining: current.remaining + extra };
      }

      return current;
    });
  }, [setState]);

  const stop = useCallback(() => setState(IDLE), [setState]);

  const total = state.status === 'idle' ? 0 : state.total;

  return {
    status: state.status,
    hydrated,
    label: state.status === 'idle' ? '' : state.label,
    remaining,
    total,
    elapsed: total - remaining,
    pauses: state.status === 'idle' ? 0 : state.pauses,
    endsAt: state.status === 'running' ? state.endsAt : 0,
    blockId: state.status === 'idle' ? undefined : state.blockId,
    start,
    togglePause,
    extend,
    stop,
  };
}
