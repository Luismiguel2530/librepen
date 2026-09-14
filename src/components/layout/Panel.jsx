function Panel({ title, onClose, children, hidden = false }) {
  return (
    <section className={`panel ${hidden ? "panel-hidden" : ""}`}>
      <div className="panel-header">
        <span>{title}</span>

        <button onClick={onClose}>×</button>
      </div>

      <div className="panel-content">{children}</div>
    </section>
  );
}

export default Panel;
