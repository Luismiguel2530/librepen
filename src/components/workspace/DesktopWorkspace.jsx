import { useEffect, useRef } from "react";
import { Group, Panel as ResizablePanel, Separator } from "react-resizable-panels";

import ConsolePanel from "../console/ConsolePanel";
import CodeEditor from "../editors/CodeEditor";
import Panel from "../layout/Panel";
import Preview from "../preview/Preview";

function DesktopWorkspace({
  visiblePanels,
  currentLayoutKey,
  layoutResetVersion,
  currentPanelLayout,
  onLayoutChanged,
  code,
  onCodeChange,
  onRun,
  onFormat,
  settings,
  consoleMessages,
  onClearConsole,
  runningCode,
  runId,
  onTogglePanel,
  onFocusPanelToggle,
}) {
  const previewPanelRef = useRef(null);

  const closePanel = (panelName) => {
    onTogglePanel(panelName);
    onFocusPanelToggle(panelName);
  };

  // Keep Preview visually collapsed when other panels change.
  useEffect(() => {
    const previewPanel = previewPanelRef.current;

    if (!previewPanel) {
      return;
    }

    const syncPreviewState = () => {
      if (visiblePanels.preview) {
        previewPanel.expand();
      } else {
        previewPanel.collapse();
      }
    };

    syncPreviewState();

    const animationFrame = requestAnimationFrame(syncPreviewState);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [
    visiblePanels.preview,
    visiblePanels.html,
    visiblePanels.css,
    visiblePanels.javascript,
    visiblePanels.console,
  ]);

  return (
    <main className="workspace">
      <Group
        key={layoutResetVersion}
        id={`librepen-workspace-${currentLayoutKey}`}
        orientation="horizontal"
        className="panel-group"
        defaultLayout={currentPanelLayout}
        onLayoutChanged={onLayoutChanged}
      >
        {visiblePanels.html && (
          <>
            <ResizablePanel id="html" minSize="15%">
              <Panel title="HTML" onClose={() => closePanel("html")}>
                <CodeEditor
                  language="html"
                  value={code.html}
                  onChange={(value) => onCodeChange("html", value)}
                  onRun={onRun}
                  fontSize={settings.fontSize}
                  wordWrap={settings.wordWrap}
                  minimap={settings.minimap}
                  onFormat={onFormat}
                />
              </Panel>
            </ResizablePanel>
            <Separator className="resize-handle" />
          </>
        )}

        {visiblePanels.css && (
          <>
            <ResizablePanel id="css" minSize="15%">
              <Panel title="CSS" onClose={() => closePanel("css")}>
                <CodeEditor
                  language="css"
                  value={code.css}
                  onChange={(value) => onCodeChange("css", value)}
                  onRun={onRun}
                  fontSize={settings.fontSize}
                  wordWrap={settings.wordWrap}
                  minimap={settings.minimap}
                  onFormat={onFormat}
                />
              </Panel>
            </ResizablePanel>
            <Separator className="resize-handle" />
          </>
        )}

        {visiblePanels.javascript && (
          <>
            <ResizablePanel id="javascript" minSize="15%">
              <Panel title="JavaScript" onClose={() => closePanel("javascript")}>
                <CodeEditor
                  language="javascript"
                  value={code.javascript}
                  onChange={(value) => onCodeChange("javascript", value)}
                  onRun={onRun}
                  fontSize={settings.fontSize}
                  wordWrap={settings.wordWrap}
                  minimap={settings.minimap}
                  onFormat={onFormat}
                />
              </Panel>
            </ResizablePanel>
            <Separator className="resize-handle" />
          </>
        )}

        {visiblePanels.console && (
          <>
            <ResizablePanel id="console" minSize="15%">
              <Panel title="Console" onClose={() => closePanel("console")}>
                <ConsolePanel messages={consoleMessages} onClear={onClearConsole} />
              </Panel>
            </ResizablePanel>
            <Separator className="resize-handle" />
          </>
        )}

        <ResizablePanel
          id="preview"
          minSize="15%"
          collapsible
          collapsedSize="0%"
          panelRef={(panel) => {
            previewPanelRef.current = panel;
          }}
        >
          <Panel
            title="Preview"
            hidden={!visiblePanels.preview}
            onClose={() => closePanel("preview")}
          >
            <Preview
              html={runningCode.html}
              css={runningCode.css}
              javascript={runningCode.javascript}
              runId={runId}
            />
          </Panel>
        </ResizablePanel>
      </Group>
    </main>
  );
}

export default DesktopWorkspace;
