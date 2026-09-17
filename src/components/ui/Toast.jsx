import { useEffect } from "react";

function Toast({ message, type = "info", onClose, duration = 4000 }) {
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [duration, onClose]);

  return (
    <div
      className={`toast toast-${type}`}
      role={type === "error" ? "alert" : "status"}
      aria-live={type === "error" ? "assertive" : "polite"}
    >
      <div className="toast-content">
        <span className="toast-indicator" />

        <span className="toast-message">{message}</span>
      </div>

      <button
        type="button"
        className="toast-close"
        onClick={onClose}
        aria-label="Dismiss notification"
        title="Dismiss"
      >
        ×
      </button>
    </div>
  );
}

export default Toast;
