function Panel({ title, onClose, children }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <span>{title}</span>

        <button onClick={onClose}>×</button>
      </div>

      <div className="panel-content">{children}</div>
    </section>
  );
}

export default Panel;
