import { useEffect, useRef } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import { emmetCSS, emmetHTML } from "emmet-monaco-es";

function CodeEditor({ language, value, onChange }) {
  const monaco = useMonaco();
  const emmetInitialized = useRef(false);

  useEffect(() => {
    if (!monaco || emmetInitialized.current) {
      return;
    }

    emmetHTML(monaco, ["html"]);
    emmetCSS(monaco, ["css"]);

    emmetInitialized.current = true;
  }, [monaco]);

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
