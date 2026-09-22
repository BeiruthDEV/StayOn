import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Toast } from '@/components';
import { motion } from '@/theme';

type ToastState = {
  message: string;
  onUndo?: (() => void) | undefined;
};

type ToastContextValue = {
  /** Exibe um aviso temporário. `onUndo` habilita a ação "Desfazer". */
  showToast: (message: string, onUndo?: () => void) => void;
  hideToast: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

/** Distância entre o toast e a navegação inferior. */
const TOAST_OFFSET = 84;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();

  const clearPendingTimeout = useCallback(() => {
    if (timeout.current !== null) {
      clearTimeout(timeout.current);
      timeout.current = null;
    }
  }, []);

  const hideToast = useCallback(() => {
    clearPendingTimeout();
    setToast(null);
  }, [clearPendingTimeout]);

  const showToast = useCallback(
    (message: string, onUndo?: () => void) => {
      clearPendingTimeout();
      setToast({ message, onUndo });
      timeout.current = setTimeout(() => setToast(null), motion.toastDuration);
    },
    [clearPendingTimeout],
  );

  useEffect(() => clearPendingTimeout, [clearPendingTimeout]);

  const value = useMemo(() => ({ showToast, hideToast }), [showToast, hideToast]);

  const handleUndo = toast?.onUndo
    ? () => {
        toast.onUndo?.();
        hideToast();
      }
    : undefined;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <Toast message={toast.message} onUndo={handleUndo} bottom={insets.bottom + TOAST_OFFSET} />
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (context === null) {
    throw new Error('useToast precisa estar dentro de ToastProvider.');
  }
  return context;
}
