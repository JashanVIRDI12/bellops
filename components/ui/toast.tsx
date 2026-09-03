'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error';

interface ToastItem {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastInput {
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  toast: (input: ToastInput) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((input: ToastInput) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, ...input }]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-[10000] flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0 pointer-events-none"
      >
        {toasts.map((item) => (
          <ToastCard key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: number) => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const enter = requestAnimationFrame(() => setVisible(true));
    const timer = window.setTimeout(() => {
      setVisible(false);
      window.setTimeout(() => onDismiss(item.id), 300);
    }, 4500);

    return () => {
      cancelAnimationFrame(enter);
      window.clearTimeout(timer);
    };
  }, [item.id, onDismiss]);

  const isSuccess = item.type === 'success';

  return (
    <div
      role="status"
      className={cn(
        'pointer-events-auto flex items-start gap-3 rounded-lg border bg-white px-4 py-3 shadow-[0_12px_32px_-18px_rgba(11,26,43,0.35)] transition-all duration-300',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
        isSuccess
          ? 'border-green-600/25 text-green-900'
          : 'border-red-600/25 text-red-900'
      )}
    >
      {isSuccess ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
      ) : (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
      )}

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{item.title}</p>
        {item.message ? (
          <p className="mt-0.5 text-xs opacity-80">{item.message}</p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => {
          setVisible(false);
          window.setTimeout(() => onDismiss(item.id), 200);
        }}
        className="shrink-0 rounded-md p-1 opacity-60 transition-opacity hover:opacity-100"
        aria-label="Dismiss notification"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}
