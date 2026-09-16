import { useEffect, useRef, useState } from "react";

import {
  DeleteIcon,
  EditIcon,
  EyeIcon,
  LibrePenMark,
  MenuIcon,
  MoreIcon,
  PlayIcon,
} from "../icons/Icons";

function Topbar({
  projects,
  activeProjectId,
  visiblePanels,
  onSwitchProject,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
  onTogglePanel,
  onOpenSidebar,
  onRun,
}) {
  const projectMenuRef = useRef(null);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);

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

  const panelButtonClass = (panelName) =>
    `view-button ${visiblePanels[panelName] ? "view-button-active" : ""}`;

  const renameProject = () => {
    setProjectMenuOpen(false);
    onRenameProject();
  };

  const deleteProject = () => {
    setProjectMenuOpen(false);
    onDeleteProject();
  };

  return (
    <header className="topbar">
      <div className="brand">
        <button
          type="button"
          className="sidebar-toggle"
          onClick={onOpenSidebar}
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
            onChange={(event) => onSwitchProject(event.target.value)}
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
            onClick={onCreateProject}
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
            onClick={() => onTogglePanel("html")}
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
            onClick={() => onTogglePanel("css")}
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
            onClick={() => onTogglePanel("javascript")}
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
            onClick={() => onTogglePanel("console")}
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
            onClick={() => onTogglePanel("preview")}
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
          onClick={onRun}
          title="Run project (Ctrl+Enter)"
        >
          <PlayIcon />
          <span>Run</span>
        </button>
      </div>
    </header>
  );
}

export default Topbar;
