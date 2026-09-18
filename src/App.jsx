import { useEffect, useRef, useState } from "react";
import "./App.css";

import DesktopWorkspace from "./components/workspace/DesktopWorkspace";
import MobileWorkspace from "./components/workspace/MobileWorkspace";
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
  loadTrash,
  saveActiveProjectId,
  saveProjects,
  saveTrash,
} from "./utils/storage";

import { DEFAULT_SETTINGS, loadSettings, saveSettings } from "./utils/settings";

import {
  DEFAULT_VISIBLE_PANELS,
  LAYOUT_PRESETS,
  getLayoutKey,
  loadLayout,
  saveLayout,
} from "./utils/layout";

import { exportProject, parseImportedProject } from "./utils/projectTransfer";
import { formatProjectCode } from "./utils/formatter";
import useMediaQuery from "./hooks/useMediaQuery";

function App() {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const importFileInputRef = useRef(null);
  const sidebarTriggerRef = useRef(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarView, setSidebarView] = useState("menu");
  const [mobileActivePanel, setMobileActivePanel] = useState("html");

  const [projectDialog, setProjectDialog] = useState({
    open: false,
    mode: "new",
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [aboutDialogOpen, setAboutDialogOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [permanentDeleteProjectId, setPermanentDeleteProjectId] =
    useState(null);

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
  const [initialLayout] = useState(() => loadLayout());

  const [visiblePanels, setVisiblePanels] = useState(
    initialLayout.visiblePanels,
  );

  const [panelLayouts, setPanelLayouts] = useState(initialLayout.panelLayouts);
  const [layoutResetVersion, setLayoutResetVersion] = useState(0);

  const [projects, setProjects] = useState(() => {
    return loadProjects();
  });

  const [trash, setTrash] = useState(() => {
    return loadTrash();
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

  const permanentDeleteProject =
    trash.find((project) => project.id === permanentDeleteProjectId) ?? null;

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
    saveTrash(trash);
  }, [trash]);

  useEffect(() => {
    if (activeProjectId) {
      saveActiveProjectId(activeProjectId);
    }
  }, [activeProjectId]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveLayout({
      visiblePanels,
      panelLayouts,
    });
  }, [visiblePanels, panelLayouts]);

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

  const togglePanel = (panelName) => {
    setVisiblePanels((currentPanels) => ({
      ...currentPanels,
      [panelName]: !currentPanels[panelName],
    }));
  };
  const currentLayoutKey = getLayoutKey(visiblePanels);

  const currentPanelLayout = panelLayouts[currentLayoutKey];

  const handlePanelLayoutChanged = (layout) => {
    const layoutKey = getLayoutKey(visiblePanels);

    if (!layoutKey || !layout || Object.keys(layout).length === 0) {
      return;
    }

    setPanelLayouts((currentLayouts) => ({
      ...currentLayouts,
      [layoutKey]: layout,
    }));
  };

  const applyLayoutPreset = (presetName) => {
    const preset = LAYOUT_PRESETS[presetName];

    if (!preset) {
      return;
    }

    setVisiblePanels({
      ...preset.panels,
    });
  };

  const resetLayout = () => {
    setVisiblePanels({
      ...DEFAULT_VISIBLE_PANELS,
    });

    setPanelLayouts({});

    setLayoutResetVersion((currentVersion) => currentVersion + 1);

    showToast("Layout reset.", "success");
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

    const deletedProject = {
      ...activeProject,
      deletedAt: new Date().toISOString(),
    };

    setTrash((currentTrash) => [deletedProject, ...currentTrash]);

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
      showToast("Project moved to Trash.", "success");

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
    showToast("Project moved to Trash.", "success");
  };

  const restoreProject = (projectId) => {
    const projectToRestore = trash.find((project) => project.id === projectId);

    if (!projectToRestore) {
      showToast("The project could not be found in Trash.", "error");
      return;
    }

    const restoredProject = { ...projectToRestore };

    delete restoredProject.deletedAt;

    setTrash((currentTrash) =>
      currentTrash.filter((project) => project.id !== projectId),
    );

    setProjects((currentProjects) => [...currentProjects, restoredProject]);

    setActiveProjectId(restoredProject.id);

    codeRef.current = {
      html: restoredProject.html,
      css: restoredProject.css,
      javascript: restoredProject.javascript,
    };

    activeProjectIdRef.current = restoredProject.id;

    setRunningCode({
      html: restoredProject.html,
      css: restoredProject.css,
      javascript: restoredProject.javascript,
    });

    setConsoleMessages([]);
    setRunId((currentId) => currentId + 1);

    setSidebarOpen(false);
    setSidebarView("menu");

    showToast(`"${restoredProject.name}" restored.`, "success");
  };

  const openPermanentDeleteDialog = (projectId) => {
    const projectExists = trash.some((project) => project.id === projectId);

    if (!projectExists) {
      return;
    }

    setPermanentDeleteProjectId(projectId);
  };

  const closePermanentDeleteDialog = () => {
    setPermanentDeleteProjectId(null);
  };

  const deleteProjectForever = () => {
    if (!permanentDeleteProject) {
      return;
    }

    const deletedProjectName = permanentDeleteProject.name;

    setTrash((currentTrash) =>
      currentTrash.filter(
        (project) => project.id !== permanentDeleteProject.id,
      ),
    );

    closePermanentDeleteDialog();

    showToast(`"${deletedProjectName}" permanently deleted.`, "success");
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
          title="Move project to Trash?"
          description={`"${activeProject.name}" will be moved to Trash and can be restored later.`}
          confirmLabel="Move to Trash"
          danger
          onConfirm={deleteProject}
          onClose={closeDeleteProjectDialog}
        />
      )}

      {permanentDeleteProject && (
        <ConfirmDialog
          open
          title="Delete project forever?"
          description={`"${permanentDeleteProject.name}" will be permanently deleted and cannot be restored.`}
          confirmLabel="Delete forever"
          danger
          onConfirm={deleteProjectForever}
          onClose={closePermanentDeleteDialog}
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
        triggerRef={sidebarTriggerRef}
        focusManagementPaused={Boolean(permanentDeleteProject)}
        view={sidebarView}
        settings={settings}
        trash={trash}
        onViewChange={setSidebarView}
        onSettingChange={updateSetting}
        onResetSettings={resetSettings}
        onImportProject={openImportDialog}
        onExportProject={handleExportProject}
        onFormatCode={formatCode}
        onOpenAbout={() => setAboutDialogOpen(true)}
        onRestoreProject={restoreProject}
        onDeleteForever={openPermanentDeleteDialog}
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
        onApplyLayoutPreset={applyLayoutPreset}
        onResetLayout={resetLayout}
        onOpenSidebar={() => setSidebarOpen(true)}
        sidebarOpen={sidebarOpen}
        sidebarTriggerRef={sidebarTriggerRef}
        onRun={runCode}
      />

      {isMobile ? (
        <MobileWorkspace
          activePanel={mobileActivePanel}
          onActivePanelChange={setMobileActivePanel}
          code={code}
          onCodeChange={updateCode}
          settings={settings}
          onRun={runCode}
          onFormat={formatCode}
          consoleMessages={consoleMessages}
          onClearConsole={clearConsole}
          runningCode={runningCode}
          runId={runId}
        />
      ) : (
        <DesktopWorkspace
          visiblePanels={visiblePanels}
          currentLayoutKey={currentLayoutKey}
          layoutResetVersion={layoutResetVersion}
          currentPanelLayout={currentPanelLayout}
          onLayoutChanged={handlePanelLayoutChanged}
          code={code}
          onCodeChange={updateCode}
          onRun={runCode}
          onFormat={formatCode}
          settings={settings}
          consoleMessages={consoleMessages}
          onClearConsole={clearConsole}
          runningCode={runningCode}
          runId={runId}
          onTogglePanel={togglePanel}
        />
      )}
    </div>
  );
}

export default App;
