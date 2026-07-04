/**
 * Press wordmark generator.
 *
 * We don't ship 15+ third-party brand SVGs (copyright + unreliable sourcing for
 * the Iranian outlets). Instead each outlet name is rendered as a clean inline
 * SVG wordmark using the site's own fonts — Vazirmatn for Persian, Inter for
 * Latin. `fill="currentColor"` lets the mark inherit the press-card's gold→cyan
 * hover recolor for free.
 *
 * The SVG carries only a viewBox (no width/height attrs); CSS sets the height
 * and the browser derives width from the viewBox aspect ratio. viewBox width is
 * estimated from character count and intentionally generous so text is never
 * clipped — any surplus is transparent padding on the trailing edge.
 */

const escapeXml = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string)
  );

const hasPersian = (s: string) => /[؀-ۿ]/.test(s);

const VIEW_H = 32;
const FONT_SIZE = 22;
const PAD_X = 3;

export function pressWordmark(name: string): string {
  const fa = hasPersian(name);
  const fontFamily = fa
    ? "Vazirmatn, sans-serif"
    : "Inter, ui-sans-serif, system-ui, sans-serif";
  // Generous per-glyph advance so descenders/wide glyphs never clip.
  const advance = FONT_SIZE * (fa ? 0.64 : 0.62);
  const width = Math.round(name.length * advance) + PAD_X * 2;
  const baseline = fa ? VIEW_H / 2 + FONT_SIZE * 0.34 : VIEW_H / 2 + FONT_SIZE * 0.35;
  // Persian is a connected script — any letter-spacing breaks the joins.
  const letterSpacing = fa ? "normal" : "-0.01em";
  const safe = escapeXml(name);

  // Always anchor at the start with an explicit LTR base direction. The page
  // sets dir="rtl" in Persian, which would otherwise flip text-anchor semantics
  // and push the mark off-canvas; direction="ltr" keeps the anchor stable while
  // the Unicode bidi algorithm still shapes the Persian run right-to-left.
  return (
    `<svg viewBox="0 0 ${width} ${VIEW_H}" role="img" aria-label="${safe}" ` +
    `xmlns="http://www.w3.org/2000/svg" class="press-wordmark">` +
    `<text x="${PAD_X}" y="${baseline}" text-anchor="start" direction="ltr" ` +
    `font-family="${fontFamily}" font-size="${FONT_SIZE}" font-weight="700" ` +
    `fill="currentColor" letter-spacing="${letterSpacing}">${safe}</text>` +
    `</svg>`
  );
}
