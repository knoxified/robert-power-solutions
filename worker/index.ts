/**
 * Robert Power Solutions — Cloudflare Worker
 *  - serves the static React site (ASSETS)
 *  - public read-only API for blog posts + gallery, and serves uploaded media from Workers KV (free plan)
 *  - a hidden, password-protected admin (ADMIN path) for uploads and blog writing
 * Secrets (never in git): ADMIN_PASSWORD, SESSION_SECRET.   KV binding: MEDIA.
 */
import adminHtml from "./admin.html";
import loginHtml from "./login.html";
import { SEO_PAGES, buildSchema, schemaScript } from "../shared/seo";

export interface Env {
  ASSETS: Fetcher;
  MEDIA: KVNamespace; // all content lives here: posts, media index, uploaded files, login throttle
  ADMIN_PASSWORD: string;
  SESSION_SECRET: string;
}

// Unlisted admin address. Change it here AND in wrangler.jsonc (run_worker_first) to move it.
const ADMIN = "/robert-studio-9k4x";
const MAX_UPLOAD = 24 * 1024 * 1024; // KV value limit is 25 MiB
const SESSION_SECONDS = 7 * 24 * 3600;
const COOKIE = "rps_session";
const te = new TextEncoder();

type PostMeta = { slug: string; title: string; excerpt: string; cover: string; status: "draft" | "published"; publishedAt: string | null; updatedAt: string };
type Post = PostMeta & { body: string; createdAt: string };
type MediaItem = { key: string; name: string; type: "image" | "video"; size: number; caption: string; gallery: boolean; createdAt: string };

const UPLOAD_TYPES: Record<string, { ext: string; kind: "image" | "video" }> = {
  "image/jpeg": { ext: "jpg", kind: "image" }, "image/png": { ext: "png", kind: "image" },
  "image/webp": { ext: "webp", kind: "image" }, "image/gif": { ext: "gif", kind: "image" },
  "video/mp4": { ext: "mp4", kind: "video" }, "video/quicktime": { ext: "mov", kind: "video" }, "video/webm": { ext: "webm", kind: "video" },
};

