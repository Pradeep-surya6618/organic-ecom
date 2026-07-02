import React, { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";

/**
 * Promise-based confirmation dialog.
 *
 *   const { confirm, confirmDialog } = useConfirm();
 *   const onDelete = async () => {
 *     if (!(await confirm({ title: "Delete blog?", message: "…" }))) return;
 *     // …proceed
 *   };
 *   return <>…{confirmDialog}</>;
 */
export default function useConfirm() {
  const [state, setState] = useState(null); // { title, message, confirmLabel, resolve }

  const confirm = useCallback((opts = {}) => {
    return new Promise((resolve) => {
      setState({
        title: opts.title || "Are you sure?",
        message: opts.message || "This action cannot be undone.",
        confirmLabel: opts.confirmLabel || "Delete",
        cancelLabel: opts.cancelLabel || "Cancel",
        resolve,
      });
    });
  }, []);

  const close = useCallback((result) => {
    setState((prev) => {
      if (prev?.resolve) prev.resolve(result);
      return null;
    });
  }, []);

  useEffect(() => {
    if (!state) return undefined;
    const onKey = (e) => { if (e.key === "Escape") close(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state, close]);

  const confirmDialog = state
    ? createPortal(
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => close(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
          >
            <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={22} />
            </div>
            <h3 className="text-base font-black text-stone-900 text-center mt-4">{state.title}</h3>
            <p className="text-xs font-medium text-stone-500 text-center mt-2 leading-relaxed">{state.message}</p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => close(false)}
                className="flex-1 h-11 rounded-xl border border-stone-200 text-xs font-black text-stone-600 hover:bg-stone-50 transition cursor-pointer"
              >
                {state.cancelLabel}
              </button>
              <button
                onClick={() => close(true)}
                autoFocus
                className="flex-1 h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black transition cursor-pointer"
              >
                {state.confirmLabel}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return { confirm, confirmDialog };
}
