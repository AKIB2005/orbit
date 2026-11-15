/** Full-bleed loading state: a small planet with a satellite, no text-only spinner. */
export function SceneLoader({ label = 'Loading' }: { label?: string }) {
  return (
    <div
      className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-6 bg-[#030308]"
      role="status"
      aria-live="polite"
    >
      <div className="relative w-16 h-16">
        <div className="absolute inset-[22px] rounded-full bg-starlight/90" />
        <div className="absolute inset-0 rounded-full border border-white/15" />
        <div className="absolute inset-0 orbit-loader">
          <span className="absolute -top-[3px] left-1/2 -ml-[3px] w-1.5 h-1.5 rounded-full bg-ion shadow-[0_0_8px_var(--color-ion)]" />
        </div>
      </div>
      <p className="text-sm text-slate-400">{label}…</p>
    </div>
  );
}
