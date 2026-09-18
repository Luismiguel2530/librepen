import { emmetCSS, emmetHTML } from "emmet-monaco-es";

const registrations = new WeakMap();

const JAVASCRIPT_SNIPPETS = [
  {
    prefix: "func",
    name: "Function declaration",
    insertText: [
      "function ${1:name}(${2:parameters}) {",
      "\t${0}",
      "}",
    ].join("\n"),
  },
  {
    prefix: "arrow",
    name: "Assigned arrow function",
    insertText: [
      "const ${1:name} = (${2:parameters}) => {",
      "\t${0}",
      "};",
    ].join("\n"),
  },
  {
    prefix: "afn",
    name: "Anonymous arrow function",
    insertText: ["(${1:parameters}) => {", "\t${0}", "}"].join("\n"),
  },
  {
    prefix: "if",
    name: "If statement",
    insertText: ["if (${1:condition}) {", "\t${0}", "}"].join("\n"),
  },
  {
    prefix: "ifelse",
    name: "If/else statement",
    insertText: [
      "if (${1:condition}) {",
      "\t${2}",
      "} else {",
      "\t${0}",
      "}",
    ].join("\n"),
  },
  {
    prefix: "for",
    name: "Indexed for loop",
    insertText: [
      "for (let ${1:i} = 0; ${1:i} < ${2:length}; ${1:i}++) {",
      "\t${0}",
      "}",
    ].join("\n"),
  },
  {
    prefix: "forof",
    name: "For...of loop",
    insertText: [
      "for (const ${1:item} of ${2:iterable}) {",
      "\t${0}",
      "}",
    ].join("\n"),
  },
  {
    prefix: "foreach",
    name: "Array forEach",
    insertText: [
      "${1:array}.forEach((${2:item}) => {",
      "\t${0}",
      "});",
    ].join("\n"),
  },
  {
    prefix: "while",
    name: "While loop",
    insertText: ["while (${1:condition}) {", "\t${0}", "}"].join("\n"),
  },
  {
    prefix: "switch",
    name: "Switch statement",
    insertText: [
      "switch (${1:value}) {",
      "\tcase ${2:caseValue}:",
      "\t\t${3}",
      "\t\tbreak;",
      "\tdefault:",
      "\t\t${0}",
      "}",
    ].join("\n"),
  },
  {
    prefix: "trycatch",
    name: "Try/catch statement",
    insertText: [
      "try {",
      "\t${1}",
      "} catch (${2:error}) {",
      "\t${0}",
      "}",
    ].join("\n"),
  },
  {
    prefix: "clg",
    name: "Console log",
    insertText: "console.log(${1:value});${0}",
  },
];

function registerJavaScriptSnippets(monaco) {
  return monaco.languages.registerCompletionItemProvider("javascript", {
    provideCompletionItems(model, position) {
      const word = model.getWordUntilPosition(position);
      const range = new monaco.Range(
        position.lineNumber,
        word.startColumn,
        position.lineNumber,
        word.endColumn,
      );

      return {
        suggestions: JAVASCRIPT_SNIPPETS.map((snippet) => ({
          label: {
            label: snippet.prefix,
            detail: ` — ${snippet.name}`,
            description: "Snippet",
          },
          kind: monaco.languages.CompletionItemKind.Snippet,
          detail: "LibrePen JavaScript snippet",
          filterText: snippet.prefix,
          sortText: `0_${snippet.prefix}`,
          insertText: snippet.insertText,
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        })),
      };
    },
  });
}

export function initializeEditorLanguageFeatures(monaco) {
  const existingRegistration = registrations.get(monaco);

  if (existingRegistration) {
    return existingRegistration;
  }

  const disposables = [
    { dispose: emmetHTML(monaco, ["html"]) },
    { dispose: emmetCSS(monaco, ["css"]) },
    registerJavaScriptSnippets(monaco),
  ];

  const registration = {
    disposables,
    dispose() {
      disposables.forEach((disposable) => disposable.dispose());
      registrations.delete(monaco);
    },
  };

  registrations.set(monaco, registration);

  return registration;
}
