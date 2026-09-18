function ConsolePanel({ messages, onClear }) {
  return (
    <div className="console-panel">
      <div className="console-toolbar">
        <button onClick={onClear}>Clear</button>
      </div>

      <div
        className="console-output"
        role="log"
        aria-label="Console output"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.length === 0 ? (
          <div className="console-empty">Console output will appear here.</div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`console-message console-${message.type}`}
            >
              <span className="visually-hidden">
                {message.type === "error"
                  ? "Error: "
                  : message.type === "warn"
                    ? "Warning: "
                    : "Log: "}
              </span>

              <span className="console-prefix" aria-hidden="true">
                {message.type === "error"
                  ? "✕"
                  : message.type === "warn"
                    ? "⚠"
                    : "›"}
              </span>

              <span>{message.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ConsolePanel;
