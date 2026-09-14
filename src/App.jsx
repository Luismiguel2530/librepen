import { useState } from "react";
import "./App.css";
import Panel from "./components/layout/Panel";

function App() {
  const [visiblePanels, setVisiblePanels] = useState({
    html: true,
    css: true,
    javascript: true,
    preview: true,
    console: false,
  });

  const togglePanel = (panelName) => {
    setVisiblePanels((currentPanels) => ({
      ...currentPanels,
      [panelName]: !currentPanels[panelName],
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
            <p>HTML editor will go here.</p>
          </Panel>
        )}

        {visiblePanels.css && (
          <Panel title="CSS" onClose={() => togglePanel("css")}>
            <p>CSS editor will go here.</p>
          </Panel>
        )}

        {visiblePanels.javascript && (
          <Panel title="JavaScript" onClose={() => togglePanel("javascript")}>
            <p>JavaScript editor will go here.</p>
          </Panel>
        )}

        {visiblePanels.preview && (
          <Panel title="Preview" onClose={() => togglePanel("preview")}>
            <p>Preview will go here.</p>
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
