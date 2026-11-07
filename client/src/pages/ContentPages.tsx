import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, MessageCircle, Phone, Play, X } from "lucide-react";
import { renderMarkdown } from "@shared/markdown";
import { GALLERY_SEED } from "@/lib/gallery-seed";
import { TROUBLESHOOTING_FAQ } from "@shared/seo";
import { ContactStrip, LazyImage, PageIntro, PHONE, PHONE_HREF, Shell, WA_HREF } from "./SitePages";

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

const GUIDE: { title: string; tag: string; causes: string; check: string; call: string }[] = [
  { tag: "ALARMS", title: "Inverter beeping or showing a fault code", causes: "Overload, low battery voltage, high temperature, a loose DC or AC connection, or a charging fault.", check: "Write down the exact code and what you switched on just before. Switch off heavy appliances, make sure nothing blocks the vents, and check that the breakers are fully on.", call: "The code keeps returning, the unit smells hot or burnt, or it will not reset after the load is reduced." },
  { tag: "OVERLOAD", title: "Inverter trips when you switch on AC, pressing iron or pump", causes: "Starting surge from heavy loads is higher than the inverter, battery or cable can supply.", check: "Run the heavy appliance alone and note which one trips it. Do not keep resetting; repeated overloads can damage the inverter.", call: "It trips with loads that should be within the rating. That points to sizing, battery capacity, wiring or a weak component." },
  { tag: "BATTERY", title: "Battery drains fast or backup is short", causes: "Ageing cells, too little charging, a load that has grown, or wrong charge and discharge settings.", check: "Compare how long it lasts now with when it was new, and list what is running on it. Check that panels and grid/generator input are actually charging it.", call: "Backup keeps shrinking or the battery shows very different voltages or percentages. It needs testing and possibly balancing or replacement." },
  { tag: "SOLAR INPUT", title: "Not charging from solar, or low solar production", causes: "Shading, dust on the panels (especially in harmattan), a tripped PV breaker, a loose panel connector, or a charge controller or MPPT fault.", check: "From the ground, look for shade, bird droppings and dust. Confirm the PV breaker is on. Never climb a wet or unsafe roof to check.", call: "Panels are clean and in sun but the inverter still shows little or no solar input." },
  { tag: "NO OUTPUT", title: "Inverter will not come on or has no output", causes: "A tripped breaker or fuse, battery protection shutdown, a loose cable, or a failed board.", check: "Check the AC and DC breakers and make sure the battery switch is on. If a lithium battery has shut itself off, do not force it back on.", call: "Everything is switched on and the unit is still dead or shows no display." },
  { tag: "HEAT", title: "Inverter overheating", causes: "Poor airflow, dust, a heavy load for long periods, a failed fan, or direct sun or heat on the wall.", check: "Make sure the unit has clear space around it and is not in a sealed cupboard. Reduce the load and let it cool.", call: "It overheats again quickly, the fan is silent or noisy, or you smell burning." },
  { tag: "GRID / GENERATOR", title: "Problems switching between grid, generator and solar", causes: "Unstable or out-of-range generator output, a faulty changeover or bypass, wrong input settings, or loose input wiring.", check: "Note whether the issue happens on grid, on generator or both, and whether it started after any wiring or setting change.", call: "The inverter keeps rejecting the input or drops the load during changeover." },
  { tag: "LITHIUM BMS", title: "Lithium battery not communicating or protecting itself", causes: "Wrong battery protocol setting on the inverter, a communication cable issue, or the battery management system (BMS) cutting out to protect the cells.", check: "Look at the battery display for alarms and note them. Do not open the battery or bridge any terminals.", call: "The battery shows an alarm, will not charge or discharge, or the inverter reports a battery communication error." },
];

export function Troubleshooting() {
  return <Shell>
    <PageIntro eyebrow="FREE TROUBLESHOOTING GUIDE" title={<>Solar inverter or battery problem? <em>Start here.</em></>} text="Plain-language checks for the most common solar faults in Nigeria: what to look at safely, what usually causes it, and when it is time to call a technician." />
    <section className="content-section"><div className="container post-narrow guide-wrap">
      <div className="guide-safety"><AlertTriangle size={22} /><div><strong>Safety first</strong><p>Inverters and batteries hold dangerous voltage and stored energy even when they look off. Do the visual and breaker-level checks below only. Never open the cover, touch terminals, bridge connections, or climb a wet or unsafe roof. If a battery is swollen, smoking or smells burnt, switch off at the breaker if it is safe to do so, keep people away, and call a technician.</p></div></div>
      <div className="guide-grid">{GUIDE.map(g => <article className="guide-card" key={g.title}>
        <small>{g.tag}</small><h2>{g.title}</h2>
        <p><b>Common causes:</b> {g.causes}</p>
        <p><b>Safe checks:</b> {g.check}</p>
        <p className="guide-call"><b>Call a technician when:</b> {g.call}</p>
      </article>)}</div>
      <div className="guide-send"><h2>Before you message Robert, send:</h2>
        <ul>{["Your location (city and state)", "Inverter and battery brand and model", "The fault code, or a description of what it is doing", "When it started and what changed before it", "A photo or short video of the unit and its display"].map(x => <li key={x}><Check size={16} /> {x}</li>)}</ul>
        <div className="intro-actions"><a className="button button-coral" href={WA_HREF} target="_blank" rel="noreferrer"><MessageCircle size={16} /> Send it on WhatsApp</a><a className="button button-dark" href={PHONE_HREF}><Phone size={15} /> {PHONE}</a></div>
      </div>
      <h2 className="guide-h2">Frequently asked questions</h2>
      <div className="faq-list">{TROUBLESHOOTING_FAQ.map(f => <details className="faq-item" key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}</div>
      <div className="guide-areas"><h2>Where we work</h2><p>Robert Power Solutions repairs inverters and lithium batteries and installs solar systems for homes and businesses across Nigeria by arrangement, with recent jobs in <strong>Lagos</strong> and in <strong>Anambra State</strong> (Onitsha, Nsugbe and Ozubulu). Systems seen on recent jobs include <strong>Deye</strong>, <strong>Cworth Energy</strong>, <strong>NetPower</strong> and <strong>Pattern</strong> inverters and batteries, and SMS lithium batteries. Using a different brand? Ask. <Link href="/repairs">See our repair service <ArrowRight size={14} /></Link> or <Link href="/gallery">browse recent installations <ArrowRight size={14} /></Link>.</p></div>
    </div></section>
    <ContactStrip />
  </Shell>;
}
