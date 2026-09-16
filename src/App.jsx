import { useEffect, useRef, useState } from "react";
import "./App.css";

import Panel from "./components/layout/Panel";
import CodeEditor from "./components/editors/CodeEditor";
import Preview from "./components/preview/Preview";
import ConsolePanel from "./components/console/ConsolePanel";
import AppSidebar from "./components/navigation/AppSidebar";
import Topbar from "./components/navigation/Topbar";

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

import { exportProject, parseImportedProject } from "./utils/projectTransfer";
import { formatProjectCode } from "./utils/formatter";

function App() {
  const previewPanelRef = useRef(null);
  const importFileInputRef = useRef(null);

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

  // Always point to the latest code so shortcuts registered by Monaco
  // never execute an older render after panels are closed or remounted.
  const codeRef = useRef(code);

  useEffect(() => {
    codeRef.current = {
      html: code.html,
      css: code.css,
      javascript: code.javascript,
    };
  }, [code.html, code.css, code.javascript]);

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
    saveSettings(settings);
  }, [settings]);

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

  // Close Sidebar with Escape.
  useEffect(() => {
    if (!sidebarOpen) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
        setSidebarView("menu");
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

  // Auto Run waits until the user stops editing for 600 ms.
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

  // Global Ctrl+Enter / Cmd+Enter shortcut.
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

  const handleExportProject = () => {
    try {
      exportProject(activeProject);
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to export the project.",
      );
    }
  };

  const openImportDialog = () => {
    importFileInputRef.current?.click();
  };

  const handleImportProject = async (event) => {
    const file = event.target.files?.[0];

    // Reset the input immediately so the same file can be selected again later.
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const fileContents = await file.text();
      const importedData = parseImportedProject(fileContents);

      const importedProject = {
        ...createProject(importedData.name),
        html: importedData.html,
        css: importedData.css,
        javascript: importedData.javascript,
      };

      setProjects((currentProjects) => [...currentProjects, importedProject]);

      setActiveProjectId(importedProject.id);

      codeRef.current = {
        html: importedProject.html,
        css: importedProject.css,
        javascript: importedProject.javascript,
      };

      setRunningCode({
        html: importedProject.html,
        css: importedProject.css,
        javascript: importedProject.javascript,
      });

      setConsoleMessages([]);
      setRunId((currentId) => currentId + 1);

      setSidebarOpen(false);
      setSidebarView("menu");
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to import the project.",
      );
    }
  };

  const formatCode = async () => {
    try {
      const latestCode = codeRef.current;

      const formattedCode = await formatProjectCode(latestCode);

      setProjects((currentProjects) =>
        currentProjects.map((project) => {
          if (project.id !== activeProjectId) {
            return project;
          }

          return {
            ...project,
            ...formattedCode,
            updatedAt: new Date().toISOString(),
          };
        }),
      );

      codeRef.current = formattedCode;

      setSidebarOpen(false);
      setSidebarView("menu");
    } catch (error) {
      console.error("Failed to format LibrePen code:", error);

      window.alert(
        "LibrePen could not format the code. Check for syntax errors and try again.",
      );
    }
  };

  return (
    <div className="app">
      <input
        ref={importFileInputRef}
        type="file"
        accept=".json,.librepen.json,application/json"
        onChange={handleImportProject}
        hidden
      />

      <AppSidebar
        open={sidebarOpen}
        view={sidebarView}
        settings={settings}
        onViewChange={setSidebarView}
        onSettingChange={updateSetting}
        onResetSettings={resetSettings}
        onImportProject={openImportDialog}
        onExportProject={handleExportProject}
        onFormatCode={formatCode}
        onClose={() => setSidebarOpen(false)}
      />

      <Topbar
        projects={projects}
        activeProjectId={activeProjectId}
        visiblePanels={visiblePanels}
        onSwitchProject={switchProject}
        onCreateProject={createNewProject}
        onRenameProject={renameProject}
        onDeleteProject={deleteProject}
        onTogglePanel={togglePanel}
        onOpenSidebar={() => setSidebarOpen(true)}
        onRun={runCode}
      />

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
                    onFormat={formatCode}
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
                    onFormat={formatCode}
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
                    onFormat={formatCode}
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
