function Preview({ html, css, javascript }) {
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
          ${javascript}
        <\/script>
      </body>
    </html>
  `;

  return (
    <iframe
      srcDoc={srcDoc}
      title="LibrePen Preview"
      sandbox="allow-scripts"
      className="preview-frame"
    />
  );
}

export default Preview;
