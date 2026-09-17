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

export const loadSettings = () => {
  try {
    const savedSettings = localStorage.getItem(SETTINGS_KEY);

    if (!savedSettings) {
      return { ...DEFAULT_SETTINGS };
    }

    const parsedSettings = JSON.parse(savedSettings);

    return {
      ...DEFAULT_SETTINGS,
      ...parsedSettings,
    };
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
