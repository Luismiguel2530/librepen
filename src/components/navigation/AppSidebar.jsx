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
  const settingsNavigationButtonRef = useRef(null);
  const trashNavigationButtonRef = useRef(null);
  const settingsBackButtonRef = useRef(null);
  const trashBackButtonRef = useRef(null);
  const trashRestoreButtonRefs = useRef(new Map());
  const trashDeleteButtonRefs = useRef(new Map());
  const previousViewRef = useRef(view);
  const previousFocusManagementPausedRef = useRef(focusManagementPaused);
  const pendingDeleteProjectIdRef = useRef(null);
  const pendingDeleteIndexRef = useRef(null);

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

  useLayoutEffect(() => {
    const previousView = previousViewRef.current;
    previousViewRef.current = view;

    if (!open || previousView === view) {
      return;
    }

    let focusTarget;

    if (view === "settings") {
      focusTarget = settingsBackButtonRef.current;
    } else if (view === "trash") {
      focusTarget = trashBackButtonRef.current;
    } else if (previousView === "settings") {
      focusTarget = settingsNavigationButtonRef.current;
    } else if (previousView === "trash") {
      focusTarget = trashNavigationButtonRef.current;
    }

    const animationFrame = requestAnimationFrame(() => {
      focusTarget?.focus();
    });

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [open, view]);

  useEffect(() => {
    const wasPaused = previousFocusManagementPausedRef.current;
    previousFocusManagementPausedRef.current = focusManagementPaused;

    if (
      !open ||
      focusManagementPaused ||
      !wasPaused ||
      view !== "trash"
    ) {
      return;
    }

    const deletedProjectIndex = pendingDeleteIndexRef.current;
    const deletedProjectId = pendingDeleteProjectIdRef.current;
    pendingDeleteIndexRef.current = null;
    pendingDeleteProjectIdRef.current = null;

    const animationFrame = requestAnimationFrame(() => {
      const sidebar = sidebarRef.current;

      if (!sidebar || sidebar.contains(document.activeElement)) {
        return;
      }

      const nearestProject =
        deletedProjectIndex === null || trash.length === 0
          ? null
          : trash[Math.min(deletedProjectIndex, trash.length - 1)];
      const cancelledProject =
        deletedProjectId === null
          ? null
          : trash.find((project) => project.id === deletedProjectId);
      const focusTarget =
        (cancelledProject &&
          trashDeleteButtonRefs.current.get(cancelledProject.id)) ||
        (nearestProject &&
          trashRestoreButtonRefs.current.get(nearestProject.id)) ||
        trashBackButtonRef.current ||
        sidebar;

      focusTarget.focus();
    });

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [focusManagementPaused, open, trash, view]);

  const registerTrashRestoreButton = useCallback((projectId, element) => {
    if (element) {
      trashRestoreButtonRefs.current.set(projectId, element);
    } else {
      trashRestoreButtonRefs.current.delete(projectId);
    }
  }, []);

  const registerTrashDeleteButton = useCallback((projectId, element) => {
    if (element) {
      trashDeleteButtonRefs.current.set(projectId, element);
    } else {
      trashDeleteButtonRefs.current.delete(projectId);
    }
  }, []);

  const handleDeleteForever = (projectId) => {
    pendingDeleteProjectIdRef.current = projectId;
    pendingDeleteIndexRef.current = trash.findIndex(
      (project) => project.id === projectId,
    );
    onDeleteForever(projectId);
  };

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
        aria-modal={focusManagementPaused ? undefined : "true"}
        aria-label="LibrePen menu"
        inert={focusManagementPaused}
        tabIndex={-1}
      >
        {view === "settings" ? (
          <SettingsView
            settings={settings}
            onChange={onSettingChange}
            onReset={onResetSettings}
            onBack={() => onViewChange("menu")}
            onClose={closeSidebar}
            backButtonRef={settingsBackButtonRef}
          />
        ) : view === "trash" ? (
          <TrashView
            trash={trash}
            onBack={() => onViewChange("menu")}
            onClose={closeSidebar}
            onRestoreProject={onRestoreProject}
            onDeleteForever={handleDeleteForever}
            backButtonRef={trashBackButtonRef}
            onRestoreButtonRef={registerTrashRestoreButton}
            onDeleteButtonRef={registerTrashDeleteButton}
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
                  ref={settingsNavigationButtonRef}
                  type="button"
                  className="sidebar-item"
                  onClick={() => onViewChange("settings")}
                >
                  <SettingsIcon />
                  <span>Settings</span>
                </button>

                <button
                  ref={trashNavigationButtonRef}
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
