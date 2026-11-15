import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { RichText } from '../components/ai/RichText';

const html = (t: string) => renderToStaticMarkup(<RichText text={t} />);

describe('RichText (AI reply renderer)', () => {
  it('renders headings, bold, italics and code without leaving raw markdown', () => {
    const out = html('### Plan\n\nDo **this** first, *then* run `npm test`.');
    expect(out).toContain('<h4');
    expect(out).toContain('<strong');
    expect(out).toContain('<em');
    expect(out).toContain('<code');
    expect(out).not.toContain('###');
    expect(out).not.toContain('**');
  });
  it('groups consecutive bullets into one list', () => {
    const out = html('- one\n- two\n- three');
    expect(out.match(/<ul/g)).toHaveLength(1);
    expect(out.match(/<li/g)).toHaveLength(3);
  });
  it('escapes HTML instead of injecting it', () => {
    const out = html('<script>alert(1)</script> <img src=x onerror=alert(1)>');
    expect(out).not.toContain('<script');
    expect(out).not.toContain('<img');
    expect(out).toContain('&lt;script&gt;');
  });
  it('handles empty input', () => {
    expect(html('')).toBe('<div class="space-y-2.5"></div>');
  });
});
