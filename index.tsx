import React, { Component, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ToastProvider } from './hooks/useToast';
import { Buffer } from 'buffer';

// Polyfill Buffer for isomorphic-git
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
}

interface GlobalErrorBoundaryProps {
  children: ReactNode;
}

interface GlobalErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

// Fix: Use React.Component explicit inheritance for correct type inference
class GlobalErrorBoundary extends Component<GlobalErrorBoundaryProps, GlobalErrorBoundaryState> {
  public override state: GlobalErrorBoundaryState = { hasError: false };

  constructor(props: GlobalErrorBoundaryProps) {
    super(props);
  }
  
  static getDerivedStateFromError(error: Error) { 
    return { hasError: true, error }; 
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
        return (
          <div className="fixed inset-0 bg-black text-red-500 p-10 font-mono z-50 overflow-auto">
            <h1 className="text-2xl font-bold mb-4">SYSTEM FAILURE (Global Crash)</h1>
            <div className="border border-red-900 bg-red-950/20 p-4 rounded mb-4">
               <h2 className="text-white font-bold text-lg mb-2">Error Message:</h2>
               <pre className="whitespace-pre-wrap">{this.state.error?.message}</pre>
            </div>
            <div className="text-gray-400 text-sm">
               <h2 className="font-bold mb-2">Stack Trace:</h2>
               <pre className="whitespace-pre-wrap">{this.state.error?.stack}</pre>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500"
            >
              REBOOT SYSTEM
            </button>
          </div>
        );
    }
    return this.props.children;
  }
}

// Development-only accessibility auditing with axe-core
if (import.meta.env.DEV) {
  import('axe-core').then((axe) => {
    const runAxe = () => {
      axe.default.run(document.body, { reporter: 'v2' }).then((results) => {
        if (results.violations.length > 0) {
          console.groupCollapsed(
            `%c[axe] ${results.violations.length} accessibility violation(s)`,
            'color: #ff6b6b; font-weight: bold'
          );
          results.violations.forEach((v) => {
            console.warn(`[${v.impact}] ${v.help}`, v.helpUrl, v.nodes);
          });
          console.groupEnd();
        }
      });
    };
    // Run after initial render settles
    setTimeout(runAxe, 2000);
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <ToastProvider>
        <App />
      </ToastProvider>
    </GlobalErrorBoundary>
  </React.StrictMode>
);