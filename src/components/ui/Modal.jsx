import { useEffect, useRef } from "react";

function Modal({
  open,
  title,
  description,
  children,
  onClose,
  footer,
  initialFocusRef,
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    const animationFrame = requestAnimationFrame(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
        return;
      }

      modalRef.current?.focus();
    });

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      cancelAnimationFrame(animationFrame);
    };
  }, [open, onClose, initialFocusRef]);

  if (!open) {
    return null;
  }

  const handleBackdropMouseDown = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={handleBackdropMouseDown}>
      <div
        ref={modalRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="librepen-modal-title"
        aria-describedby={
          description ? "librepen-modal-description" : undefined
        }
        tabIndex={-1}
      >
        <div className="modal-header">
          <div className="modal-heading">
            <h2 id="librepen-modal-title">{title}</h2>

            {description && (
              <p id="librepen-modal-description">{description}</p>
            )}
          </div>

          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close dialog"
            title="Close"
          >
            ×
          </button>
        </div>

        <div className="modal-content">{children}</div>

        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export default Modal;
