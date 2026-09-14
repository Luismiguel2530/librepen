function Preview({ html, css, javascript, runId }) {
  const srcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          ${css}
        </style>
      </head>

      <body>
        ${html}

        <script>
          const sendToConsole = (type, args) => {
            window.parent.postMessage(
              {
                source: "librepen-preview",
                type,
                args: args.map((arg) => {
                  try {
                    return typeof arg === "object"
                      ? JSON.stringify(arg)
                      : String(arg);
                  } catch {
                    return String(arg);
                  }
                }),
              },
              "*"
            );
          };

          const originalLog = console.log;
          const originalWarn = console.warn;
          const originalError = console.error;

          console.log = (...args) => {
            sendToConsole("log", args);
            originalLog(...args);
          };

          console.warn = (...args) => {
            sendToConsole("warn", args);
            originalWarn(...args);
          };

          console.error = (...args) => {
            sendToConsole("error", args);
            originalError(...args);
          };

          window.onerror = (message, source, lineno, colno) => {
            sendToConsole("error", [
              message + " (" + lineno + ":" + colno + ")"
            ]);
          };

          ${javascript}
        <\/script>
      </body>
    </html>
  `;

  return (
    <iframe
      key={runId}
      srcDoc={srcDoc}
      title="LibrePen Preview"
      sandbox="allow-scripts"
      className="preview-frame"
    />
  );
}

export default Preview;
