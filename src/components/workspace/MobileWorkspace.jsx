import ConsolePanel from "../console/ConsolePanel";
import CodeEditor from "../editors/CodeEditor";
import Panel from "../layout/Panel";
import Preview from "../preview/Preview";

const MOBILE_PANELS = [
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
  { id: "javascript", label: "JavaScript" },
  { id: "console", label: "Console" },
  { id: "preview", label: "Preview" },
];

function MobileWorkspace({
  activePanel,
  onActivePanelChange,
  code,
  onCodeChange,
  settings,
  onRun,
  onFormat,
  consoleMessages,
  onClearConsole,
  runningCode,
  runId,
}) {
  const activePanelConfig = MOBILE_PANELS.find(
    (panel) => panel.id === activePanel,
  );

  const renderActivePanel = () => {
    switch (activePanel) {
      case "html":
      case "css":
      case "javascript":
        return (
          <CodeEditor
            language={activePanel}
            value={code[activePanel]}
            onChange={(value) => onCodeChange(activePanel, value)}
            onRun={onRun}
            fontSize={settings.fontSize}
            wordWrap={settings.wordWrap}
            minimap={settings.minimap}
            onFormat={onFormat}
          />
        );
      case "console":
        return (
          <ConsolePanel
            messages={consoleMessages}
            onClear={onClearConsole}
          />
        );
      case "preview":
        return (
          <Preview
            html={runningCode.html}
            css={runningCode.css}
            javascript={runningCode.javascript}
            runId={runId}
          />
        );
      default:
        return null;
    }
  };

  return (
    <main className="mobile-workspace">
      <div className="mobile-tabs" role="tablist" aria-label="Workspace panels">
        {MOBILE_PANELS.map((panel) => {
          const isActive = panel.id === activePanel;

          return (
            <button
              key={panel.id}
              type="button"
              id={`mobile-tab-${panel.id}`}
              className={`mobile-tab ${isActive ? "active" : ""}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`mobile-panel-${panel.id}`}
              onClick={() => onActivePanelChange(panel.id)}
            >
              {panel.label}
            </button>
          );
        })}
      </div>

      {activePanelConfig && (
        <div
          id={`mobile-panel-${activePanel}`}
          className="mobile-panel"
          role="tabpanel"
          aria-labelledby={`mobile-tab-${activePanel}`}
        >
          <Panel title={activePanelConfig.label} showCloseButton={false}>
            {renderActivePanel()}
          </Panel>
        </div>
      )}
    </main>
  );
}

export default MobileWorkspace;
