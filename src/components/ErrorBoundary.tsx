import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in their child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 */
class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // We can also log the error to an error reporting service
        console.error('Uncaught error:', error, errorInfo);

        // Suppress extension-related errors from showing the fallback UI if they don't actually break the app
        if (error.message?.includes('message channel closed') ||
            error.message?.includes('Receiving end does not exist')) {
            // For these specific errors, we might want to try to recover or ignore
            // But usually ErrorBoundary catches render errors. 
            // Promise rejections are handled by the global listener in map.tsx.
        }
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
                    <div className="max-w-md w-full glass-panel p-6 rounded-xl border border-red-500/30">
                        <h2 className="text-xl font-bold text-red-400 mb-4">Something went wrong</h2>
                        <p className="text-gray-300 mb-4">
                            The application encountered an unexpected error. This might be caused by a browser extension or a temporary glitch.
                        </p>
                        <div className="bg-black/30 p-3 rounded mb-4 overflow-auto max-h-32 text-xs font-mono text-red-300">
                            {this.state.error?.toString()}
                        </div>
                        <button
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded transition-colors"
                            onClick={() => {
                                this.setState({ hasError: false });
                                window.location.reload();
                            }}
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
