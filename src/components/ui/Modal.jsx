import { useEffect, useRef } from "react";

const FOCUSABLE_ELEMENT_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  "[contenteditable='true']",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

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

    const previouslyFocusedElement = document.activeElement;

    return () => {
      if (
        previouslyFocusedElement?.isConnected &&
        typeof previouslyFocusedElement.focus === "function"
      ) {
        previouslyFocusedElement.focus();
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const modal = modalRef.current;

      if (!modal) {
        return;
      }

      const focusableElements = Array.from(
        modal.querySelectorAll(FOCUSABLE_ELEMENT_SELECTOR),
      ).filter((element) => {
        const styles = window.getComputedStyle(element);

        return (
          element.tabIndex >= 0 &&
          element.getAttribute("aria-hidden") !== "true" &&
          !element.closest("[inert]") &&
          styles.display !== "none" &&
          styles.visibility !== "hidden"
        );
      });

      if (focusableElements.length === 0) {
        event.preventDefault();
        modal.focus();
        return;
      }

      const firstFocusableElement = focusableElements[0];
      const lastFocusableElement =
        focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey) {
        if (
          activeElement === modal ||
          activeElement === firstFocusableElement ||
          !modal.contains(activeElement)
        ) {
          event.preventDefault();
          lastFocusableElement.focus();
        }
      } else if (
        activeElement === modal ||
        activeElement === lastFocusableElement ||
        !modal.contains(activeElement)
      ) {
        event.preventDefault();
        firstFocusableElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    const animationFrame = requestAnimationFrame(() => {
      const initialFocusElement = initialFocusRef?.current;

      if (
        initialFocusElement?.isConnected &&
        modalRef.current?.contains(initialFocusElement) &&
        typeof initialFocusElement.focus === "function" &&
        !initialFocusElement.matches(":disabled")
      ) {
        initialFocusElement.focus();
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
