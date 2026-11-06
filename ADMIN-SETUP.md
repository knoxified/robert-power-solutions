# Robert's Studio (uploads + blog) — one-time setup

The public website is a static React app. A Cloudflare Worker (`worker/index.ts`) adds:
- a hidden, password-protected admin where Robert uploads photos/videos and writes blog posts
- public pages `/gallery` and `/blog` that read what he publishes
- everything is stored in a Cloudflare **R2 bucket** (no Supabase / database needed)

## 1. Create the bucket (once)
```
npx wrangler r2 bucket create robert-power-media
```
(R2 needs a payment card on the Cloudflare account; the free tier is 10 GB.)

## 2. Set the two secrets (never commit these)
```
npx wrangler secret put ADMIN_PASSWORD    # Robert's login password - long and unique
npx wrangler secret put SESSION_SECRET    # any long random string, e.g. output of: openssl rand -hex 32
```
If you deploy through Cloudflare's Git integration instead, add both under
Workers & Pages → robert-power-solutions → Settings → Variables and Secrets (type: Secret).

## 3. Deploy
```
pnpm deploy        # builds the site, then wrangler deploy
```
Set the real domain once it is final: build variable `SITE_URL=https://your-domain` (defaults to https://robert-power.solutions).

## Robert's address
The admin lives at **`/robert-studio-9k4x`** (e.g. `https://your-domain/robert-studio-9k4x`).
It is not linked anywhere, not in the sitemap, and tells search engines not to index it.
To move it, change `ADMIN` in `worker/index.ts` and the two matching entries in `wrangler.jsonc` (`run_worker_first`).

## Security notes
- Password is checked on the server against a Cloudflare secret; session is a signed HttpOnly, Secure, SameSite=Strict cookie (7 days).
- 5 wrong passwords from one IP locks that IP for 15 minutes.
- Admin screens are served only to a logged-in session; they are not in the public JS bundle.
- Blog text is escaped before formatting, so pasted HTML/scripts cannot run on the site.
- Uploads: JPG/PNG/WebP/GIF/MP4/MOV/WebM only, max 95 MB each (Workers request limit is 100 MB).
- Optional extra layer later: put the admin path behind Cloudflare Access (email one-time code) — no code change needed.
