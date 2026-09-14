import { useState } from "react";
import "./App.css";

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
          <section className="panel">
            <div className="panel-header">
              <span>HTML</span>
              <button onClick={() => togglePanel("html")}>×</button>
            </div>

            <div className="panel-content">
              <p>HTML editor will go here.</p>
            </div>
          </section>
        )}

        {visiblePanels.css && (
          <section className="panel">
            <div className="panel-header">
              <span>CSS</span>
              <button onClick={() => togglePanel("css")}>×</button>
            </div>

            <div className="panel-content">
              <p>CSS editor will go here.</p>
            </div>
          </section>
        )}

        {visiblePanels.javascript && (
          <section className="panel">
            <div className="panel-header">
              <span>JavaScript</span>
              <button onClick={() => togglePanel("javascript")}>×</button>
            </div>

            <div className="panel-content">
              <p>JavaScript editor will go here.</p>
            </div>
          </section>
        )}

        {visiblePanels.preview && (
          <section className="panel">
            <div className="panel-header">
              <span>Preview</span>
              <button onClick={() => togglePanel("preview")}>×</button>
            </div>

            <div className="panel-content">
              <p>Preview will go here.</p>
            </div>
          </section>
        )}

        {visiblePanels.console && (
          <section className="panel">
            <div className="panel-header">
              <span>Console</span>
              <button onClick={() => togglePanel("console")}>×</button>
            </div>

            <div className="panel-content">
              <p>Console output will go here.</p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
