"use client";

import React from "react";

type ToastVariant = "success" | "error" | "info";

export type Toast = {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  timeoutMs?: number;
};

type ToastContextValue = {
  toast: (t: Omit<Toast, "id">) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const remove = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback(
    (t: Omit<Toast, "id">) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const toastObj: Toast = {
        id,
        variant: "info",
        timeoutMs: 3500,
        ...t,
      };
      setToasts((prev) => [...prev, toastObj]);
      const timeout = toastObj.timeoutMs ?? 0;
      if (timeout > 0) window.setTimeout(() => remove(id), timeout);
    },
    [remove]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed z-[9999] right-4 top-4 flex flex-col gap-2 w-[340px] max-w-[calc(100vw-2rem)]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={
              "rounded-2xl border bg-white/90 backdrop-blur px-4 py-3 shadow-lg " +
              (t.variant === "success"
                ? "border-emerald-200"
                : t.variant === "error"
                  ? "border-rose-200"
                  : "border-slate-200")
            }
          >
            <div className="flex items-start gap-3">
              <div
                className={
                  "mt-1 h-2 w-2 rounded-full " +
                  (t.variant === "success"
                    ? "bg-emerald-500"
                    : t.variant === "error"
                      ? "bg-rose-500"
                      : "bg-sky-500")
                }
              />
              <div className="flex-1">
                <div className="text-sm font-semibold text-[var(--ink)]">
                  {t.title}
                </div>
                {t.description ? (
                  <div className="text-xs mt-0.5 text-[rgba(15,23,42,0.7)]">
                    {t.description}
                  </div>
                ) : null}
              </div>
              <button
                onClick={() => remove(t.id)}
                className="text-xs text-[rgba(15,23,42,0.55)] hover:text-[rgba(15,23,42,0.8)]"
                aria-label="Закрыть"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
