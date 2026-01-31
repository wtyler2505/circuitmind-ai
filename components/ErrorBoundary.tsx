import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
    
    // Save crash state for potential recovery analysis
    sessionStorage.setItem('cm_last_crash', JSON.stringify({
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: Date.now()
    }));
  }

  handleReload = () => {
    window.location.reload();
  };

  handleSafeMode = () => {
    // Clear potentially corrupt state but keep backups
    sessionStorage.removeItem('cm_autosave'); 
    localStorage.removeItem('cm_autosave');
    window.location.reload();
  };

  handleRestore = () => {
    // Try to load from the last known good save if available
    // In a real implementation, we might have multiple slots
    // For now, reload implies the app will try to init normally
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="fixed inset-0 z-50 bg-[#050508] flex items-center justify-center p-4 font-mono">
          <div className="bg-red-950/20 border border-red-500/50 p-8 max-w-2xl w-full cut-corner-lg relative overflow-hidden">
            {/* Scanline */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] opacity-20 pointer-events-none" />
            
            <h1 className="text-2xl font-bold text-red-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              SYSTEM_FAILURE (Global Crash)
            </h1>
            
            <div className="bg-black/50 p-4 border border-red-500/30 mb-6 font-mono text-xs text-red-300 overflow-auto max-h-64">
              <p className="font-bold mb-2">Error Message:</p>
              <p className="mb-4">{this.state.error?.message || 'Unknown Error'}</p>
              <p className="font-bold mb-2">Stack Trace:</p>
              <pre className="whitespace-pre-wrap">{this.state.error?.stack}</pre>
              {this.state.errorInfo && (
                <>
                  <p className="font-bold mt-4 mb-2">Component Stack:</p>
                  <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={this.handleReload}
                className="py-3 px-4 bg-red-500 hover:bg-red-400 text-black font-bold uppercase tracking-widest cut-corner-sm transition-all"
              >
                Reboot System
              </button>
              <button
                onClick={this.handleRestore}
                className="py-3 px-4 bg-white/10 border border-white/20 hover:bg-white/20 text-white font-bold uppercase tracking-widest cut-corner-sm transition-all"
              >
                Try Restore
              </button>
              <button
                onClick={this.handleSafeMode}
                className="py-3 px-4 bg-black border border-red-500/50 hover:border-red-500 text-red-500 font-bold uppercase tracking-widest cut-corner-sm transition-all"
              >
                Safe Mode (Reset)
              </button>
            </div>
            
            <p className="text-[10px] text-red-400/60 mt-4 text-center uppercase tracking-widest">
              Error logged to local diagnostics. No data sent to cloud.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
