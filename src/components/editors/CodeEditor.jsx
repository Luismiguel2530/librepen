import Editor from "@monaco-editor/react";

function CodeEditor({ language, value, onChange }) {
  return (
    <Editor
      height="100%"
      language={language}
      value={value}
      onChange={(newValue) => onChange(newValue ?? "")}
      theme="vs-dark"
      options={{
        minimap: {
          enabled: false,
        },
        fontSize: 14,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        wordWrap: "on",
      }}
    />
  );
}

export default CodeEditor;
