import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("Uncaught error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong.</h1>
            <pre className="text-xs text-red-600 bg-red-100 p-4 rounded mb-6 overflow-auto">{String(this.state.error)}</pre>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
