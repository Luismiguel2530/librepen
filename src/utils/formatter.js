let formatterModulesPromise;

const loadFormatterModules = () => {
  formatterModulesPromise ??= Promise.all([
    import("prettier/standalone"),
    import("prettier/plugins/html"),
    import("prettier/plugins/babel"),
    import("prettier/plugins/estree"),
    import("prettier/plugins/postcss"),
  ]).then(([prettier, html, babel, estree, postcss]) => ({
    prettier,
    htmlPlugin: html.default,
    babelPlugin: babel.default,
    estreePlugin: estree.default,
    postcssPlugin: postcss.default,
  }));

  return formatterModulesPromise;
};

const formatLanguage = async (prettier, code, parser, plugins, options) => {
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
  const {
    prettier,
    htmlPlugin,
    babelPlugin,
    estreePlugin,
    postcssPlugin,
  } = await loadFormatterModules();

  const [formattedHtml, formattedCss, formattedJavaScript] = await Promise.all([
    formatLanguage(prettier, html, "html", [htmlPlugin], formattingOptions),
    formatLanguage(prettier, css, "css", [postcssPlugin], formattingOptions),
    formatLanguage(
      prettier,
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
