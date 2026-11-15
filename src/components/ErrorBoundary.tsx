import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ORBIT Error:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex items-center justify-center w-full min-h-dvh bg-[#030308] text-white p-6">
        <div className="max-w-sm text-center" role="alert">
          <svg className="mx-auto mb-5" width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <circle cx="22" cy="26" r="9" fill="rgba(243,238,226,0.85)" />
            <path d="M33 10l-3 6 5 2" stroke="#fda4af" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="36" cy="12" r="2" fill="#fda4af" />
          </svg>
          <h1 className="font-display text-xl font-medium mb-2">ORBIT hit a problem</h1>
          <p className="text-sm text-slate-400 leading-relaxed mb-1">Your projects are stored on this device and weren’t affected.</p>
          <p className="text-xs text-slate-500 mb-6 break-words">{this.state.error?.message}</p>
          <div className="flex items-center justify-center gap-2">
            <button className="btn btn-primary" onClick={() => this.setState({ hasError: false, error: null })}>
              Try again
            </button>
            <button className="btn btn-ghost" onClick={() => window.location.reload()}>
              Reload
            </button>
          </div>
        </div>
      </div>
    );
  }
}
