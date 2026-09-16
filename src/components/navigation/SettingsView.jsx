import { BackIcon, CloseIcon } from "../icons/Icons";

function SettingsView({ settings, onChange, onReset, onBack, onClose }) {
  return (
    <>
      <div className="sidebar-header settings-header">
        <div className="settings-header-title">
          <button
            type="button"
            className="sidebar-close"
            onClick={onBack}
            aria-label="Back to menu"
            title="Back"
          >
            <BackIcon />
          </button>

          <strong>Settings</strong>
        </div>

        <button
          type="button"
          className="sidebar-close"
          onClick={onClose}
          aria-label="Close settings"
          title="Close"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="sidebar-content settings-content">
        <div className="settings-section">
          <span className="sidebar-section-label">Editor</span>

          <div className="setting-row setting-row-column">
            <div className="setting-row-heading">
              <div>
                <strong>Font size</strong>
                <small>Editor text size</small>
              </div>

              <span className="setting-value">{settings.fontSize}px</span>
            </div>

            <input
              type="range"
              min="12"
              max="20"
              step="1"
              value={settings.fontSize}
              onChange={(event) =>
                onChange("fontSize", Number(event.target.value))
              }
              aria-label="Editor font size"
            />
          </div>

          <label className="setting-row">
            <div>
              <strong>Word wrap</strong>
              <small>Wrap long lines</small>
            </div>

            <input
              className="setting-checkbox"
              type="checkbox"
              checked={settings.wordWrap}
              onChange={(event) => onChange("wordWrap", event.target.checked)}
            />
          </label>

          <label className="setting-row">
            <div>
              <strong>Minimap</strong>
              <small>Show code overview</small>
            </div>

            <input
              className="setting-checkbox"
              type="checkbox"
              checked={settings.minimap}
              onChange={(event) => onChange("minimap", event.target.checked)}
            />
          </label>
        </div>

        <div className="settings-section">
          <span className="sidebar-section-label">Execution</span>

          <label className="setting-row">
            <div>
              <strong>Auto Run</strong>
              <small>Run 600 ms after editing</small>
            </div>

            <input
              className="setting-checkbox"
              type="checkbox"
              checked={settings.autoRun}
              onChange={(event) => onChange("autoRun", event.target.checked)}
            />
          </label>
        </div>
      </div>

      <div className="settings-footer">
        <button
          type="button"
          className="reset-settings-button"
          onClick={onReset}
        >
          Reset to defaults
        </button>
      </div>
    </>
  );
}

export default SettingsView;
