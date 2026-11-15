import { Fragment, memo, type ReactNode } from 'react';

/**
 * Minimal, dependency-free renderer for the markdown subset the AI engine emits:
 * `### heading`, `- bullet`, **bold**, *italic*, `code`. Output is React elements only
 * (never innerHTML), so model output can't inject markup.
 */
function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith('**')) out.push(<strong key={i++} className="font-semibold text-white">{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith('`')) out.push(<code key={i++} className="px-1 py-0.5 rounded bg-white/[0.08] text-[0.92em] font-mono text-slate-100">{tok.slice(1, -1)}</code>);
    else out.push(<em key={i++} className="italic text-slate-100">{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export const RichText = memo(function RichText({ text }: { text: string }) {
  const lines = text.split('\n');
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];

  const flush = (key: string) => {
    if (!bullets.length) return;
    blocks.push(
      <ul key={key} className="space-y-1 pl-4 list-disc marker:text-slate-500">
        {bullets.map((b, i) => (
          <li key={i}>{inline(b)}</li>
        ))}
      </ul>
    );
    bullets = [];
  };

  lines.forEach((raw, idx) => {
    const line = raw.trimEnd();
    const bullet = /^\s*[-•]\s+(.*)$/.exec(line);
    if (bullet) {
      bullets.push(bullet[1]);
      return;
    }
    flush(`ul-${idx}`);
    if (!line.trim()) return;
    const h = /^#{1,4}\s+(.*)$/.exec(line);
    if (h) {
      blocks.push(
        <h4 key={idx} className="font-display text-sm font-medium text-white pt-1">
          {inline(h[1])}
        </h4>
      );
    } else {
      blocks.push(<p key={idx}>{inline(line)}</p>);
    }
  });
  flush('ul-end');

  return (
    <div className="space-y-2.5">
      {blocks.map((b, i) => (
        <Fragment key={i}>{b}</Fragment>
      ))}
    </div>
  );
});
