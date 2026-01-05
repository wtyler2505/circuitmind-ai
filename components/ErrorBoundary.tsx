import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

// Fix: Explicitly extending React.Component fixes TypeScript inference issues with props and setState
class ErrorBoundary extends Component<Props, State> {
  public override state: State = { hasError: false };

  constructor(props: Props) {
    super(props);
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="w-full h-full flex flex-col items-center justify-center bg-cyber-dark/50 border border-red-900/50 rounded-xl p-6 text-center">
            <div className="text-red-500 text-4xl mb-2">⚠️</div>
            <h3 className="text-white font-bold mb-2">Component Error</h3>
            <p className="text-slate-300 text-sm font-mono break-all max-w-full">
              {this.state.error?.message || 'Something went wrong.'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-xs text-white transition-colors"
            >
              Retry
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
