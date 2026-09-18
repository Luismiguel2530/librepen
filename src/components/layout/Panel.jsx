const panelConfig = {
  HTML: {
    type: "html",
    icon: "<>",
  },
  CSS: {
    type: "css",
    icon: "#",
  },
  JavaScript: {
    type: "javascript",
    icon: "JS",
  },
  Console: {
    type: "console",
    icon: ">_",
  },
  Preview: {
    type: "preview",
    icon: null,
  },
};

function PreviewIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="15"
      height="15"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function Panel({
  title,
  onClose,
  children,
  hidden = false,
  showCloseButton = true,
}) {
  const config = panelConfig[title] ?? {
    type: "default",
    icon: null,
  };

  return (
    <section
      className={`panel panel-${config.type} ${hidden ? "panel-hidden" : ""}`}
    >
      <div className="panel-header">
        <div className="panel-title">
          <span className="panel-language-icon" aria-hidden="true">
            {title === "Preview" ? <PreviewIcon /> : config.icon}
          </span>

          <span>{title}</span>
        </div>

        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            className="panel-close-button"
            aria-label={`Hide ${title} panel`}
            title={`Hide ${title}`}
          >
            <CloseIcon />
          </button>
        )}
      </div>

      <div className="panel-content">{children}</div>
    </section>
  );
}

export default Panel;
