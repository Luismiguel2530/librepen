const LAYOUT_STORAGE_KEY = "librepen-layout";

export const DEFAULT_VISIBLE_PANELS = {
  html: true,
  css: true,
  javascript: true,
  console: false,
  preview: true,
};

export const LAYOUT_PRESETS = {
  default: {
    label: "Default",
    panels: {
      html: true,
      css: true,
      javascript: true,
      console: false,
      preview: true,
    },
  },

  codePreview: {
    label: "Code + Preview",
    panels: {
      html: true,
      css: false,
      javascript: true,
      console: false,
      preview: true,
    },
  },

  previewFocus: {
    label: "Preview Focus",
    panels: {
      html: false,
      css: false,
      javascript: false,
      console: false,
      preview: true,
    },
  },
};

const isBoolean = (value) => typeof value === "boolean";

const sanitizeVisiblePanels = (panels) => {
  if (!panels || typeof panels !== "object") {
    return { ...DEFAULT_VISIBLE_PANELS };
  }

  return Object.fromEntries(
    Object.entries(DEFAULT_VISIBLE_PANELS).map(([panelName, defaultValue]) => [
      panelName,
      isBoolean(panels[panelName]) ? panels[panelName] : defaultValue,
    ]),
  );
};

const sanitizePanelLayouts = (panelLayouts) => {
  if (!panelLayouts || typeof panelLayouts !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(panelLayouts).filter(([, layout]) => {
      if (!layout || typeof layout !== "object" || Array.isArray(layout)) {
        return false;
      }

      return Object.values(layout).every(
        (size) =>
          typeof size === "number" && Number.isFinite(size) && size >= 0,
      );
    }),
  );
};

export const getLayoutKey = (visiblePanels) => {
  return Object.keys(DEFAULT_VISIBLE_PANELS)
    .filter((panelName) => visiblePanels[panelName])
    .join("-");
};

export const loadLayout = () => {
  try {
    const savedLayout = localStorage.getItem(LAYOUT_STORAGE_KEY);

    if (!savedLayout) {
      return {
        visiblePanels: { ...DEFAULT_VISIBLE_PANELS },
        panelLayouts: {},
      };
    }

    const parsedLayout = JSON.parse(savedLayout);

    return {
      visiblePanels: sanitizeVisiblePanels(parsedLayout.visiblePanels),
      panelLayouts: sanitizePanelLayouts(parsedLayout.panelLayouts),
    };
  } catch (error) {
    console.error("Failed to load LibrePen layout:", error);

    return {
      visiblePanels: { ...DEFAULT_VISIBLE_PANELS },
      panelLayouts: {},
    };
  }
};

export const saveLayout = (layout) => {
  try {
    localStorage.setItem(
      LAYOUT_STORAGE_KEY,
      JSON.stringify({
        visiblePanels: sanitizeVisiblePanels(layout.visiblePanels),
        panelLayouts: sanitizePanelLayouts(layout.panelLayouts),
      }),
    );
  } catch (error) {
    console.error("Failed to save LibrePen layout:", error);
  }
};
