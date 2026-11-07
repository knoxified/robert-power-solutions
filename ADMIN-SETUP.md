# Robert's Studio (uploads + blog) — setup

Everything runs on Cloudflare's **free plan, no card needed**: a Worker (`worker/index.ts`) + one free
Workers KV namespace for posts, uploaded photos and short videos. No Supabase, no paid storage.

## Secrets (the 2 values you must add)
`ADMIN_PASSWORD` (Robert's login) and `SESSION_SECRET` (any long random string, e.g. `openssl rand -hex 32`).

**Never put them in git or in `.gitignore`.** `.gitignore` only keeps a local test file (`.dev.vars`) out of the repo.
Real values go to Cloudflare in ONE of these ways (pick one):

- Dashboard: Workers & Pages → robert-power-solutions → Settings → Variables and Secrets → Add → type **Secret**
- CLI: `npx wrangler secret put ADMIN_PASSWORD` then `npx wrangler secret put SESSION_SECRET`

They survive every future deploy. The Worker must exist first, so deploy once, then add the secrets.
Until they are set, nobody can log in (safe by default).

## Deploy
Git-connected (Workers Builds): build command `pnpm build`, deploy command `npx wrangler deploy`. Node 22 is pinned in `.node-version`.
Or from your computer: `pnpm deploy`. The free KV namespace is created automatically on the first deploy.
(If your Wrangler version does not auto-create it: `npx wrangler kv namespace create MEDIA`, then put the printed id in `wrangler.jsonc` → `"kv_namespaces": [{ "binding": "MEDIA", "id": "..." }]`.)

Set the final domain with build variable `SITE_URL=https://your-domain` (default https://robert-power.solutions).

## Robert's address
`https://your-domain/robert-studio-9k4x` — unlisted, not linked, not in the sitemap, `noindex`.
To move it, change `ADMIN` in `worker/index.ts` and the matching entries in `wrangler.jsonc` (`run_worker_first`).

## Free-plan limits (fine for a small business site)
- Photos: auto-shrunk in the browser before upload. Videos: **max 24 MB each** (~20–30 s of phone video). For longer videos, upload to YouTube and use **+ YouTube** inside a post.
- KV free tier: 1 GB total, 1,000 writes/day, 100,000 reads/day. Public reads are edge-cached, so reads are rarely used.
- Workers free tier: 100,000 requests/day. Static site pages/images don't count against it.
- New posts/uploads can take up to ~60 seconds to appear publicly (edge cache).

## Security
- Password checked server-side against a Cloudflare secret; session = signed HttpOnly, Secure, SameSite=Strict cookie (7 days).
- 5 wrong passwords from one IP locks that IP for 15 minutes.
- Admin screens are served only to a logged-in session; they are not in the public JS bundle.
- Blog text is escaped before formatting, so pasted HTML/scripts cannot run on the site.
- Uploads limited to JPG/PNG/WebP/GIF/MP4/MOV/WebM.
- Optional extra layer: put the admin path behind Cloudflare Access (free for up to 50 users, email one-time code) — no code change.

## If Robert later moves to Netlify / Vercel
The public site is plain static React and builds anywhere (`pnpm build` → `dist/public`; add a rewrite of all paths to `/index.html`).
The Gallery, Blog and admin depend on this Worker + KV, so on another host they would show their "coming soon" state until a
replacement backend (e.g. Netlify Blobs/Functions or Vercel Blob/KV) is wired in. All storage calls are isolated in the
"storage layer" section at the top of `worker/index.ts`, so that swap is small. Simplest path: keep this Worker on Cloudflare's free plan.

## Local testing
Copy `.dev.vars.example` to `.dev.vars`, run `pnpm build`, then `npx wrangler dev`.
