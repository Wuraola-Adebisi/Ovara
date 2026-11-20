import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

type ToastAction = { label: string; run: () => void };
type ToastState = { id: number; message: string; action?: ToastAction };
type ToastApi = { show: (message: string, action?: ToastAction) => void };

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<number>();

  const dismiss = useCallback(() => setToast(null), []);
  const show = useCallback((message: string, action?: ToastAction) => {
    window.clearTimeout(timer.current);
    setToast({ id: Date.now(), message, action });
    timer.current = window.setTimeout(() => setToast(null), 7000);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return <ToastContext.Provider value={{ show }}>
    {children}
    <div className="toast-region" role="status" aria-live="polite">
      {toast && <div className="toast" key={toast.id}>
        <span>{toast.message}</span>
        {toast.action && <button type="button" className="toast-action" onClick={() => { toast.action?.run(); dismiss(); }}>{toast.action.label}</button>}
        <button type="button" className="toast-close" aria-label="Dismiss message" onClick={dismiss}><X size={16}/></button>
      </div>}
    </div>
  </ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider.');
  return context;
}
