import { useEffect, useState } from "react";

function Toast({ message, type = "info", onClose, duration = 4000 }) {
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocusWithin, setHasFocusWithin] = useState(false);
  const isPaused = isHovered || hasFocusWithin;

  useEffect(() => {
    if (isPaused) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [duration, isPaused, onClose]);

  return (
    <div
      className={`toast toast-${type}`}
      role={type === "error" ? "alert" : "status"}
      aria-live={type === "error" ? "assertive" : "polite"}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      onFocusCapture={() => setHasFocusWithin(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setHasFocusWithin(false);
        }
      }}
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
