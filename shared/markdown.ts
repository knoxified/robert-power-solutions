/**
 * Minimal, XSS-safe Markdown → HTML for blog posts written in the admin.
 * All text is HTML-escaped FIRST, then formatting is applied, and URLs are restricted
 * to https/http, /media/ (our own uploads), mailto and tel. Raw HTML in a post is shown as text.
 * Supported: # ## ### headings, **bold**, *italic*, [links](url), ![image](url), ![video](url),
 * - lists, 1. lists, > quotes, --- rules, paragraphs.
 */
export function renderMarkdown(src: string): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const url = (u: string) => (/^(https?:\/\/|\/media\/|mailto:|tel:)/i.test(u) ? u : "#");
  const inline = (t: string) =>
    esc(t)
      .replace(/!\[video\]\(([^)\s]+)\)/g, (_m, a) => `<video controls preload="metadata" playsinline src="${url(a)}"></video>`)
      .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_m, a, b) => `<img alt="${a}" src="${url(b)}" loading="lazy">`)
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, a, b) => `<a href="${url(b)}" target="_blank" rel="noopener noreferrer">${a}</a>`)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>");
  const lines = String(src).replace(/\r/g, "").split("\n");
  const out: string[] = [];
  let i = 0;
  const isBlock = (l: string) => /^(#{1,3}\s|>|---+$|\s*[-*]\s|\s*\d+\.\s)/.test(l);
  while (i < lines.length) {
    const l = lines[i];
    if (!l.trim()) { i++; continue; }
    const h = l.match(/^(#{1,3})\s+(.*)$/);
    if (h) { const n = h[1].length + 1; out.push(`<h${n}>${inline(h[2])}</h${n}>`); i++; continue; }
    if (/^---+$/.test(l.trim())) { out.push("<hr>"); i++; continue; }
    if (/^>\s?/.test(l)) { const q: string[] = []; while (i < lines.length && /^>\s?/.test(lines[i])) { q.push(lines[i].replace(/^>\s?/, "")); i++; } out.push(`<blockquote>${inline(q.join(" "))}</blockquote>`); continue; }
    if (/^\s*[-*]\s+/.test(l)) { const li: string[] = []; while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { li.push(`<li>${inline(lines[i].replace(/^\s*[-*]\s+/, ""))}</li>`); i++; } out.push(`<ul>${li.join("")}</ul>`); continue; }
    if (/^\s*\d+\.\s+/.test(l)) { const li: string[] = []; while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { li.push(`<li>${inline(lines[i].replace(/^\s*\d+\.\s+/, ""))}</li>`); i++; } out.push(`<ol>${li.join("")}</ol>`); continue; }
    const p: string[] = [];
    while (i < lines.length && lines[i].trim() && !isBlock(lines[i])) { p.push(lines[i]); i++; }
    out.push(p.length === 1 && /^!\[/.test(p[0]) ? `<figure>${inline(p[0])}</figure>` : `<p>${inline(p.join("\n")).replace(/\n/g, "<br>")}</p>`);
  }
  return out.join("\n");
}
