import React, { Component, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ToastProvider } from './hooks/useToast';

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