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
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ORBIT Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center w-full h-full bg-void text-text-primary">
          <div className="text-center max-w-md p-8">
            <div className="text-4xl mb-4">🪐</div>
            <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
            <p className="text-text-muted text-sm mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-md bg-accent-violet text-white text-sm font-medium hover:bg-accent-violet/80 transition-colors"
            >
              Reload ORBIT
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
