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

import { DEFAULT_SETTINGS, loadSettings, saveSettings } from "./utils/settings";

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

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="17"
      height="17"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="17"
      height="17"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19 13.5v-3l-2-.6a7 7 0 0 0-.7-1.7l1-1.8-2.1-2.1-1.8 1a7 7 0 0 0-1.7-.7L11 3H8l-.6 2a7 7 0 0 0-1.7.7l-1.8-1-2.1 2.1 1 1.8a7 7 0 0 0-.7 1.7L1 11v3l2 .6a7 7 0 0 0 .7 1.7l-1 1.8 2.1 2.1 1.8-1a7 7 0 0 0 1.7.7L9 22h3l.6-2a7 7 0 0 0 1.7-.7l1.8 1 2.1-2.1-1-1.8a7 7 0 0 0 .7-1.7Z" />
    </svg>
  );
}

function ImportIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="17"
      height="17"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

function ExportIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="17"
      height="17"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 21V9" />
      <path d="m7 14 5-5 5 5" />
      <path d="M5 3h14" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="17"
      height="17"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    >
      <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="17"
      height="17"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6" />
      <path d="M12 7h.01" />
    </svg>
  );
}

function LibrePenMark() {
  return (
    <svg viewBox="0 0 32 32" className="brand-mark" aria-hidden="true">
      <rect x="3" y="3" width="26" height="26" rx="7" fill="currentColor" />

      <path
        d="M13 10 8 16l5 6"
        fill="none"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="m19 10 5 6-5 6"
        fill="none"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="m18 8-4 16"
        fill="none"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
}
function BackIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="17"
      height="17"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function App() {
  const previewPanelRef = useRef(null);
  const projectMenuRef = useRef(null);

  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarView, setSidebarView] = useState("menu");

  const [settings, setSettings] = useState(() => {
    return loadSettings();
  });

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

  // Always keep a reference to the latest version of the code.
  // This prevents shortcuts registered by Monaco from using stale code
  // after an editor panel is closed or remounted.
  const codeRef = useRef(code);
  codeRef.current = code;

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

  // Listen for console messages coming from Preview.
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

  // Close the project menu when clicking outside or pressing Escape.
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

  // Close the sidebar with Escape.
  useEffect(() => {
    if (!sidebarOpen) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [sidebarOpen]);

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
    const latestCode = codeRef.current;

    setConsoleMessages([]);
    setRunningCode({ ...latestCode });
    setRunId((currentId) => currentId + 1);
  };

  // Auto Run:
  // Wait 600ms after the user stops editing before updating Preview.
  useEffect(() => {
    if (!settings.autoRun) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setConsoleMessages([]);

      setRunningCode({
        html: code.html,
        css: code.css,
        javascript: code.javascript,
      });

      setRunId((currentId) => currentId + 1);
    }, 600);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [settings.autoRun, code.html, code.css, code.javascript]);

  // Save user settings whenever they change.
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Global keyboard shortcut:
  // Ctrl + Enter on Windows/Linux
  // Cmd + Enter on macOS
  useEffect(() => {
    const handleRunShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        runCode();
      }
    };

    window.addEventListener("keydown", handleRunShortcut);

    return () => {
      window.removeEventListener("keydown", handleRunShortcut);
    };
  }, []);

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

  const updateSetting = (settingName, value) => {
    setSettings((currentSettings) => ({
      ...currentSettings,
      [settingName]: value,
    }));
  };

  const resetSettings = () => {
    setSettings({ ...DEFAULT_SETTINGS });
  };

  const panelButtonClass = (panelName) =>
    `view-button ${visiblePanels[panelName] ? "view-button-active" : ""}`;

  return (
    <div className="app">
      {/* Sidebar is outside the navbar so it overlays the whole app. */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSidebarOpen(false);
            }
          }}
        >
          <aside className="sidebar" aria-label="LibrePen menu">
            {sidebarView === "menu" ? (
              <>
                <div className="sidebar-header">
                  <div className="sidebar-brand">
                    <LibrePenMark />

                    <div>
                      <strong>LibrePen</strong>
                      <span>Browser playground</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="sidebar-close"
                    onClick={() => {
                      setSidebarOpen(false);
                      setSidebarView("menu");
                    }}
                    aria-label="Close menu"
                    title="Close menu"
                  >
                    <CloseIcon />
                  </button>
                </div>

                <div className="sidebar-content">
                  <div className="sidebar-section">
                    <span className="sidebar-section-label">Workspace</span>

                    <button
                      type="button"
                      className="sidebar-item"
                      onClick={() => setSidebarView("settings")}
                    >
                      <SettingsIcon />
                      <span>Settings</span>
                    </button>
                  </div>

                  <div className="sidebar-section">
                    <span className="sidebar-section-label">Project</span>

                    <button
                      type="button"
                      className="sidebar-item sidebar-item-coming"
                      disabled
                    >
                      <ImportIcon />

                      <span className="sidebar-item-text">
                        <span>Import</span>
                        <small>Coming soon</small>
                      </span>
                    </button>

                    <button
                      type="button"
                      className="sidebar-item sidebar-item-coming"
                      disabled
                    >
                      <ExportIcon />

                      <span className="sidebar-item-text">
                        <span>Export</span>
                        <small>Coming soon</small>
                      </span>
                    </button>
                  </div>
                </div>

                <div className="sidebar-footer">
                  <a
                    className="sidebar-item sidebar-link"
                    href="https://github.com/Luismiguel2530/librepen"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open LibrePen on GitHub"
                  >
                    <StarIcon />
                    <span>Star on GitHub</span>
                  </a>

                  <button
                    type="button"
                    className="sidebar-item"
                    onClick={() => {
                      window.alert(
                        "LibrePen\n\nA simple, open-source browser playground for HTML, CSS and JavaScript.",
                      );
                    }}
                  >
                    <InfoIcon />
                    <span>About LibrePen</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="sidebar-header settings-header">
                  <div className="settings-header-title">
                    <button
                      type="button"
                      className="sidebar-close"
                      onClick={() => setSidebarView("menu")}
                      aria-label="Back to menu"
                      title="Back"
                    >
                      <BackIcon />
                    </button>

                    <strong>Settings</strong>
                  </div>

                  <button
                    type="button"
                    className="sidebar-close"
                    onClick={() => {
                      setSidebarOpen(false);
                      setSidebarView("menu");
                    }}
                    aria-label="Close settings"
                    title="Close"
                  >
                    <CloseIcon />
                  </button>
                </div>

                <div className="sidebar-content settings-content">
                  <div className="settings-section">
                    <span className="sidebar-section-label">Editor</span>

                    <div className="setting-row setting-row-column">
                      <div className="setting-row-heading">
                        <div>
                          <strong>Font size</strong>
                          <small>Editor text size</small>
                        </div>

                        <span className="setting-value">
                          {settings.fontSize}px
                        </span>
                      </div>

                      <input
                        type="range"
                        min="12"
                        max="20"
                        step="1"
                        value={settings.fontSize}
                        onChange={(event) =>
                          updateSetting("fontSize", Number(event.target.value))
                        }
                        aria-label="Editor font size"
                      />
                    </div>

                    <label className="setting-row">
                      <div>
                        <strong>Word wrap</strong>
                        <small>Wrap long lines</small>
                      </div>

                      <input
                        className="setting-checkbox"
                        type="checkbox"
                        checked={settings.wordWrap}
                        onChange={(event) =>
                          updateSetting("wordWrap", event.target.checked)
                        }
                      />
                    </label>

                    <label className="setting-row">
                      <div>
                        <strong>Minimap</strong>
                        <small>Show code overview</small>
                      </div>

                      <input
                        className="setting-checkbox"
                        type="checkbox"
                        checked={settings.minimap}
                        onChange={(event) =>
                          updateSetting("minimap", event.target.checked)
                        }
                      />
                    </label>
                  </div>

                  <div className="settings-section">
                    <span className="sidebar-section-label">Execution</span>

                    <label className="setting-row">
                      <div>
                        <strong>Auto Run</strong>
                        <small>Run 600 ms after editing</small>
                      </div>

                      <input
                        className="setting-checkbox"
                        type="checkbox"
                        checked={settings.autoRun}
                        onChange={(event) =>
                          updateSetting("autoRun", event.target.checked)
                        }
                      />
                    </label>
                  </div>
                </div>

                <div className="settings-footer">
                  <button
                    type="button"
                    className="reset-settings-button"
                    onClick={resetSettings}
                  >
                    Reset to defaults
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      <header className="topbar">
        {/* New flat navbar brand + sidebar trigger */}
        <div className="brand">
          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open LibrePen menu"
            title="Menu"
          >
            <MenuIcon />
          </button>

          <LibrePenMark />

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
            title="Run project (Ctrl+Enter)"
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
                    onRun={runCode}
                    fontSize={settings.fontSize}
                    wordWrap={settings.wordWrap}
                    minimap={settings.minimap}
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
                    onRun={runCode}
                    fontSize={settings.fontSize}
                    wordWrap={settings.wordWrap}
                    minimap={settings.minimap}
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
                    onRun={runCode}
                    fontSize={settings.fontSize}
                    wordWrap={settings.wordWrap}
                    minimap={settings.minimap}
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
