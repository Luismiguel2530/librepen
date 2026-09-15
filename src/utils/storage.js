const STORAGE_KEY = "librepen-code";

export const loadCode = () => {
  try {
    const savedCode = localStorage.getItem(STORAGE_KEY);

    if (!savedCode) {
      return null;
    }

    return JSON.parse(savedCode);
  } catch (error) {
    console.error("Failed to load saved LibrePen code:", error);
    return null;
  }
};

export const saveCode = (code) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(code));
  } catch (error) {
    console.error("Failed to save LibrePen code:", error);
  }
};
