function ConsolePanel({ messages, onClear }) {
  return (
    <div className="console-panel">
      <div className="console-toolbar">
        <button onClick={onClear}>Clear</button>
      </div>

      <div className="console-output">
        {messages.length === 0 ? (
          <div className="console-empty">Console output will appear here.</div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`console-message console-${message.type}`}
            >
              <span className="console-prefix">
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
