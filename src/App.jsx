import { useEffect, useRef, useState } from "react";
import "./App.css";

import Panel from "./components/layout/Panel";
import CodeEditor from "./components/editors/CodeEditor";
import Preview from "./components/preview/Preview";
import ConsolePanel from "./components/console/ConsolePanel";

import {
  createProject,
  loadActiveProjectId,
  loadProjects,
  saveActiveProjectId,
  saveProjects,
} from "./utils/storage";

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

  // Load all saved projects once when LibrePen starts.
  const [projects, setProjects] = useState(() => {
    return loadProjects();
  });

  // Restore the project that was open during the previous session.
  const [activeProjectId, setActiveProjectId] = useState(() => {
    const savedProjects = loadProjects();
    const savedActiveProjectId = loadActiveProjectId();

    const activeProjectStillExists = savedProjects.some(
      (project) => project.id === savedActiveProjectId,
    );

    if (activeProjectStillExists) {
      return savedActiveProjectId;
    }

    return savedProjects[0].id;
  });

  const activeProject =
    projects.find((project) => project.id === activeProjectId) ?? projects[0];

  const code = {
    html: activeProject?.html ?? "",
    css: activeProject?.css ?? "",
    javascript: activeProject?.javascript ?? "",
  };

  const [runningCode, setRunningCode] = useState(code);
  const [consoleMessages, setConsoleMessages] = useState([]);
  const [runId, setRunId] = useState(0);

  // Save the complete project collection whenever it changes.
  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  // Remember which project is currently open.
  useEffect(() => {
    if (activeProjectId) {
      saveActiveProjectId(activeProjectId);
    }
  }, [activeProjectId]);

  // Listen for console messages coming from the Preview iframe.
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

  // Collapse or expand Preview without destroying its iframe.
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
    setProjects((currentProjects) =>
      currentProjects.map((project) => {
        if (project.id !== activeProjectId) {
          return project;
        }

        return {
          ...project,
          [language]: value,
          updatedAt: new Date().toISOString(),
        };
      }),
    );
  };

  const clearConsole = () => {
    setConsoleMessages([]);
  };

  const runCode = () => {
    setConsoleMessages([]);
    setRunningCode({ ...code });
    setRunId((currentId) => currentId + 1);
  };

  const switchProject = (projectId) => {
    const project = projects.find(
      (currentProject) => currentProject.id === projectId,
    );

    if (!project) {
      return;
    }

    setActiveProjectId(projectId);

    setRunningCode({
      html: project.html,
      css: project.css,
      javascript: project.javascript,
    });

    setConsoleMessages([]);
    setRunId((currentId) => currentId + 1);
  };

  const createNewProject = () => {
    const projectName = window.prompt("Project name:", "Untitled Project");

    if (projectName === null) {
      return;
    }

    const cleanName = projectName.trim() || "Untitled Project";

    const newProject = createProject(cleanName);

    setProjects((currentProjects) => [...currentProjects, newProject]);

    setActiveProjectId(newProject.id);

    setRunningCode({
      html: newProject.html,
      css: newProject.css,
      javascript: newProject.javascript,
    });

    setConsoleMessages([]);
    setRunId((currentId) => currentId + 1);
  };

  const renameProject = () => {
    if (!activeProject) {
      return;
    }

    const newName = window.prompt("Rename project:", activeProject.name);

    if (newName === null) {
      return;
    }

    const cleanName = newName.trim();

    if (!cleanName) {
      return;
    }

    setProjects((currentProjects) =>
      currentProjects.map((project) => {
        if (project.id !== activeProjectId) {
          return project;
        }

        return {
          ...project,
          name: cleanName,
          updatedAt: new Date().toISOString(),
        };
      }),
    );
  };

  const deleteProject = () => {
    if (!activeProject) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${activeProject.name}"? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    const remainingProjects = projects.filter(
      (project) => project.id !== activeProjectId,
    );

    // LibrePen should always have at least one project.
    if (remainingProjects.length === 0) {
      const replacementProject = createProject("Untitled Project");

      setProjects([replacementProject]);
      setActiveProjectId(replacementProject.id);

      setRunningCode({
        html: "",
        css: "",
        javascript: "",
      });

      setConsoleMessages([]);
      setRunId((currentId) => currentId + 1);

      return;
    }

    const nextProject = remainingProjects[0];

    setProjects(remainingProjects);
    setActiveProjectId(nextProject.id);

    setRunningCode({
      html: nextProject.html,
      css: nextProject.css,
      javascript: nextProject.javascript,
    });

    setConsoleMessages([]);
    setRunId((currentId) => currentId + 1);
  };

  return (
    <div className="app">
      <header className="topbar">
        <h1>LibrePen</h1>

        <div className="topbar-actions">
          <select
            value={activeProjectId}
            onChange={(event) => switchProject(event.target.value)}
            aria-label="Select project"
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>

          <button onClick={createNewProject}>New</button>

          <button onClick={renameProject}>Rename</button>

          <button onClick={deleteProject}>Delete</button>

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
          )}

          {/* Separator before Preview */}
          <Separator
            className={`resize-handle ${
              !visiblePanels.preview ? "resize-handle-hidden" : ""
            }`}
          />

          {/* Preview remains mounted */}
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
