import { useRef, useState } from "react";
import Modal from "./Modal";

function ProjectNameDialog({ mode, initialName = "", onClose, onSubmit }) {
  const isRename = mode === "rename";

  const [projectName, setProjectName] = useState(() =>
    isRename ? initialName : "Untitled Project",
  );

  const inputRef = useRef(null);

  const handleSubmit = (event) => {
    event.preventDefault();

    const cleanName = projectName.trim();

    if (!cleanName) {
      inputRef.current?.focus();
      return;
    }

    onSubmit(cleanName);
  };

  return (
    <Modal
      open
      title={isRename ? "Rename project" : "New project"}
      description={
        isRename
          ? "Choose a new name for this project."
          : "Give your new LibrePen project a name."
      }
      onClose={onClose}
      initialFocusRef={inputRef}
      footer={
        <>
          <button type="button" className="modal-button" onClick={onClose}>
            Cancel
          </button>

          <button
            type="submit"
            form="project-name-form"
            className="modal-button modal-button-primary"
          >
            {isRename ? "Rename" : "Create project"}
          </button>
        </>
      }
    >
      <form id="project-name-form" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          className="modal-input"
          type="text"
          value={projectName}
          onChange={(event) => setProjectName(event.target.value)}
          placeholder="Project name"
          autoComplete="off"
          maxLength={80}
          aria-label="Project name"
        />
      </form>
    </Modal>
  );
}

export default ProjectNameDialog;
