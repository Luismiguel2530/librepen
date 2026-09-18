const PROJECTS_STORAGE_KEY = "librepen-projects";
const ACTIVE_PROJECT_STORAGE_KEY = "librepen-active-project";
const LEGACY_CODE_STORAGE_KEY = "librepen-code";
const TRASH_STORAGE_KEY = "librepen-trash";

const isRecord = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const isValidProject = (project) =>
  isRecord(project) &&
  typeof project.id === "string" &&
  project.id.length > 0 &&
  typeof project.name === "string" &&
  typeof project.html === "string" &&
  typeof project.css === "string" &&
  typeof project.javascript === "string";

const sanitizeProjects = (projects) => {
  if (!Array.isArray(projects)) {
    return [];
  }

  return projects.filter(isValidProject);
};

const createProjectId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `project-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const createProject = (name = "Untitled Project", code = null) => {
  const now = new Date().toISOString();

  return {
    id: createProjectId(),
    name,
    html: code?.html ?? "",
    css: code?.css ?? "",
    javascript: code?.javascript ?? "",
    createdAt: now,
    updatedAt: now,
  };
};

const loadLegacyCode = () => {
  try {
    const savedCode = localStorage.getItem(LEGACY_CODE_STORAGE_KEY);

    if (!savedCode) {
      return null;
    }

    const parsedCode = JSON.parse(savedCode);

    if (!isRecord(parsedCode)) {
      return null;
    }

    return {
      html: typeof parsedCode.html === "string" ? parsedCode.html : "",
      css: typeof parsedCode.css === "string" ? parsedCode.css : "",
      javascript:
        typeof parsedCode.javascript === "string"
          ? parsedCode.javascript
          : "",
    };
  } catch (error) {
    console.error("Failed to load legacy LibrePen code:", error);
    return null;
  }
};

export const loadProjects = () => {
  try {
    const savedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);

    if (savedProjects) {
      const projects = sanitizeProjects(JSON.parse(savedProjects));

      if (Array.isArray(projects) && projects.length > 0) {
        return projects;
      }
    }

    // Migrate code from the original single-project autosave.
    const legacyCode = loadLegacyCode();

    const firstProject = createProject(
      legacyCode ? "My First Project" : "Untitled Project",
      legacyCode,
    );

    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify([firstProject]));

    localStorage.setItem(ACTIVE_PROJECT_STORAGE_KEY, firstProject.id);

    // Migration succeeded, so the old storage entry is no longer needed.
    if (legacyCode) {
      localStorage.removeItem(LEGACY_CODE_STORAGE_KEY);
    }

    return [firstProject];
  } catch (error) {
    console.error("Failed to load LibrePen projects:", error);

    return [createProject()];
  }
};

export const saveProjects = (projects) => {
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error("Failed to save LibrePen projects:", error);
  }
};

export const loadTrash = () => {
  try {
    const savedTrash = localStorage.getItem(TRASH_STORAGE_KEY);

    if (!savedTrash) {
      return [];
    }

    return sanitizeProjects(JSON.parse(savedTrash));
  } catch (error) {
    console.error("Failed to load LibrePen trash:", error);
    return [];
  }
};

export const saveTrash = (trash) => {
  try {
    localStorage.setItem(TRASH_STORAGE_KEY, JSON.stringify(trash));
  } catch (error) {
    console.error("Failed to save LibrePen trash:", error);
  }
};

export const loadActiveProjectId = () => {
  try {
    return localStorage.getItem(ACTIVE_PROJECT_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to load active LibrePen project:", error);
    return null;
  }
};

export const saveActiveProjectId = (projectId) => {
  try {
    localStorage.setItem(ACTIVE_PROJECT_STORAGE_KEY, projectId);
  } catch (error) {
    console.error("Failed to save active LibrePen project:", error);
  }
};
