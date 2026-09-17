import Modal from "./Modal";

function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  onConfirm,
  onClose,
}) {
  return (
    <Modal
      open={open}
      title={title}
      description={description}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="modal-button" onClick={onClose}>
            {cancelLabel}
          </button>

          <button
            type="button"
            className={`modal-button ${
              danger ? "modal-button-danger" : "modal-button-primary"
            }`}
            onClick={onConfirm}
            autoFocus
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      {danger && (
        <div className="confirm-warning">This action cannot be undone.</div>
      )}
    </Modal>
  );
}

export default ConfirmDialog;
