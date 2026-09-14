import { useState } from "react";
import "./App.css";
import Panel from "./components/layout/Panel";
import CodeEditor from "./components/editors/CodeEditor";
import Preview from "./components/Preview/Preview";
function App() {
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

        {visiblePanels.preview && (
          <Panel title="Preview" onClose={() => togglePanel("preview")}>
            <Preview
              html={code.html}
              css={code.css}
              javascript={code.javascript}
            />
          </Panel>
        )}

        {visiblePanels.console && (
          <Panel title="Console" onClose={() => togglePanel("console")}>
            <p>Console output will go here.</p>
          </Panel>
        )}
      </main>
    </div>
  );
}

export default App;
