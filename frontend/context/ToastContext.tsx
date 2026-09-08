'use client';

import { CheckCircle2, XCircle } from 'lucide-react';
import { createContext, useContext, useMemo, useState } from 'react';

type Toast = { id: number; text: string; type: 'success' | 'error' };
type ToastContextValue = { show: (text: string, type?: Toast['type']) => void };
const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const show = (text: string, type: Toast['type'] = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
  };
  const value = useMemo(() => ({ show }), []);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-24 z-[100] space-y-2">
        {toasts.map((toast) => (
          <div key={toast.id} className="flex max-w-sm items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium shadow-xl">
            {toast.type === 'success' ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <XCircle className="h-5 w-5 text-rose-600" />}
            {toast.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error('useToast must be used inside ToastProvider');
  return value;
}
