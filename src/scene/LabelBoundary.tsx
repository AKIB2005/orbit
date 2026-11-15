import { Component, Suspense, type ReactNode } from 'react';

/**
 * Isolates 3D text labels. troika's <Text> suspends while it fetches a font, and throws if that
 * fails (offline, blocked CDN). Without this, one label would hide — or crash — the whole scene.
 * Labels simply don't appear until/unless the font is available.
 */
class Catch extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function LabelBoundary({ children }: { children: ReactNode }) {
  return (
    <Catch>
      <Suspense fallback={null}>{children}</Suspense>
    </Catch>
  );
}
