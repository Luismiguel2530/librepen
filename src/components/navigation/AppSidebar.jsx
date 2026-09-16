import {
  CloseIcon,
  ExportIcon,
  ImportIcon,
  InfoIcon,
  LibrePenMark,
  SettingsIcon,
  StarIcon,
} from "../icons/Icons";

import SettingsView from "./SettingsView";

function AppSidebar({
  open,
  view,
  settings,
  onViewChange,
  onSettingChange,
  onResetSettings,
  onClose,
}) {
  if (!open) {
    return null;
  }

  const closeSidebar = () => {
    onClose();
    onViewChange("menu");
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
      <aside className="sidebar" aria-label="LibrePen menu">
        {view === "settings" ? (
          <SettingsView
            settings={settings}
            onChange={onSettingChange}
            onReset={onResetSettings}
            onBack={() => onViewChange("menu")}
            onClose={closeSidebar}
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
              </div>

              <div className="sidebar-section">
                <span className="sidebar-section-label">Project</span>

                <button
                  type="button"
                  className="sidebar-item sidebar-item-coming"
                  disabled
                >
                  <ImportIcon />

                  <span className="sidebar-item-text">
                    <span>Import</span>
                    <small>Coming soon</small>
                  </span>
                </button>

                <button
                  type="button"
                  className="sidebar-item sidebar-item-coming"
                  disabled
                >
                  <ExportIcon />

                  <span className="sidebar-item-text">
                    <span>Export</span>
                    <small>Coming soon</small>
                  </span>
                </button>
              </div>
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
                onClick={() => {
                  window.alert(
                    "LibrePen\n\nA simple, open-source browser playground for HTML, CSS and JavaScript.",
                  );
                }}
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
