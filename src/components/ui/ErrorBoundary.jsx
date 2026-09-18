import { Component } from "react";

class ErrorBoundary extends Component {
  state = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("LibrePen encountered an unexpected error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    const { error, hasError } = this.state;

    if (!hasError) {
      return this.props.children;
    }

    return (
      <main className="error-fallback">
        <section
          className="error-fallback-card"
          role="alert"
          aria-labelledby="error-fallback-title"
        >
          <div className="error-fallback-brand">LibrePen</div>
          <h1 id="error-fallback-title">Something went wrong</h1>
          <p>
            LibrePen encountered an unexpected problem. Reload the application
            to try again.
          </p>

          {import.meta.env.DEV && error && (
            <details className="error-fallback-details">
              <summary>Development error details</summary>
              <code>{error.message || String(error)}</code>
            </details>
          )}

          <button type="button" onClick={this.handleReload}>
            Reload LibrePen
          </button>
        </section>
      </main>
    );
  }
}

export default ErrorBoundary;
