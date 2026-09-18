import { CloseIcon } from "../icons/Icons";

function formatDeletedDate(deletedAt) {
  if (!deletedAt) {
    return "Deleted recently";
  }

  const date = new Date(deletedAt);

  if (Number.isNaN(date.getTime())) {
    return "Deleted recently";
  }

  return `Deleted ${date.toLocaleString()}`;
}

function TrashView({
  trash,
  onBack,
  onClose,
  onRestoreProject,
  onDeleteForever,
  backButtonRef,
  onRestoreButtonRef,
  onDeleteButtonRef,
}) {
  return (
    <>
      <div className="sidebar-header">
        <div className="sidebar-view-heading">
          <button
            ref={backButtonRef}
            type="button"
            className="sidebar-back-button"
            onClick={onBack}
            aria-label="Back to menu"
            title="Back"
          >
            ←
          </button>

          <div>
            <strong>Trash</strong>
            <span>
              {trash.length === 1
                ? "1 deleted project"
                : `${trash.length} deleted projects`}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="sidebar-close"
          onClick={onClose}
          aria-label="Close menu"
          title="Close menu"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="sidebar-content trash-content">
        {trash.length === 0 ? (
          <div className="trash-empty">
            <strong>Trash is empty</strong>
            <span>Deleted projects will appear here.</span>
          </div>
        ) : (
          <div className="trash-list">
            {trash.map((project) => (
              <div className="trash-project" key={project.id}>
                <div className="trash-project-info">
                  <strong title={project.name}>{project.name}</strong>
                  <span>{formatDeletedDate(project.deletedAt)}</span>
                </div>

                <div className="trash-project-actions">
                  <button
                    ref={(element) =>
                      onRestoreButtonRef(project.id, element)
                    }
                    type="button"
                    className="trash-action-button"
                    onClick={() => onRestoreProject(project.id)}
                  >
                    Restore
                  </button>

                  <button
                    ref={(element) =>
                      onDeleteButtonRef(project.id, element)
                    }
                    type="button"
                    className="trash-action-button trash-action-danger"
                    onClick={() => onDeleteForever(project.id)}
                  >
                    Delete forever
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default TrashView;
