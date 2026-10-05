import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { EXTENSION_MINUTES } from '@/domain/focusSession';

/** Em que ponto a sessão está. */
export type SessionStatus = 'idle' | 'running' | 'paused';

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
  | { status: 'running'; total: number; endsAt: number; pauses: number }
  | { status: 'paused'; total: number; remaining: number; pauses: number };

const IDLE: SessionState = { status: 'idle' };

/** Segundos restantes do estado, medidos contra o relógio quando em andamento. */
function remainingOf(state: SessionState, now: number): number {
  if (state.status === 'idle') return 0;
  if (state.status === 'paused') return state.remaining;
  return Math.max(0, Math.round((state.endsAt - now) / 1000));
}

type FocusSession = {
  status: SessionStatus;
  /** Segundos restantes da sessão. */
  remaining: number;
  /** Duração total, já considerando as extensões. */
  total: number;
  /** Segundos já focados. */
  elapsed: number;
  /** Quantas vezes a sessão foi pausada — as interrupções da sessão. */
  pauses: number;
  /** Horário em que a sessão termina, ou zero se não há sessão correndo. */
  endsAt: number;
  /** Começa uma sessão com a duração escolhida. */
  start: (minutes: number) => void;
  /** Alterna entre pausado e em andamento. */
  togglePause: () => void;
  /** Acrescenta EXTENSION_MINUTES ao tempo restante e ao total. */
  extend: () => void;
  /** Encerra e volta ao estado de montar uma nova sessão. */
  stop: () => void;
};

/**
 * Cronômetro regressivo da sessão de foco.
 * Nasce parado: a sessão só começa quando a pessoa monta e inicia.
 */
export function useFocusSession(): FocusSession {
  const [state, setState] = useState<SessionState>(IDLE);
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

  const start = useCallback((minutes: number) => {
    const seconds = Math.max(1, Math.round(minutes)) * 60;
    const agora = Date.now();

    setNow(agora);
    setState({ status: 'running', total: seconds, endsAt: agora + seconds * 1000, pauses: 0 });
  }, []);

  const togglePause = useCallback(() => {
    // O horário é lido aqui fora: o atualizador de estado precisa ser função
    // pura, porque o React pode executá-lo mais de uma vez.
    const agora = Date.now();

    setNow(agora);
    setState((current) => {
      if (current.status === 'running') {
        return {
          status: 'paused',
          total: current.total,
          remaining: remainingOf(current, agora),
          pauses: current.pauses + 1,
        };
      }

      if (current.status === 'paused') {
        return {
          status: 'running',
          total: current.total,
          endsAt: agora + current.remaining * 1000,
          pauses: current.pauses,
        };
      }

      return current;
    });
  }, []);

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
  }, []);

  const stop = useCallback(() => setState(IDLE), []);

  const total = state.status === 'idle' ? 0 : state.total;

  return {
    status: state.status,
    remaining,
    total,
    elapsed: total - remaining,
    pauses: state.status === 'idle' ? 0 : state.pauses,
    endsAt: state.status === 'running' ? state.endsAt : 0,
    start,
    togglePause,
    extend,
    stop,
  };
}
