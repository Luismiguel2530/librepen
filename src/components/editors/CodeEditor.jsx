import { useEffect, useRef } from "react";
import Editor, { loader, useMonaco } from "@monaco-editor/react";
import { initializeEditorLanguageFeatures } from "../../utils/editorLanguageFeatures";

loader.config({
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.56.0/min/vs",
  },
});

const EDITOR_ARIA_LABELS = {
  html: "HTML code editor",
  css: "CSS code editor",
  javascript: "JavaScript code editor",
};

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
  const onRunRef = useRef(onRun);
  const onFormatRef = useRef(onFormat);

  useEffect(() => {
    onFormatRef.current = onFormat;
  }, [onFormat]);
  useEffect(() => {
    onRunRef.current = onRun;
  }, [onRun]);

  // Initialize global editor language features once Monaco is ready.
  useEffect(() => {
    if (!monaco) {
      return;
    }

    initializeEditorLanguageFeatures(monaco);
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
        ariaLabel: EDITOR_ARIA_LABELS[language] ?? "Code editor",
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
