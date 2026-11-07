import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { ArrowLeft, ArrowRight, Play, X } from "lucide-react";
import { renderMarkdown } from "@shared/markdown";
import { GALLERY_SEED } from "@/lib/gallery-seed";
import { ContactStrip, LazyImage, PageIntro, Shell } from "./SitePages";

type PostMeta = { slug: string; title: string; excerpt: string; cover: string; publishedAt: string | null };
type Post = PostMeta & { body: string };
type MediaItem = { key: string; type: "image" | "video"; caption: string; name: string };

function useJSON<T>(url: string, initial: T) {
  const [data, setData] = useState<T>(initial);
  const [state, setState] = useState<"loading" | "ok" | "error" | "missing">("loading");
  useEffect(() => {
    let live = true;
    setState("loading");
    fetch(url)
      .then(r => { if (r.status === 404) throw new Error("missing"); if (!r.ok) throw new Error("error"); return r.json(); })
      .then(d => { if (live) { setData(d); setState("ok"); } })
      .catch(e => live && setState(e.message === "missing" ? "missing" : "error"));
    return () => { live = false; };
  }, [url]);
  return { data, state };
}

const niceDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }) : "");

function setMeta(selector: string, attr: string, value: string) {
  let n = document.querySelector(selector);
  if (!n) { n = document.createElement("meta"); n.setAttribute(attr, selector.match(/"([^"]+)"/)?.[1] || ""); document.head.appendChild(n); }
  n.setAttribute("content", value);
}

export function Blog() {
  const { data, state } = useJSON<PostMeta[]>("/api/posts", []);
  return <Shell>
    <PageIntro eyebrow="FIELD NOTES & GUIDES" title={<>Solar know-how, <em>straight from the field.</em></>} text="Practical write-ups from real installations and repairs: what went wrong, how it was fixed, and what to look out for." />
    <section className="content-section"><div className="container">
      {state === "loading" && <p className="content-empty">Loading posts…</p>}
      {state === "error" && <p className="content-empty">Posts could not load right now. Please refresh in a moment.</p>}
      {state === "ok" && data.length === 0 && <div className="content-empty"><strong>First posts coming soon.</strong><p>In the meantime, send Robert a WhatsApp message about your system.</p></div>}
      <div className="post-grid">{data.map(p => <Link href={`/blog/${p.slug}`} className="post-card" key={p.slug}>
        <div className="post-card-img">{p.cover ? <LazyImage src={p.cover} alt={p.title} /> : <span className="post-card-ph">R</span>}</div>
        <div className="post-card-body"><small>{niceDate(p.publishedAt)}</small><h3>{p.title}</h3><p>{p.excerpt}</p><span className="card-link-inline">Read post <ArrowRight size={14} /></span></div>
      </Link>)}</div>
    </div></section>
    <ContactStrip />
  </Shell>;
}

export function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug || "";
  const { data: post, state } = useJSON<Post | null>(`/api/posts/${slug}`, null);
  useEffect(() => {
    if (!post) return;
    const title = `${post.title} | Robert Power Solutions`;
    const desc = post.excerpt || post.body.replace(/[#*_>`!\[\]()-]/g, " ").replace(/\s+/g, " ").trim().slice(0, 155);
    document.title = title;
    setMeta('meta[name="description"]', "name", desc);
    setMeta('meta[property="og:title"]', "property", title);
    setMeta('meta[property="og:description"]', "property", desc);
    if (post.cover) setMeta('meta[property="og:image"]', "property", window.location.origin + post.cover);
    document.getElementById("post-schema")?.remove();
    const s = document.createElement("script");
    s.type = "application/ld+json"; s.id = "post-schema";
    s.text = JSON.stringify({ "@context": "https://schema.org", "@type": "BlogPosting", headline: post.title, description: desc, datePublished: post.publishedAt, image: post.cover ? window.location.origin + post.cover : undefined, author: { "@type": "Organization", name: "Robert Power Solutions" }, publisher: { "@type": "Organization", name: "Robert Power Solutions" }, mainEntityOfPage: window.location.href });
    document.head.appendChild(s);
    return () => { document.getElementById("post-schema")?.remove(); };
  }, [post]);
  return <Shell>
    <section className="post-hero"><div className="container post-narrow">
      <Link href="/blog" className="post-back"><ArrowLeft size={14} /> All posts</Link>
      {state === "ok" && post && <><small>{niceDate(post.publishedAt)}</small><h1>{post.title}</h1>{post.excerpt && <p>{post.excerpt}</p>}</>}
      {state === "loading" && <h1>Loading…</h1>}
      {(state === "missing" || state === "error") && <h1>{state === "missing" ? "That post was not found" : "Could not load this post"}</h1>}
    </div></section>
    {state === "ok" && post && <article className="post-body"><div className="container post-narrow">
      {post.cover && <div className="post-cover"><LazyImage src={post.cover} alt={post.title} priority /></div>}
      <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }} />
    </div></article>}
    <ContactStrip />
  </Shell>;
}

type GalleryEntry = { id: string; src: string; type: "image" | "video"; caption: string; alt: string };

export function Gallery() {
  const { data, state } = useJSON<MediaItem[]>("/api/gallery", []);
  const [open, setOpen] = useState<GalleryEntry | null>(null);
  // Robert's uploads first, then the photos that ship with the site.
  const items: GalleryEntry[] = [
    ...data.map(m => ({ id: m.key, src: `/media/${m.key}`, type: m.type, caption: m.caption, alt: m.caption || "Robert Power Solutions installation" })),
    ...GALLERY_SEED.map(g => ({ id: g.src, src: g.src, type: "image" as const, caption: g.caption, alt: g.alt })),
  ];
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);
  return <Shell>
    <PageIntro eyebrow="REAL JOBS · REAL SYSTEMS" title={<>See the work <em>for yourself.</em></>} text="Photos and videos straight from Robert Power Solutions installations and repairs across Nigeria, including Deye and Cworth Energy systems." />
    <section className="content-section"><div className="container">
      <div className="gallery-grid">{items.map(m => <button className="gallery-item" key={m.id} onClick={() => setOpen(m)} aria-label={m.caption || "Open"}>
        {m.type === "video" ? <><video src={`${m.src}#t=0.1`} preload="metadata" muted playsInline /><span className="gallery-play"><Play size={22} fill="currentColor" /></span></> : <LazyImage src={m.src} alt={m.alt} />}
        {m.caption && <span className="gallery-cap">{m.caption}</span>}
      </button>)}</div>
    </div></section>
    {open && <div className="lightbox" onClick={() => setOpen(null)} role="dialog" aria-modal="true">
      <button className="lightbox-close" aria-label="Close"><X size={22} /></button>
      <div onClick={e => e.stopPropagation()}>{open.type === "video" ? <video src={open.src} controls autoPlay playsInline /> : <img src={open.src} alt={open.alt} />}{open.caption && <p>{open.caption}</p>}</div>
    </div>}
    <ContactStrip />
  </Shell>;
}
