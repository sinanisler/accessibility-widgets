"use client";

import { clsx } from "clsx";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { createContext, useCallback, useContext, useRef, useState, type PropsWithChildren } from "react";

type Tone = "success" | "error";
type ToastState = { id: number; message: string; tone: Tone } | null;

const ToastContext = createContext<(message: string, tone?: Tone) => void>(() => undefined);

const TOAST_MS = 5000;

export function ToastProvider({ children }: PropsWithChildren) {
  const [toast, setToast] = useState<ToastState>(null);
  const timer = useRef<number>(0);

  const show = useCallback((message: string, tone: Tone = "success") => {
    window.clearTimeout(timer.current);
    setToast({ id: Date.now(), message, tone });
    timer.current = window.setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  const Icon = toast?.tone === "error" ? AlertCircle : CheckCircle2;

  return (
    <ToastContext.Provider value={show}>
      {children}
      {/* Always mounted so screen readers pick up each new message. */}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4"
      >
        {toast && (
          <div
            key={toast.id}
            className={clsx(
              "pointer-events-auto flex max-w-md items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-pop",
              toast.tone === "error" ? "bg-red-800 text-white" : "bg-ink-900 text-ink-50",
            )}
          >
            <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
            {toast.message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
