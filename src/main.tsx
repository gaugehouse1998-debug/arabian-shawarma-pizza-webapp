import { createRoot, Root } from 'react-dom/client';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LOGO_URL } from './utils/assetUrl';
import './index.css';

let appMounted = false;
let reactRoot: Root | null = null;

function clearCachedAppStorageAndReload(): void {
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
}

function renderStartupFallback(message: string): void {
  const container = document.getElementById('root');
  if (!container) return;

  const fallbackUi = (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-7 shadow-2xl space-y-5 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-neutral-950 border border-neutral-800 p-2 flex items-center justify-center">
          <img
            src={LOGO_URL}
            alt="Arabian Shawarma & Pizza"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-white font-display">
            Arabian Shawarma &amp; Pizza
          </h1>
          <p className="text-xs text-neutral-400 leading-relaxed">
            The storefront encountered a startup issue while loading resources. Please reload or reset cached browser data.
          </p>
          <p className="text-[11px] font-mono text-neutral-400 bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 break-words">
            {message}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs cursor-pointer transition-colors"
          >
            Reload Page
          </button>
          <button
            type="button"
            onClick={clearCachedAppStorageAndReload}
            className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs cursor-pointer transition-colors"
          >
            Reset Cache &amp; Reload
          </button>
        </div>
      </div>
    </div>
  );

  if (reactRoot) {
    reactRoot.render(fallbackUi);
  } else {
    reactRoot = createRoot(container);
    reactRoot.render(fallbackUi);
  }
}

window.addEventListener('error', (event) => {
  if (event.target && event.target !== window && !event.error) return;
  const errMsg = event.error instanceof Error ? event.error.message : event.message || 'Runtime startup error';
  console.error('[Global Window Error]', errMsg, event.error || event);
  if (!appMounted) {
    renderStartupFallback(errMsg);
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const errMsg = reason instanceof Error ? reason.message : String(reason || 'Unhandled async rejection');
  console.error('[Global Unhandled Rejection]', errMsg, reason);
  if (!appMounted) {
    renderStartupFallback(errMsg);
  }
});

async function bootstrap(): Promise<void> {
  const container = document.getElementById('root');
  if (!container) {
    throw new Error('Root mount container (#root) is missing from document.');
  }

  reactRoot = createRoot(container);
  reactRoot.render(
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6 text-center">
      <div className="space-y-3">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-neutral-900 border border-neutral-800 p-2 flex items-center justify-center">
          <img
            src={LOGO_URL}
            alt="Arabian Shawarma & Pizza"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="text-base font-bold text-amber-400 font-display">
          Arabian Shawarma &amp; Pizza
        </div>
        <p className="text-xs text-neutral-400">Preparing fresh menu &amp; combos...</p>
      </div>
    </div>
  );

  try {
    const { default: App } = await import('./App.tsx');
    appMounted = true;
    reactRoot.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to load application bundle.';
    console.error('[App Bootstrap Failure]', error);
    renderStartupFallback(message);
  }
}

void bootstrap();

