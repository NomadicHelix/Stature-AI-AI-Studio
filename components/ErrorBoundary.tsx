import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-brand-dark text-white p-6">
                    <div className="max-w-md w-full bg-brand-gray/30 backdrop-blur-md border border-red-500/30 rounded-2xl p-8 text-center shadow-2xl">
                        <h1 className="text-3xl font-bold text-red-500 mb-4">Oops!</h1>
                        <p className="text-gray-300 mb-6">
                            Something went wrong. We're sorry for the inconvenience.
                        </p>
                        <div className="bg-black/50 p-4 rounded-lg text-left mb-6 overflow-auto max-h-40">
                            <code className="text-red-400 text-sm font-mono">
                                {this.state.error?.message}
                            </code>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-brand-primary text-brand-dark font-bold py-3 px-6 rounded-lg hover:bg-brand-secondary transition-all transform hover:scale-105"
                        >
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
