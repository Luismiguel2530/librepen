import { useEffect, useRef, useState } from "react";
import "./App.css";

import Panel from "./components/layout/Panel";
import CodeEditor from "./components/editors/CodeEditor";
import Preview from "./components/Preview/Preview";
import ConsolePanel from "./components/console/ConsolePanel";

import {
  Group,
  Panel as ResizablePanel,
  Separator,
} from "react-resizable-panels";

function App() {
  const previewPanelRef = useRef(null);

  const [visiblePanels, setVisiblePanels] = useState({
    html: true,
    css: true,
    javascript: true,
    preview: true,
    console: false,
  });

  const [code, setCode] = useState({
    html: "<h1>Hello LibrePen!</h1>",
    css: `body {
  font-family: sans-serif;
}`,
    javascript: `console.log("Hello LibrePen!");`,
  });

  const [runningCode, setRunningCode] = useState(code);

  const [consoleMessages, setConsoleMessages] = useState([]);

  const [runId, setRunId] = useState(0);

  // Listen for messages coming from the Preview iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.source !== "librepen-preview") {
        return;
      }

      setConsoleMessages((currentMessages) => [
        ...currentMessages,
        {
          type: event.data.type,
          text: event.data.args.join(" "),
        },
      ]);
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  // Collapse or expand Preview without destroying its iframe
  useEffect(() => {
    const previewPanel = previewPanelRef.current;

    if (!previewPanel) {
      return;
    }

    if (visiblePanels.preview) {
      previewPanel.expand();
    } else {
      previewPanel.collapse();
    }
  }, [visiblePanels.preview]);

  const togglePanel = (panelName) => {
    setVisiblePanels((currentPanels) => ({
      ...currentPanels,
      [panelName]: !currentPanels[panelName],
    }));
  };

  const updateCode = (language, value) => {
    setCode((currentCode) => ({
      ...currentCode,
      [language]: value,
    }));
  };

  const clearConsole = () => {
    setConsoleMessages([]);
  };

  const runCode = () => {
    setConsoleMessages([]);
    setRunningCode({ ...code });
    setRunId((currentId) => currentId + 1);
  };

  return (
    <div className="app">
      <header className="topbar">
        <h1>LibrePen</h1>

        <div className="topbar-actions">
          <button onClick={runCode}>Run ▶</button>

          <button onClick={() => togglePanel("html")}>HTML</button>

          <button onClick={() => togglePanel("css")}>CSS</button>

          <button onClick={() => togglePanel("javascript")}>JavaScript</button>

          <button onClick={() => togglePanel("preview")}>Preview</button>

          <button onClick={() => togglePanel("console")}>Console</button>
        </div>
      </header>

      <main className="workspace">
        <Group orientation="horizontal" className="panel-group">
          {/* HTML */}
          {visiblePanels.html && (
            <>
              <ResizablePanel minSize="15%">
                <Panel title="HTML" onClose={() => togglePanel("html")}>
                  <CodeEditor
                    language="html"
                    value={code.html}
                    onChange={(value) => updateCode("html", value)}
                  />
                </Panel>
              </ResizablePanel>

              <Separator className="resize-handle" />
            </>
          )}

          {/* CSS */}
          {visiblePanels.css && (
            <>
              <ResizablePanel minSize="15%">
                <Panel title="CSS" onClose={() => togglePanel("css")}>
                  <CodeEditor
                    language="css"
                    value={code.css}
                    onChange={(value) => updateCode("css", value)}
                  />
                </Panel>
              </ResizablePanel>

              <Separator className="resize-handle" />
            </>
          )}

          {/* JavaScript */}
          {visiblePanels.javascript && (
            <>
              <ResizablePanel minSize="15%">
                <Panel
                  title="JavaScript"
                  onClose={() => togglePanel("javascript")}
                >
                  <CodeEditor
                    language="javascript"
                    value={code.javascript}
                    onChange={(value) => updateCode("javascript", value)}
                  />
                </Panel>
              </ResizablePanel>
            </>
          )}

          {/* Separator before Preview */}
          <Separator
            className={`resize-handle ${
              !visiblePanels.preview ? "resize-handle-hidden" : ""
            }`}
          />

          {/* Preview */}
          <ResizablePanel
            minSize="15%"
            collapsible
            collapsedSize="0%"
            panelRef={(panel) => {
              previewPanelRef.current = panel;
            }}
          >
            <Panel title="Preview" onClose={() => togglePanel("preview")}>
              <Preview
                html={runningCode.html}
                css={runningCode.css}
                javascript={runningCode.javascript}
                runId={runId}
              />
            </Panel>
          </ResizablePanel>

          {/* Console */}
          {visiblePanels.console && (
            <>
              <Separator className="resize-handle" />

              <ResizablePanel minSize="15%">
                <Panel title="Console" onClose={() => togglePanel("console")}>
                  <ConsolePanel
                    messages={consoleMessages}
                    onClear={clearConsole}
                  />
                </Panel>
              </ResizablePanel>
            </>
          )}
        </Group>
      </main>
    </div>
  );
}

export default App;
