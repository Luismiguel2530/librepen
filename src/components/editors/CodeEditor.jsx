import { useEffect, useRef } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import { emmetCSS, emmetHTML } from "emmet-monaco-es";

function CodeEditor({ language, value, onChange, onRun }) {
  const monaco = useMonaco();
  const emmetInitialized = useRef(false);
  const onRunRef = useRef(onRun);

  // Always keep the latest Run function available to Monaco.
  onRunRef.current = onRun;

  // Initialize Emmet once Monaco is ready.
  useEffect(() => {
    if (!monaco || emmetInitialized.current) {
      return;
    }

    emmetHTML(monaco, ["html"]);
    emmetCSS(monaco, ["css"]);

    emmetInitialized.current = true;
  }, [monaco]);

  // Register Ctrl+Enter / Cmd+Enter directly inside Monaco.
  const handleEditorMount = (editor, monacoInstance) => {
    editor.addCommand(
      monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Enter,
      () => {
        onRunRef.current?.();
      },
    );
  };

  return (
    <Editor
      height="100%"
      language={language}
      value={value}
      onChange={(newValue) => onChange(newValue ?? "")}
      onMount={handleEditorMount}
      theme="vs-dark"
      options={{
        minimap: {
          enabled: false,
        },

        fontSize: 14,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        wordWrap: "on",

        quickSuggestions: {
          other: true,
          comments: false,
          strings: true,
        },

        suggestOnTriggerCharacters: true,
        tabCompletion: "on",
        wordBasedSuggestions: "currentDocument",
      }}
    />
  );
}

export default CodeEditor;
