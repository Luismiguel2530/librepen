const SETTINGS_KEY = "librepen-settings";

export const DEFAULT_SETTINGS = {
  autoRun: false,
  fontSize: 14,
  wordWrap: true,
  minimap: false,

  // Formatting
  tabSize: 2,
  semicolons: true,
  singleQuotes: false,
  formatOnRun: false,
};

const sanitizeSettings = (settings) => {
  if (
    !settings ||
    typeof settings !== "object" ||
    Array.isArray(settings)
  ) {
    return { ...DEFAULT_SETTINGS };
  }

  return {
    autoRun:
      typeof settings.autoRun === "boolean"
        ? settings.autoRun
        : DEFAULT_SETTINGS.autoRun,
    fontSize:
      Number.isInteger(settings.fontSize) &&
      settings.fontSize >= 12 &&
      settings.fontSize <= 20
        ? settings.fontSize
        : DEFAULT_SETTINGS.fontSize,
    wordWrap:
      typeof settings.wordWrap === "boolean"
        ? settings.wordWrap
        : DEFAULT_SETTINGS.wordWrap,
    minimap:
      typeof settings.minimap === "boolean"
        ? settings.minimap
        : DEFAULT_SETTINGS.minimap,
    tabSize: [2, 4].includes(settings.tabSize)
      ? settings.tabSize
      : DEFAULT_SETTINGS.tabSize,
    semicolons:
      typeof settings.semicolons === "boolean"
        ? settings.semicolons
        : DEFAULT_SETTINGS.semicolons,
    singleQuotes:
      typeof settings.singleQuotes === "boolean"
        ? settings.singleQuotes
        : DEFAULT_SETTINGS.singleQuotes,
    formatOnRun:
      typeof settings.formatOnRun === "boolean"
        ? settings.formatOnRun
        : DEFAULT_SETTINGS.formatOnRun,
  };
};

export const loadSettings = () => {
  try {
    const savedSettings = localStorage.getItem(SETTINGS_KEY);

    if (!savedSettings) {
      return { ...DEFAULT_SETTINGS };
    }

    return sanitizeSettings(JSON.parse(savedSettings));
  } catch (error) {
    console.error("Failed to load LibrePen settings:", error);

    return { ...DEFAULT_SETTINGS };
  }
};

export const saveSettings = (settings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save LibrePen settings:", error);
  }
};
