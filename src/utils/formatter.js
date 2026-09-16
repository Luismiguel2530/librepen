import * as prettier from "prettier/standalone";
import htmlPlugin from "prettier/plugins/html";
import babelPlugin from "prettier/plugins/babel";
import estreePlugin from "prettier/plugins/estree";
import postcssPlugin from "prettier/plugins/postcss";

const FORMAT_OPTIONS = {
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: false,
};

const formatLanguage = async (code, parser, plugins) => {
  if (!code.trim()) {
    return code;
  }

  return prettier.format(code, {
    ...FORMAT_OPTIONS,
    parser,
    plugins,
  });
};

export const formatProjectCode = async ({ html, css, javascript }) => {
  const [formattedHtml, formattedCss, formattedJavaScript] = await Promise.all([
    formatLanguage(html, "html", [htmlPlugin]),
    formatLanguage(css, "css", [postcssPlugin]),
    formatLanguage(javascript, "babel", [babelPlugin, estreePlugin]),
  ]);

  return {
    html: formattedHtml,
    css: formattedCss,
    javascript: formattedJavaScript,
  };
};
