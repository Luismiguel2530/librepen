import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

import {
  CloseIcon,
  ExportIcon,
  ImportIcon,
  InfoIcon,
  LibrePenMark,
  SettingsIcon,
  StarIcon,
  FormatIcon,
} from "../icons/Icons";

import SettingsView from "./SettingsView";
import TrashView from "./TrashView";

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

function AppSidebar({
  open,
  triggerRef,
  focusManagementPaused,
  view,
  settings,
  trash,
  onViewChange,
  onSettingChange,
  onResetSettings,
  onImportProject,
  onExportProject,
  onClose,
  onFormatCode,
  onOpenAbout,
  onRestoreProject,
  onDeleteForever,
}) {
  const sidebarRef = useRef(null);
  const closeButtonRef = useRef(null);

  const closeSidebar = useCallback(() => {
    onClose();
    onViewChange("menu");
  }, [onClose, onViewChange]);

  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    const triggerElement = triggerRef?.current;

    const animationFrame = requestAnimationFrame(() => {
      const initialFocusElement =
        closeButtonRef.current ?? sidebarRef.current;

      initialFocusElement?.focus();
    });

    return () => {
      cancelAnimationFrame(animationFrame);

      if (
        triggerElement?.isConnected &&
        typeof triggerElement.focus === "function"
      ) {
        triggerElement.focus();
      }
    };
  }, [open, triggerRef]);

  useEffect(() => {
    if (!open || focusManagementPaused) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeSidebar();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const sidebar = sidebarRef.current;

      if (!sidebar) {
        return;
      }

      const focusableElements = Array.from(
        sidebar.querySelectorAll(FOCUSABLE_ELEMENT_SELECTOR),
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
        sidebar.focus();
        return;
      }

      const firstFocusableElement = focusableElements[0];
      const lastFocusableElement =
        focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey) {
        if (
          activeElement === sidebar ||
          activeElement === firstFocusableElement ||
          !sidebar.contains(activeElement)
        ) {
          event.preventDefault();
          lastFocusableElement.focus();
        }
      } else if (
        activeElement === sidebar ||
        activeElement === lastFocusableElement ||
        !sidebar.contains(activeElement)
      ) {
        event.preventDefault();
        firstFocusableElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeSidebar, focusManagementPaused, open]);

  if (!open) {
    return null;
  }

  const handleOpenAbout = () => {
    closeSidebar();
    onOpenAbout();
  };

  return (
    <div
      className="sidebar-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeSidebar();
        }
      }}
    >
      <aside
        id="librepen-sidebar"
        ref={sidebarRef}
        className="sidebar"
        role="dialog"
        aria-modal="true"
        aria-label="LibrePen menu"
        tabIndex={-1}
      >
        {view === "settings" ? (
          <SettingsView
            settings={settings}
            onChange={onSettingChange}
            onReset={onResetSettings}
            onBack={() => onViewChange("menu")}
            onClose={closeSidebar}
          />
        ) : view === "trash" ? (
          <TrashView
            trash={trash}
            onBack={() => onViewChange("menu")}
            onClose={closeSidebar}
            onRestoreProject={onRestoreProject}
            onDeleteForever={onDeleteForever}
          />
        ) : (
          <>
            <div className="sidebar-header">
              <div className="sidebar-brand">
                <LibrePenMark />

                <div>
                  <strong>LibrePen</strong>
                  <span>Browser playground</span>
                </div>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                className="sidebar-close"
                onClick={closeSidebar}
                aria-label="Close menu"
                title="Close menu"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="sidebar-content">
              <div className="sidebar-section">
                <span className="sidebar-section-label">Workspace</span>

                <button
                  type="button"
                  className="sidebar-item"
                  onClick={() => onViewChange("settings")}
                >
                  <SettingsIcon />
                  <span>Settings</span>
                </button>

                <button
                  type="button"
                  className="sidebar-item"
                  onClick={() => onViewChange("trash")}
                >
                  <span className="sidebar-trash-icon" aria-hidden="true">
                    ♲
                  </span>

                  <span className="sidebar-item-text">
                    <span>Trash</span>

                    {trash.length > 0 && (
                      <small>
                        {trash.length}{" "}
                        {trash.length === 1 ? "project" : "projects"}
                      </small>
                    )}
                  </span>
                </button>
              </div>

              <div className="sidebar-section">
                <span className="sidebar-section-label">Project</span>

                <button
                  type="button"
                  className="sidebar-item"
                  onClick={onImportProject}
                >
                  <ImportIcon />
                  <span>Import project</span>
                </button>

                <button
                  type="button"
                  className="sidebar-item"
                  onClick={onExportProject}
                >
                  <ExportIcon />
                  <span>Export project</span>
                </button>
              </div>

              <button
                type="button"
                className="sidebar-item"
                onClick={onFormatCode}
              >
                <FormatIcon />

                <span className="sidebar-item-text">
                  <span>Format code</span>
                  <small>Shift + Alt + F</small>
                </span>
              </button>
            </div>

            <div className="sidebar-footer">
              <a
                className="sidebar-item sidebar-link"
                href="https://github.com/Luismiguel2530/librepen"
                target="_blank"
                rel="noopener noreferrer"
                title="Open LibrePen on GitHub"
              >
                <StarIcon />
                <span>Star on GitHub</span>
              </a>

              <button
                type="button"
                className="sidebar-item"
                onClick={handleOpenAbout}
              >
                <InfoIcon />
                <span>About LibrePen</span>
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

export default AppSidebar;
