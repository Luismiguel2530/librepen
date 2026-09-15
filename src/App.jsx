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

function MoreIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
      fill="currentColor"
    >
      <circle cx="5" cy="12" r="1.7" />
      <circle cx="12" cy="12" r="1.7" />
      <circle cx="19" cy="12" r="1.7" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v5M14 11v5" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="17"
      height="17"
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M8 5v14l11-7Z" />
    </svg>
  );
}

function App() {
  const previewPanelRef = useRef(null);
  const projectMenuRef = useRef(null);

  const [projectMenuOpen, setProjectMenuOpen] = useState(false);

  const [visiblePanels, setVisiblePanels] = useState({
    html: true,
    css: true,
    javascript: true,
    preview: true,
    console: false,
  });

  const [projects, setProjects] = useState(() => {
    return loadProjects();
  });

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

  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  useEffect(() => {
    if (activeProjectId) {
      saveActiveProjectId(activeProjectId);
    }
  }, [activeProjectId]);

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

    // Sync once immediately.
    syncPreviewState();

    // Sync again after the panel group finishes recalculating its layout.
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

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (
        projectMenuRef.current &&
        !projectMenuRef.current.contains(event.target)
      ) {
        setProjectMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setProjectMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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
    setProjectMenuOpen(false);

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
    setProjectMenuOpen(false);

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

  const panelButtonClass = (panelName) =>
    `view-button ${visiblePanels[panelName] ? "view-button-active" : ""}`;

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <img src="/librepen-icon.png" alt="" className="brand-icon" />
          <h1>LibrePen</h1>
        </div>

        <div className="topbar-actions">
          <div className="toolbar-group project-controls">
            <select
              className="project-select"
              value={activeProjectId}
              onChange={(event) => switchProject(event.target.value)}
              aria-label="Select project"
              title="Select project"
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="toolbar-button new-button"
              onClick={createNewProject}
              title="Create a new project"
            >
              <span className="new-button-icon" aria-hidden="true">
                +
              </span>
              <span>New</span>
            </button>

            <div className="project-menu-wrapper" ref={projectMenuRef}>
              <button
                type="button"
                className={`icon-button ${
                  projectMenuOpen ? "icon-button-active" : ""
                }`}
                onClick={() =>
                  setProjectMenuOpen((currentValue) => !currentValue)
                }
                aria-label="Project options"
                aria-expanded={projectMenuOpen}
                title="Project options"
              >
                <MoreIcon />
              </button>

              {projectMenuOpen && (
                <div className="project-menu">
                  <button type="button" onClick={renameProject}>
                    <EditIcon />
                    <span>Rename project</span>
                  </button>

                  <div className="project-menu-separator" />

                  <button
                    type="button"
                    className="project-menu-delete"
                    onClick={deleteProject}
                  >
                    <DeleteIcon />
                    <span>Delete project</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="toolbar-divider" />

          <div className="toolbar-group view-controls">
            <button
              type="button"
              className={`${panelButtonClass("html")} language-toggle-html`}
              aria-pressed={visiblePanels.html}
              onClick={() => togglePanel("html")}
              title="Show/hide HTML editor"
            >
              <span className="view-icon" aria-hidden="true">
                &lt;&gt;
              </span>
              <span>HTML</span>
            </button>

            <button
              type="button"
              className={`${panelButtonClass("css")} language-toggle-css`}
              aria-pressed={visiblePanels.css}
              onClick={() => togglePanel("css")}
              title="Show/hide CSS editor"
            >
              <span className="view-icon" aria-hidden="true">
                #
              </span>
              <span>CSS</span>
            </button>

            <button
              type="button"
              className={`${panelButtonClass("javascript")} language-toggle-js`}
              aria-pressed={visiblePanels.javascript}
              onClick={() => togglePanel("javascript")}
              title="Show/hide JavaScript editor"
            >
              <span className="view-icon view-icon-js" aria-hidden="true">
                JS
              </span>
              <span>JavaScript</span>
            </button>

            <button
              type="button"
              className={panelButtonClass("console")}
              aria-pressed={visiblePanels.console}
              onClick={() => togglePanel("console")}
              title="Show/hide Console"
            >
              <span className="view-icon console-icon" aria-hidden="true">
                &gt;_
              </span>
              <span>Console</span>
            </button>

            <button
              type="button"
              className={panelButtonClass("preview")}
              aria-pressed={visiblePanels.preview}
              onClick={() => togglePanel("preview")}
              title="Show/hide Preview"
            >
              <span className="view-svg-icon">
                <EyeIcon />
              </span>
              <span>Preview</span>
            </button>
          </div>

          <div className="toolbar-divider" />

          <button
            type="button"
            className="run-button"
            onClick={runCode}
            title="Run project"
          >
            <PlayIcon />
            <span>Run</span>
          </button>
        </div>
      </header>

      <main className="workspace">
        <Group orientation="horizontal" className="panel-group">
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

              <Separator className="resize-handle" />
            </>
          )}

          {visiblePanels.console && (
            <>
              <ResizablePanel minSize="15%">
                <Panel title="Console" onClose={() => togglePanel("console")}>
                  <ConsolePanel
                    messages={consoleMessages}
                    onClear={clearConsole}
                  />
                </Panel>
              </ResizablePanel>

              <Separator className="resize-handle" />
            </>
          )}

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
        </Group>
      </main>
    </div>
  );
}

export default App;
