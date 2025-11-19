import React, { ReactNode, ReactElement } from 'react';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactElement;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      return (
        <div className="min-h-screen bg-gray-900 text-gray-200 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-red-500 rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h2>
            <p className="text-gray-300 mb-4">{this.state.error.message}</p>
            <details className="mb-6 text-sm text-gray-400">
              <summary className="cursor-pointer hover:text-gray-300">Error details</summary>
              <pre className="mt-2 bg-gray-900 p-2 rounded overflow-auto text-xs">
                {this.state.error.stack}
              </pre>
            </details>
            <button
              onClick={this.handleRetry}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
