import Modal from "./Modal";

function AboutDialog({ open, onClose }) {
  return (
    <Modal
      open={open}
      title="About LibrePen"
      description="A simple, open-source browser playground."
      onClose={onClose}
      footer={
        <button
          type="button"
          className="modal-button modal-button-primary"
          onClick={onClose}
        >
          Done
        </button>
      }
    >
      <div className="about-dialog">
        <div className="about-dialog-brand">
          <strong>LibrePen</strong>
          <span>HTML · CSS · JavaScript</span>
        </div>

        <p>
          Build, preview, and experiment with front-end code directly in your
          browser.
        </p>

        <p className="about-dialog-note">
          LibrePen is an open-source project built with React and Vite.
        </p>
      </div>
    </Modal>
  );
}

export default AboutDialog;
