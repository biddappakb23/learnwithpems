import React, { useEffect, useState } from "react";

let activeToastTimeout: any = null;
let toastListeners: Array<(msg: string | null) => void> = [];

export function notifyCopyRestricted(
  message = "Copying lesson content to clipboard is disabled for academic copyright & integrity protection."
) {
  toastListeners.forEach((fn) => fn(message));
  if (activeToastTimeout) clearTimeout(activeToastTimeout);
  activeToastTimeout = setTimeout(() => {
    toastListeners.forEach((fn) => fn(null));
  }, 3500);
}

export function subscribeToCopyProtectionToast(listener: (msg: string | null) => void) {
  toastListeners.push(listener);
  return () => {
    toastListeners = toastListeners.filter((fn) => fn !== listener);
  };
}

/**
 * Event handler for copy/cut/contextmenu events on protected elements
 */
export function handleProtectedCopy(e: React.ClipboardEvent | ClipboardEvent) {
  const target = e.target as HTMLElement | null;
  // Allow copying from interactive code playgrounds, inputs, textareas, and admin editors
  if (
    target &&
    (target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable ||
      target.closest("input") ||
      target.closest("textarea") ||
      target.closest(".allow-copy") ||
      target.closest(".monaco-editor") ||
      target.closest("[contenteditable='true']"))
  ) {
    return;
  }

  e.preventDefault();
  if (e.clipboardData) {
    e.clipboardData.clearData();
  }
  notifyCopyRestricted();
}

/**
 * React hook to enforce clipboard copy protection on document or component wrapper
 */
export function useClipboardProtection(isEnabled = true) {
  useEffect(() => {
    if (!isEnabled) return;

    const onCopy = (e: ClipboardEvent) => {
      handleProtectedCopy(e);
    };

    const onCut = (e: ClipboardEvent) => {
      handleProtectedCopy(e);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+C or Cmd+C
      if ((e.ctrlKey || e.metaKey) && (e.key === "c" || e.key === "C" || e.key === "x" || e.key === "X")) {
        const target = e.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable ||
            target.closest("input") ||
            target.closest("textarea") ||
            target.closest(".allow-copy") ||
            target.closest(".monaco-editor") ||
            target.closest("[contenteditable='true']"))
        ) {
          return;
        }

        const selectedText = window.getSelection()?.toString();
        if (selectedText && selectedText.trim().length > 0) {
          e.preventDefault();
          notifyCopyRestricted();
        }
      }
    };

    document.addEventListener("copy", onCopy);
    document.addEventListener("cut", onCut);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("cut", onCut);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isEnabled]);
}

/**
 * Toast Component to display copy protection alert
 */
export const CopyProtectionToast: React.FC = () => {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    return subscribeToCopyProtectionToast((msg) => setMessage(msg));
  }, []);

  if (!message) return null;

  return (
    <div
      id="copy-protection-toast"
      className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900/95 text-white border border-amber-500/50 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-in slide-in-from-bottom duration-200"
    >
      <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>
      <div className="text-xs">
        <div className="font-bold text-amber-300">Clipboard Copy Restricted</div>
        <div className="text-slate-300 mt-0.5">{message}</div>
      </div>
    </div>
  );
};
