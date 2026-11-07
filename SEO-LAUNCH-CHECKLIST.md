# SEO launch checklist — Robert Power Solutions

The website itself is already tuned (page titles/descriptions, structured data for Google, sitemap, a real troubleshooting
guide, image alt text, fast WebP images, real 404s). Nobody can guarantee a #1 ranking, and new sites take weeks to months to
climb. What decides how high it climbs is the list below, mostly things that happen OFF the website.

## Do these in the first week (biggest impact first)
1. **Google Business Profile** (free, the single biggest lever for "solar technician near me" searches).
   - Create it at business.google.com as a **service-area business** (hide the street address if he doesn't want it shown).
   - Primary category: Solar energy contractor. Add: Solar panel installation service, Electrician (if he does general electricals), Inverter repair if offered.
   - Same name, phone (+234 802 892 0939), website link, hours (Mon-Sat 8am-6pm) as the website. Add service areas: Lagos, Anambra (Onitsha, Nsugbe, Ozubulu) and other states he serves.
   - Upload 10+ real photos from the Gallery. Post a photo update every week or two.
2. **Reviews**: ask every happy customer for a Google review (send the review link on WhatsApp right after handover). Reviews are the strongest local ranking signal. Reply to every review.
3. **Google Search Console**: add the domain, verify, submit `https://YOUR-DOMAIN/sitemap.xml`. Do the same on Bing Webmaster Tools.
4. **Set the final domain**: build variable `SITE_URL=https://your-domain` (default https://robert-power.solutions) so canonical links, share previews and the sitemap all match.
5. **Add the LinkedIn profile**: paste the URL into `BUSINESS.linkedin` in `shared/seo.ts` (it then appears in the footer and in Google's structured data).
6. **Link everywhere to the site**: Facebook page "Website" field and About text, X bio, LinkedIn, WhatsApp Business profile (website + business description), Instagram/TikTok if used. Use the same name and phone number everywhere.

## Ongoing (this is what pushes the site up over months)
- **Publish a blog post every 1-2 weeks** from the admin (`/robert-studio-9k4x`). Write about real jobs and real searches, one problem per post. Examples:
  "Why your Deye inverter keeps beeping and how we fixed it", "Lithium vs tubular battery: which is right for your home in Lagos?",
  "How to size an inverter for a 3-bedroom flat", "What a harmattan dust clean does to your solar output", "Cworth Energy inverter installation in Onitsha: what we did".
  Add a cover photo, a short summary, and mention the town/state.
- **Caption photos with the town and the equipment** (e.g. "Cworth Energy inverter, Ozubulu"). Local words help local search.
- **Post the same jobs on Facebook/X** with a link back to the matching gallery or blog page. Real backlinks and traffic.
- **Get listed in a few Nigerian business directories** (Nigerian yellow-pages style sites, solar/electrical directories) with identical details.
- **Collect testimonials with permission** and add them to the site (names or first names + town).

## What is already done in the code
- Unique title + description per page, tuned for searches like "solar inverter repair Nigeria", "inverter beeping", "lithium battery installation Lagos".
- `/solar-troubleshooting` guide with FAQ markup (can appear as rich results) plus internal links from Home and the footer.
- Business, founder (incl. "Ndi Robert Emeka"), services, areas served, hours and social profiles as structured data on every page.
- Tags are injected by the Worker into the raw HTML so Google, WhatsApp and Facebook previews see them without running JavaScript.
- Sitemap includes every page and every published blog post; admin and API are excluded; unknown URLs return a proper 404.
