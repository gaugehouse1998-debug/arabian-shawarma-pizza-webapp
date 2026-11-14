import React from 'react';
import { AlertTriangle, RotateCcw, RefreshCw } from 'lucide-react';
import { LOGO_URL } from '../../utils/assetUrl';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: ''
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'An unexpected rendering error occurred.'
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[App ErrorBoundary]', error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleResetAndReload = (): void => {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('asp_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {
      // Ignore storage errors
    }
    window.location.hash = '#/';
    window.location.reload();
  };

  render(): React.ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-7 shadow-2xl space-y-5 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-neutral-950 border border-neutral-800 p-2 flex items-center justify-center">
            <img
              src={LOGO_URL}
              alt="Arabian Shawarma & Pizza"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4" />
            <span>Something went wrong</span>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl font-bold text-white font-display">
              Arabian Shawarma &amp; Pizza
            </h1>
            <p className="text-xs text-neutral-400 leading-relaxed">
              The page encountered an unexpected issue while loading. Please reload the page or reset cached menu data.
            </p>
            {this.state.errorMessage && (
              <p className="text-[11px] font-mono text-neutral-500 bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 break-words">
                {this.state.errorMessage}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              type="button"
              onClick={this.handleReload}
              className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload Page</span>
            </button>
            <button
              type="button"
              onClick={this.handleResetAndReload}
              className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Cache &amp; Reload</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
}
