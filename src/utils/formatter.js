import * as prettier from "prettier/standalone";

import htmlPlugin from "prettier/plugins/html";
import babelPlugin from "prettier/plugins/babel";
import estreePlugin from "prettier/plugins/estree";
import postcssPlugin from "prettier/plugins/postcss";

const formatLanguage = async (code, parser, plugins, options) => {
  if (!code.trim()) {
    return code;
  }

  return prettier.format(code, {
    tabWidth: options.tabSize,
    useTabs: false,
    semi: options.semicolons,
    singleQuote: options.singleQuotes,
    parser,
    plugins,
  });
};

export const formatProjectCode = async (
  { html, css, javascript },
  formattingOptions,
) => {
  const [formattedHtml, formattedCss, formattedJavaScript] = await Promise.all([
    formatLanguage(html, "html", [htmlPlugin], formattingOptions),
    formatLanguage(css, "css", [postcssPlugin], formattingOptions),
    formatLanguage(
      javascript,
      "babel",
      [babelPlugin, estreePlugin],
      formattingOptions,
    ),
  ]);

  return {
    html: formattedHtml,
    css: formattedCss,
    javascript: formattedJavaScript,
  };
};