/* ---------- helpers ---------- */
const json = (data: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex", ...extra } });

/* ---------- storage layer (Workers KV). Swap these few functions to move to R2 / another host. ---------- */
async function readJSON<T>(env: Env, key: string, fallback: T): Promise<T> {
  return ((await env.MEDIA.get(key, "json")) as T | null) ?? fallback;
}
const writeJSON = (env: Env, key: string, v: unknown, ttl?: number) => env.MEDIA.put(key, JSON.stringify(v), ttl ? { expirationTtl: ttl } : undefined);

const b64u = (u: Uint8Array) => btoa(String.fromCharCode(...u)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
async function sha256(s: string) { return new Uint8Array(await crypto.subtle.digest("SHA-256", te.encode(s))); }
function safeEq(a: Uint8Array, b: Uint8Array) { if (a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a[i] ^ b[i]; return d === 0; }
async function hmac(secret: string, data: string) {
  const k = await crypto.subtle.importKey("raw", te.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64u(new Uint8Array(await crypto.subtle.sign("HMAC", k, te.encode(data))));
}
const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

async function isAuthed(req: Request, env: Env): Promise<boolean> {
  if (!env.SESSION_SECRET) return false;
  const m = (req.headers.get("cookie") || "").match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  if (!m) return false;
  const [exp, sig] = m[1].split(".");
  if (!exp || !sig || Number(exp) < Date.now() / 1000) return false;
  return safeEq(te.encode(sig), te.encode(await hmac(env.SESSION_SECRET, "s1." + exp)));
}
// CSRF guard for anything that changes data: same origin + custom header (cookie is also SameSite=Strict).
const sameOrigin = (req: Request, url: URL) => { const o = req.headers.get("origin"); return (!o || o === url.origin) && req.headers.get("x-rps") === "1"; };

/* ---------- admin ---------- */
const ADMIN_CSP = "default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self' blob: data:; media-src 'self' blob:; connect-src 'self'; frame-src https://www.youtube-nocookie.com; frame-ancestors 'none'; base-uri 'none'";
const adminPage = (html: string) => new Response(html.replaceAll("__ADMIN__", ADMIN), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex, nofollow", "content-security-policy": ADMIN_CSP, "x-frame-options": "DENY" } });

async function admin(req: Request, env: Env, url: URL): Promise<Response> {
  const sub = url.pathname.slice(ADMIN.length).replace(/\/+$/, "");
  const authed = await isAuthed(req, env);

  if (sub === "" && req.method === "GET") return adminPage(authed ? adminHtml : loginHtml);
  if (!sub.startsWith("/api/")) return json({ error: "Not found" }, 404);

  if (sub === "/api/login") {
    if (req.method !== "POST" || !sameOrigin(req, url)) return json({ error: "Bad request" }, 400);
    const ip = req.headers.get("cf-connecting-ip") || "unknown";
    const key = `auth/ip-${b64u(await sha256(ip)).slice(0, 24)}.json`;
    const state = await readJSON(env, key, { count: 0, until: 0 });
    if (state.until > Date.now()) return json({ error: "Too many wrong attempts. Please wait 15 minutes and try again." }, 429);
    const body = (await req.json().catch(() => ({}))) as { password?: string };
    const ok = !!env.ADMIN_PASSWORD && !!env.SESSION_SECRET && typeof body.password === "string" && safeEq(await sha256(body.password), await sha256(env.ADMIN_PASSWORD));
    if (!ok) {
      state.count++;
      if (state.count >= 5) { state.until = Date.now() + 15 * 60_000; state.count = 0; }
      await writeJSON(env, key, state, 3600);
      await new Promise(r => setTimeout(r, 600));
      return json({ error: "That password is not correct." }, 401);
    }
    if (state.count || state.until) await env.MEDIA.delete(key);
    const exp = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
    const sig = await hmac(env.SESSION_SECRET, "s1." + exp);
    return json({ ok: true }, 200, { "set-cookie": `${COOKIE}=${exp}.${sig}; Path=${ADMIN}; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_SECONDS}` });
  }

  if (!authed) return json({ error: "Please log in again." }, 401);
  if (req.method !== "GET" && !sameOrigin(req, url)) return json({ error: "Blocked" }, 403);

  if (sub === "/api/logout" && req.method === "POST") return json({ ok: true }, 200, { "set-cookie": `${COOKIE}=; Path=${ADMIN}; HttpOnly; Secure; SameSite=Strict; Max-Age=0` });

  // posts
  if (sub === "/api/posts" && req.method === "GET") return json(await readJSON<PostMeta[]>(env, "index/posts.json", []));
  const pm = sub.match(/^\/api\/posts\/([a-z0-9-]+)$/);
  if (pm) {
    const slug = pm[1];
    if (req.method === "GET") { const p = await readJSON<Post | null>(env, `posts/${slug}.json`, null); return p ? json(p) : json({ error: "Not found" }, 404); }
    if (req.method === "DELETE") {
      await env.MEDIA.delete(`posts/${slug}.json`);
      await writeJSON(env, "index/posts.json", (await readJSON<PostMeta[]>(env, "index/posts.json", [])).filter(p => p.slug !== slug));
      return json({ ok: true });
    }
    if (req.method === "PUT") {
      const d = (await req.json().catch(() => null)) as Partial<Post> | null;
      if (!d || typeof d.title !== "string" || !d.title.trim()) return json({ error: "Please add a title." }, 400);
      const existing = await readJSON<Post | null>(env, `posts/${slug}.json`, null);
      if (url.searchParams.get("new") && existing) return json({ error: "A post with that web address already exists. Change the title or web address." }, 409);
      const now = new Date().toISOString();
      const status = d.status === "published" ? "published" : "draft";
      const cover = typeof d.cover === "string" && d.cover.startsWith("/media/uploads/") ? d.cover : "";
      const post: Post = {
        slug, title: d.title.trim().slice(0, 200), excerpt: String(d.excerpt || "").trim().slice(0, 400), cover,
        body: String(d.body || "").slice(0, 200_000), status, createdAt: existing?.createdAt || now, updatedAt: now,
        publishedAt: status === "published" ? existing?.publishedAt || now : existing?.publishedAt || null,
      };
      await writeJSON(env, `posts/${slug}.json`, post);
      const { body: _b, createdAt: _c, ...meta } = post;
      const idx = (await readJSON<PostMeta[]>(env, "index/posts.json", [])).filter(p => p.slug !== slug);
      idx.push(meta);
      idx.sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1));
      await writeJSON(env, "index/posts.json", idx);
      return json({ ok: true, post });
    }
  }

  // media
  if (sub === "/api/media" && req.method === "GET") return json(await readJSON<MediaItem[]>(env, "index/media.json", []));
  if (sub === "/api/upload" && req.method === "PUT") {
    const ct = (req.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    const t = UPLOAD_TYPES[ct];
    if (!t) return json({ error: "That file type is not supported. Use JPG, PNG, WebP, MP4, MOV or WebM." }, 415);
    const declared = Number(req.headers.get("content-length") || 0);
    if (declared > MAX_UPLOAD) return json({ error: "That file is over 24 MB. Please trim or compress it first, or add it to a post as a YouTube link." }, 413);
    const buf = await req.arrayBuffer();
    if (!buf.byteLength) return json({ error: "Empty file." }, 400);
    if (buf.byteLength > MAX_UPLOAD) return json({ error: "That file is over 24 MB. Please trim or compress it first, or add it to a post as a YouTube link." }, 413);
    const len = buf.byteLength;
    const name = (url.searchParams.get("name") || "file").slice(0, 120);
    const base = slugify(name.replace(/\.[^.]+$/, "")) || "file";
    const d = new Date();
    const key = `uploads/${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}/${crypto.randomUUID().slice(0, 8)}-${base}.${t.ext}`;
    await env.MEDIA.put(key, buf, { metadata: { ct } });
    const item: MediaItem = { key, name, type: t.kind, size: len, caption: (url.searchParams.get("caption") || "").slice(0, 200), gallery: url.searchParams.get("gallery") !== "0", createdAt: d.toISOString() };
    const idx = await readJSON<MediaItem[]>(env, "index/media.json", []);
    idx.unshift(item);
    await writeJSON(env, "index/media.json", idx);
    return json({ ok: true, item });
  }
  if (sub === "/api/media" && req.method === "PATCH") {
    const d = (await req.json().catch(() => ({}))) as { key?: string; caption?: string; gallery?: boolean };
    const idx = await readJSON<MediaItem[]>(env, "index/media.json", []);
    const it = idx.find(i => i.key === d.key);
    if (!it) return json({ error: "Not found" }, 404);
    if (typeof d.caption === "string") it.caption = d.caption.slice(0, 200);
    if (typeof d.gallery === "boolean") it.gallery = d.gallery;
    await writeJSON(env, "index/media.json", idx);
    return json({ ok: true, item: it });
  }
  if (sub === "/api/media" && req.method === "DELETE") {
    const key = url.searchParams.get("key") || "";
    if (!key.startsWith("uploads/")) return json({ error: "Bad key" }, 400);
    await env.MEDIA.delete(key);
    await writeJSON(env, "index/media.json", (await readJSON<MediaItem[]>(env, "index/media.json", [])).filter(i => i.key !== key));
    return json({ ok: true });
  }
  return json({ error: "Not found" }, 404);
}

/* ---------- public ---------- */
const PUBLIC_CACHE = { "cache-control": "public, max-age=60, s-maxage=60" };

async function publicApi(env: Env, path: string): Promise<Response | null> {
  if (path === "/api/posts") {
    const list = (await readJSON<PostMeta[]>(env, "index/posts.json", [])).filter(p => p.status === "published");
    list.sort((a, b) => ((b.publishedAt || "") > (a.publishedAt || "") ? 1 : -1));
    return json(list, 200, PUBLIC_CACHE);
  }
  const m = path.match(/^\/api\/posts\/([a-z0-9-]+)$/);
  if (m) {
    const p = await readJSON<Post | null>(env, `posts/${m[1]}.json`, null);
    if (!p || p.status !== "published") return json({ error: "Not found" }, 404);
    return json(p, 200, PUBLIC_CACHE);
  }
  if (path === "/api/gallery") {
    return json((await readJSON<MediaItem[]>(env, "index/media.json", [])).filter(i => i.gallery), 200, PUBLIC_CACHE);
  }
  return null;
}

async function serveMedia(req: Request, env: Env, key: string): Promise<Response> {
  if (!key.startsWith("uploads/") || key.includes("..")) return new Response("Not found", { status: 404 });
  const { value, metadata } = await env.MEDIA.getWithMetadata<{ ct?: string }>(key, "arrayBuffer");
  if (!value) return new Response("Not found", { status: 404 });
  const total = value.byteLength;
  const h = new Headers({
    "content-type": metadata?.ct || "application/octet-stream", "accept-ranges": "bytes",
    "cache-control": "public, max-age=31536000, immutable", "x-content-type-options": "nosniff",
  });
  // Range support is required for video seeking (and for Safari to play video at all).
  const rm = (req.headers.get("range") || "").match(/^bytes=(\d*)-(\d*)$/);
  if (rm && (rm[1] || rm[2])) {
    const start = rm[1] === "" ? Math.max(0, total - Number(rm[2])) : Number(rm[1]);
    const end = rm[1] === "" || rm[2] === "" ? total - 1 : Math.min(Number(rm[2]), total - 1);
    if (start > end || start >= total) return new Response(null, { status: 416, headers: { "content-range": `bytes */${total}` } });
    h.set("content-range", `bytes ${start}-${end}/${total}`);
    h.set("content-length", String(end - start + 1));
    return new Response(req.method === "HEAD" ? null : value.slice(start, end + 1), { status: 206, headers: h });
  }
  h.set("content-length", String(total));
  return new Response(req.method === "HEAD" ? null : value, { headers: h });
}

const STATIC_PAGES = Object.keys(SEO_PAGES).map(p => p.replace(/^\//, ""));
async function sitemap(env: Env, origin: string): Promise<Response> {
  const posts = (await readJSON<PostMeta[]>(env, "index/posts.json", [])).filter(p => p.status === "published");
  const rows = STATIC_PAGES.map(p => `  <url><loc>${origin}/${p}</loc></url>`).concat(posts.map(p => `  <url><loc>${origin}/blog/${p.slug}</loc><lastmod>${p.updatedAt.slice(0, 10)}</lastmod></url>`));
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.join("\n")}\n</urlset>\n`, { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=300" } });
}

// Blog posts are client-rendered, so inject real title/description/share-image for crawlers and WhatsApp previews.
async function blogPage(req: Request, env: Env, url: URL, slug: string): Promise<Response> {
  const shell = await env.ASSETS.fetch(new Request(new URL("/", url).toString(), req));
  const p = await readJSON<Post | null>(env, `posts/${slug}.json`, null);
  if (!p || p.status !== "published") return shell;
  const title = `${p.title} | Robert Power Solutions`;
  const desc = p.excerpt || p.body.replace(/[#*_>`!\[\]()-]/g, " ").replace(/\s+/g, " ").trim().slice(0, 155);
  const img = p.cover ? url.origin + p.cover : url.origin + "/images/logo.png";
  const set = (attr: string, value: string) => ({ element(e: Element) { e.setAttribute(attr, value); } });
  return new HTMLRewriter()
    .on("title", { element(e) { e.setInnerContent(title); } })
    .on('meta[name="description"]', set("content", desc))
    .on('meta[property="og:title"]', set("content", title))
    .on('meta[property="og:description"]', set("content", desc))
    .on('meta[property="og:type"]', set("content", "article"))
    .on('meta[property="og:url"]', set("content", `${url.origin}/blog/${slug}`))
    .on('meta[property="og:image"]', set("content", img))
    .on('meta[name="twitter:image"]', set("content", img))
    .on('link[rel="canonical"]', set("href", `${url.origin}/blog/${slug}`))
    .on("head", { element(e) { e.append(`<script id="post-schema" type="application/ld+json">${schemaScript({ "@context": "https://schema.org", "@type": "BlogPosting", headline: p.title, description: desc, datePublished: p.publishedAt, dateModified: p.updatedAt, image: img, author: { "@type": "Person", name: "Robert Emeka" }, publisher: { "@type": "Organization", name: "Robert Power Solutions", logo: { "@type": "ImageObject", url: url.origin + "/images/logo.png" } }, mainEntityOfPage: `${url.origin}/blog/${slug}` })}</script>`, { html: true }); } })
    .transform(shell);
}

// Marketing pages are client-rendered React; inject each page's own title/description/share tags and
// structured data into the HTML so search engines and link previews get them without running JavaScript.
async function pageShell(req: Request, env: Env, url: URL, path: string): Promise<Response> {
  const shell = await env.ASSETS.fetch(new Request(new URL("/", url).toString(), req));
  const m = SEO_PAGES[path];
  if (!m) return shell;
  const set = (attr: string, value: string) => ({ element(e: Element) { e.setAttribute(attr, value); } });
  const canonical = url.origin + (path === "/" ? "/" : path);
  return new HTMLRewriter()
    .on("title", { element(e) { e.setInnerContent(m.title); } })
    .on('meta[name="description"]', set("content", m.description))
    .on('meta[property="og:title"]', set("content", m.title))
    .on('meta[property="og:description"]', set("content", m.description))
    .on('meta[property="og:url"]', set("content", canonical))
    .on('link[rel="canonical"]', set("href", canonical))
    .on("head", { element(e) { e.append(`<script id="robert-power-schema" type="application/ld+json">${schemaScript(buildSchema(url.origin, path))}</script>`, { html: true }); } })
    .transform(shell);
}

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url);
    const p = url.pathname;
    try {
      if (p === ADMIN || p.startsWith(ADMIN + "/")) return await admin(req, env, url);
      if (req.method === "GET" || req.method === "HEAD") {
        // Edge-cache public reads so KV's free daily read allowance is barely touched.
        const cacheable = (p.startsWith("/media/") && !req.headers.get("range")) || p.startsWith("/api/") || p === "/sitemap.xml";
        const cache = caches.default;
        if (cacheable && req.method === "GET") { const hit = await cache.match(req); if (hit) return hit; }
        let res: Response | null = null;
        if (p.startsWith("/api/")) res = (await publicApi(env, p)) || json({ error: "Not found" }, 404);
        else if (p.startsWith("/media/")) res = await serveMedia(req, env, decodeURIComponent(p.slice(7)));
        else if (p === "/sitemap.xml") res = await sitemap(env, url.origin);
        else { const bm = p.match(/^\/blog\/([a-z0-9-]+)\/?$/); if (bm) return await blogPage(req, env, url, bm[1]); }
        if (res) {
          if (cacheable && req.method === "GET" && res.status === 200) ctx.waitUntil(cache.put(req, res.clone()));
          return res;
        }
      }
    } catch (err) {
      console.error(err);
      return json({ error: "Something went wrong. Please try again." }, 500);
    }
    if (req.method === "GET" || req.method === "HEAD") {
      const norm = p.length > 1 ? p.replace(/\/+$/, "") : p;
      if (SEO_PAGES[norm]) return pageShell(req, env, url, norm);
    }
    // Anything that is not a file and not a known page is a real 404 (SPA shell still renders the friendly page).
    if ((req.method === "GET" || req.method === "HEAD") && !/\.[a-z0-9]+$/i.test(p)) {
      const r = await env.ASSETS.fetch(new Request(new URL("/", url).toString(), req));
      const h = new Headers(r.headers);
      h.set("x-robots-tag", "noindex");
      return new Response(r.body, { status: 404, headers: h });
    }
    return env.ASSETS.fetch(req);
  },
};
