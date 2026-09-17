import { useEffect, useRef, useState } from "react";
import "./App.css";

import Panel from "./components/layout/Panel";
import CodeEditor from "./components/editors/CodeEditor";
import Preview from "./components/preview/Preview";
import ConsolePanel from "./components/console/ConsolePanel";
import AppSidebar from "./components/navigation/AppSidebar";
import Topbar from "./components/navigation/Topbar";
import ProjectNameDialog from "./components/ui/ProjectNameDialog";
import ConfirmDialog from "./components/ui/ConfirmDialog";
import AboutDialog from "./components/ui/AboutDialog";
import Toast from "./components/ui/Toast";

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

  const [projectDialog, setProjectDialog] = useState({
    open: false,
    mode: "new",
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [aboutDialogOpen, setAboutDialogOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const [settings, setSettings] = useState(() => {
    return loadSettings();
  });
  const showToast = (message, type = "info") => {
    setToast({
      id: Date.now(),
      message,
      type,
    });
  };

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

  // Keep the latest settings available to callbacks registered once.
  const settingsRef = useRef(settings);

  // Keep the latest active project ID available to formatting callbacks.
  const activeProjectIdRef = useRef(activeProjectId);

  // Keep the latest Run function available to the global keyboard shortcut.
  const runCodeRef = useRef(null);

  useEffect(() => {
    codeRef.current = {
      html: code.html,
      css: code.css,
      javascript: code.javascript,
    };
  }, [code.html, code.css, code.javascript]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    activeProjectIdRef.current = activeProjectId;
  }, [activeProjectId]);

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

  const getFormattingOptions = () => {
    const currentSettings = settingsRef.current;

    return {
      tabSize: currentSettings.tabSize,
      semicolons: currentSettings.semicolons,
      singleQuotes: currentSettings.singleQuotes,
    };
  };

  const applyFormattedCode = (formattedCode) => {
    const projectId = activeProjectIdRef.current;

    setProjects((currentProjects) =>
      currentProjects.map((project) => {
        if (project.id !== projectId) {
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
  };

  const runCode = async () => {
    let codeToRun = codeRef.current;

    if (settingsRef.current.formatOnRun) {
      try {
        const formattedCode = await formatProjectCode(
          codeToRun,
          getFormattingOptions(),
        );

        applyFormattedCode(formattedCode);
        codeToRun = formattedCode;
      } catch (error) {
        console.error("Failed to format LibrePen code before running:", error);

        showToast(
          "LibrePen could not format the code before running. Check for syntax errors and try again.",
          "error",
        );

        return;
      }
    }

    setConsoleMessages([]);
    setRunningCode({ ...codeToRun });
    setRunId((currentId) => currentId + 1);
  };

  // Always point to the latest Run function without forcing the global
  // keyboard listener to be registered again after every render.
  useEffect(() => {
    runCodeRef.current = runCode;
  });

  // Auto Run waits until the user stops editing for 600 ms.
  // It does not trigger Format on Run so formatting never interrupts typing.
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
        runCodeRef.current?.();
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

    codeRef.current = {
      html: project.html,
      css: project.css,
      javascript: project.javascript,
    };

    activeProjectIdRef.current = projectId;

    setRunningCode({
      html: project.html,
      css: project.css,
      javascript: project.javascript,
    });

    setConsoleMessages([]);
    setRunId((currentId) => currentId + 1);
  };

  const openNewProjectDialog = () => {
    setProjectDialog({
      open: true,
      mode: "new",
    });
  };

  const openRenameProjectDialog = () => {
    if (!activeProject) {
      return;
    }

    setProjectDialog({
      open: true,
      mode: "rename",
    });
  };

  const closeProjectDialog = () => {
    setProjectDialog((currentDialog) => ({
      ...currentDialog,
      open: false,
    }));
  };

  const createNewProject = (projectName) => {
    const newProject = createProject(projectName);

    setProjects((currentProjects) => [...currentProjects, newProject]);
    setActiveProjectId(newProject.id);

    codeRef.current = {
      html: newProject.html,
      css: newProject.css,
      javascript: newProject.javascript,
    };

    activeProjectIdRef.current = newProject.id;

    setRunningCode({
      html: newProject.html,
      css: newProject.css,
      javascript: newProject.javascript,
    });

    setConsoleMessages([]);
    setRunId((currentId) => currentId + 1);

    closeProjectDialog();
  };

  const renameProject = (projectName) => {
    if (!activeProject) {
      return;
    }

    setProjects((currentProjects) =>
      currentProjects.map((project) => {
        if (project.id !== activeProjectId) {
          return project;
        }

        return {
          ...project,
          name: projectName,
          updatedAt: new Date().toISOString(),
        };
      }),
    );

    closeProjectDialog();
  };

  const openDeleteProjectDialog = () => {
    if (!activeProject) {
      return;
    }

    setDeleteDialogOpen(true);
  };

  const closeDeleteProjectDialog = () => {
    setDeleteDialogOpen(false);
  };

  const deleteProject = () => {
    if (!activeProject) {
      return;
    }

    const remainingProjects = projects.filter(
      (project) => project.id !== activeProjectId,
    );

    if (remainingProjects.length === 0) {
      const replacementProject = createProject("Untitled Project");

      setProjects([replacementProject]);
      setActiveProjectId(replacementProject.id);

      codeRef.current = {
        html: replacementProject.html,
        css: replacementProject.css,
        javascript: replacementProject.javascript,
      };

      activeProjectIdRef.current = replacementProject.id;

      setRunningCode({
        html: replacementProject.html,
        css: replacementProject.css,
        javascript: replacementProject.javascript,
      });

      setConsoleMessages([]);
      setRunId((currentId) => currentId + 1);

      closeDeleteProjectDialog();

      return;
    }

    const nextProject = remainingProjects[0];

    setProjects(remainingProjects);
    setActiveProjectId(nextProject.id);

    codeRef.current = {
      html: nextProject.html,
      css: nextProject.css,
      javascript: nextProject.javascript,
    };

    activeProjectIdRef.current = nextProject.id;

    setRunningCode({
      html: nextProject.html,
      css: nextProject.css,
      javascript: nextProject.javascript,
    });

    setConsoleMessages([]);
    setRunId((currentId) => currentId + 1);

    closeDeleteProjectDialog();
  };

  const updateSetting = (settingName, value) => {
    setSettings((currentSettings) => {
      const updatedSettings = {
        ...currentSettings,
        [settingName]: value,
      };

      settingsRef.current = updatedSettings;

      return updatedSettings;
    });
  };

  const resetSettings = () => {
    const defaultSettings = { ...DEFAULT_SETTINGS };

    settingsRef.current = defaultSettings;
    setSettings(defaultSettings);
  };

  const handleExportProject = () => {
    try {
      exportProject(activeProject);
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Unable to export the project.",
        "error",
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

      activeProjectIdRef.current = importedProject.id;

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
      showToast(
        error instanceof Error
          ? error.message
          : "Unable to import the project.",
        "error",
      );
    }
  };

  const formatCode = async () => {
    try {
      const latestCode = codeRef.current;

      const formattedCode = await formatProjectCode(
        latestCode,
        getFormattingOptions(),
      );

      applyFormattedCode(formattedCode);

      setSidebarOpen(false);
      setSidebarView("menu");
    } catch (error) {
      console.error("Failed to format LibrePen code:", error);

      showToast(
        "LibrePen could not format the code. Check for syntax errors and try again.",
        "error",
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

      {projectDialog.open && (
        <ProjectNameDialog
          mode={projectDialog.mode}
          initialName={activeProject?.name ?? ""}
          onClose={closeProjectDialog}
          onSubmit={
            projectDialog.mode === "rename" ? renameProject : createNewProject
          }
        />
      )}

      {deleteDialogOpen && activeProject && (
        <ConfirmDialog
          open
          title="Delete project?"
          description={`"${activeProject.name}" will be permanently deleted.`}
          confirmLabel="Delete project"
          danger
          onConfirm={deleteProject}
          onClose={closeDeleteProjectDialog}
        />
      )}
      {aboutDialogOpen && (
        <AboutDialog open onClose={() => setAboutDialogOpen(false)} />
      )}
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

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
        onOpenAbout={() => setAboutDialogOpen(true)}
        onClose={() => setSidebarOpen(false)}
      />

      <Topbar
        projects={projects}
        activeProjectId={activeProjectId}
        visiblePanels={visiblePanels}
        onSwitchProject={switchProject}
        onCreateProject={openNewProjectDialog}
        onRenameProject={openRenameProjectDialog}
        onDeleteProject={openDeleteProjectDialog}
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
