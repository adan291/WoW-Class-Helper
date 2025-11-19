import React, { ReactNode, ReactElement } from 'react';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactElement;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorCount: number;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error);
    console.error('Error info:', errorInfo);
    
    // Increment error count to detect repeated errors
    this.setState(prevState => ({
      errorCount: prevState.errorCount + 1,
    }));
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      const isRepeatedError = this.state.errorCount > 2;

      return (
        <div className="min-h-screen bg-gray-900 text-gray-200 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-red-500 rounded-lg p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center mb-4">
              <svg className="h-8 w-8 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <h2 className="text-2xl font-bold text-red-400">Something went wrong</h2>
            </div>
            
            <p className="text-gray-300 mb-4">{this.state.error.message}</p>
            
            {isRepeatedError && (
              <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-500/50 rounded text-sm text-yellow-200">
                ⚠️ This error has occurred multiple times. Try reloading the page.
              </div>
            )}
            
            <details className="mb-6 text-sm text-gray-400">
              <summary className="cursor-pointer hover:text-gray-300 font-medium">Error details</summary>
              <pre className="mt-2 bg-gray-900 p-2 rounded overflow-auto text-xs max-h-40 border border-gray-700">
                {this.state.error.stack}
              </pre>
            </details>
            
            <div className="flex gap-2">
              <button
                onClick={this.handleRetry}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors active:scale-95"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors active:scale-95"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
