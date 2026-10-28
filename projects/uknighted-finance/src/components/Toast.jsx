import { useEffect } from "react";

// A short message at the bottom of the screen, with an optional action like "Undo".
export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onClose, toast.action ? 6000 : 3000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  return (
    <div className="toast-region" aria-live="polite">
      {toast && (
        <div className="toast" key={toast.id}>
          <span>{toast.message}</span>
          {toast.action && (
            <button
              type="button"
              onClick={() => {
                toast.action.run();
                onClose();
              }}
            >
              {toast.action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
