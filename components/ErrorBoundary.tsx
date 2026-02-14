import React, { ErrorInfo, ReactNode } from "react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-900 text-white p-8 flex flex-col items-center justify-center">
                    <h1 className="text-3xl font-bold text-rose-500 mb-4">Algo deu errado!</h1>
                    <div className="bg-slate-800 p-6 rounded-lg max-w-2xl w-full overflow-auto">
                        <p className="text-xl mb-4 text-rose-300 font-bold">{this.state.error?.toString()}</p>
                        <div className="bg-slate-950 p-4 rounded border border-slate-700">
                            <pre className="text-xs text-slate-400 font-mono whitespace-pre-wrap overflow-x-auto">
                                {this.state.errorInfo?.componentStack}
                            </pre>
                        </div>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-8 px-6 py-3 bg-sky-500 hover:bg-sky-400 rounded-xl font-bold uppercase transition-colors"
                    >
                        Recarregar Página
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
