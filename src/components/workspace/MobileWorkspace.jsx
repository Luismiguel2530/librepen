import { useRef } from "react";

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
  const tabRefs = useRef([]);
  const activePanelConfig = MOBILE_PANELS.find(
    (panel) => panel.id === activePanel,
  );

  const handleTabKeyDown = (event, currentIndex) => {
    let nextIndex;

    switch (event.key) {
      case "ArrowRight":
        nextIndex = (currentIndex + 1) % MOBILE_PANELS.length;
        break;
      case "ArrowLeft":
        nextIndex =
          (currentIndex - 1 + MOBILE_PANELS.length) % MOBILE_PANELS.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = MOBILE_PANELS.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();

    const nextPanel = MOBILE_PANELS[nextIndex];

    onActivePanelChange(nextPanel.id);
    tabRefs.current[nextIndex]?.focus();
  };

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
        {MOBILE_PANELS.map((panel, index) => {
          const isActive = panel.id === activePanel;

          return (
            <button
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              key={panel.id}
              type="button"
              id={`mobile-tab-${panel.id}`}
              className={`mobile-tab ${isActive ? "active" : ""}`}
              role="tab"
              aria-selected={isActive}
              aria-controls="mobile-active-panel"
              tabIndex={isActive ? 0 : -1}
              onClick={() => onActivePanelChange(panel.id)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
            >
              {panel.label}
            </button>
          );
        })}
      </div>

      {activePanelConfig && (
        <div
          id="mobile-active-panel"
          className="mobile-panel"
          role="tabpanel"
          aria-labelledby={`mobile-tab-${activePanel}`}
        >
          <Panel
            title={activePanelConfig.label}
            showHeader={false}
            showCloseButton={false}
          >
            {renderActivePanel()}
          </Panel>
        </div>
      )}
    </main>
  );
}

export default MobileWorkspace;
