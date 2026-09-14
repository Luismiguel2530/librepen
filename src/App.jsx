import { useEffect, useState } from "react";
import "./App.css";
import Panel from "./components/layout/Panel";
import CodeEditor from "./components/editors/CodeEditor";
import Preview from "./components/Preview/Preview";
import ConsolePanel from "./components/console/ConsolePanel";
function App() {
  const [consoleMessages, setConsoleMessages] = useState([]);
  const [runId, setRunId] = useState(0);
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
  const clearConsole = () => {
    setConsoleMessages([]);
  };
  const runCode = () => {
    setConsoleMessages([]);
    setRunningCode({ ...code });
    setRunId((currentId) => currentId + 1);
  };
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
        {visiblePanels.html && (
          <Panel title="HTML" onClose={() => togglePanel("html")}>
            <CodeEditor
              language="html"
              value={code.html}
              onChange={(value) => updateCode("html", value)}
            />
          </Panel>
        )}

        {visiblePanels.css && (
          <Panel title="CSS" onClose={() => togglePanel("css")}>
            <CodeEditor
              language="css"
              value={code.css}
              onChange={(value) => updateCode("css", value)}
            />
          </Panel>
        )}

        {visiblePanels.javascript && (
          <Panel title="JavaScript" onClose={() => togglePanel("javascript")}>
            <CodeEditor
              language="javascript"
              value={code.javascript}
              onChange={(value) => updateCode("javascript", value)}
            />
          </Panel>
        )}

        <Panel
          title="Preview"
          onClose={() => togglePanel("preview")}
          hidden={!visiblePanels.preview}
        >
          <Preview
            html={runningCode.html}
            css={runningCode.css}
            javascript={runningCode.javascript}
            runId={runId}
          />
        </Panel>

        {visiblePanels.console && (
          <Panel title="Console" onClose={() => togglePanel("console")}>
            <ConsolePanel messages={consoleMessages} onClear={clearConsole} />
          </Panel>
        )}
      </main>
    </div>
  );
}

export default App;
