import { useEffect, useRef } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import { emmetCSS, emmetHTML } from "emmet-monaco-es";

function CodeEditor({
  language,
  value,
  onChange,
  onRun,
  onFormat,
  fontSize = 14,
  wordWrap = true,
  minimap = false,
}) {
  const monaco = useMonaco();
  const emmetInitialized = useRef(false);
  const onRunRef = useRef(onRun);
  const onFormatRef = useRef(onFormat);

  useEffect(() => {
    onFormatRef.current = onFormat;
  }, [onFormat]);
  useEffect(() => {
    onRunRef.current = onRun;
  }, [onRun]);

  // Initialize Emmet once Monaco is ready.
  useEffect(() => {
    if (!monaco || emmetInitialized.current) {
      return;
    }

    emmetHTML(monaco, ["html"]);
    emmetCSS(monaco, ["css"]);

    emmetInitialized.current = true;
  }, [monaco]);

  // Register editor shortcuts directly inside Monaco.
  const handleEditorMount = (editor, monacoInstance) => {
    // Run code: Ctrl+Enter / Cmd+Enter
    editor.addCommand(
      monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Enter,
      () => {
        onRunRef.current?.();
      },
    );

    // Format code: Shift+Alt+F
    editor.addCommand(
      monacoInstance.KeyMod.Shift |
        monacoInstance.KeyMod.Alt |
        monacoInstance.KeyCode.KeyF,
      () => {
        onFormatRef.current?.();
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
          enabled: minimap,
        },

        fontSize,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        wordWrap: wordWrap ? "on" : "off",

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
