const LIBREPEN_FORMAT = "librepen";
const LIBREPEN_VERSION = 1;

const createSafeFilename = (projectName) => {
  const safeName = projectName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return safeName || "librepen-project";
};

export const exportProject = (project) => {
  if (!project) {
    throw new Error("No project is available to export.");
  }

  const exportData = {
    format: LIBREPEN_FORMAT,
    version: LIBREPEN_VERSION,
    project: {
      name: project.name,
      html: project.html,
      css: project.css,
      javascript: project.javascript,
    },
  };

  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], {
    type: "application/json",
  });

  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = downloadUrl;
  link.download = `${createSafeFilename(project.name)}.librepen.json`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(downloadUrl);
};

export const parseImportedProject = (fileContents) => {
  let data;

  try {
    data = JSON.parse(fileContents);
  } catch {
    throw new Error("This file does not contain valid JSON.");
  }

  if (!data || typeof data !== "object") {
    throw new Error("Invalid LibrePen project file.");
  }

  if (data.format !== LIBREPEN_FORMAT) {
    throw new Error("This is not a LibrePen project file.");
  }

  if (data.version !== LIBREPEN_VERSION) {
    throw new Error(
      `Unsupported LibrePen project version: ${String(data.version)}.`,
    );
  }

  if (!data.project || typeof data.project !== "object") {
    throw new Error("The project data is missing.");
  }

  const { name, html, css, javascript } = data.project;

  if (
    typeof name !== "string" ||
    typeof html !== "string" ||
    typeof css !== "string" ||
    typeof javascript !== "string"
  ) {
    throw new Error("The LibrePen project data is invalid.");
  }

  return {
    name: name.trim() || "Imported Project",
    html,
    css,
    javascript,
  };
};
