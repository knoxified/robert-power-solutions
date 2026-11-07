/**
 * Single source of truth for SEO: per-page titles/descriptions, business facts and JSON-LD.
 * Used by the React app (client/src/pages/SitePages.tsx) AND by the Cloudflare Worker, which injects the
 * same tags into the HTML before it is sent, so crawlers and link previews see them without running JS.
 */
export const BUSINESS = {
  name: "Robert Power Solutions",
  alternateNames: ["Robert Power Solution", "RobertSolarspro", "Robert Emeka Solar"],
  telephone: "+2348028920939",
  founder: "Robert Emeka",
  founderAlternateNames: ["Ndi Robert Emeka", "Ndi Emeka Robert"],
  facebook: "https://www.facebook.com/robert.emeka.2025/",
  x: "https://x.com/RobertSolarspro",
  linkedin: "", // paste Robert's LinkedIn profile URL ("Ndi Emeka Robert") here; it is added everywhere automatically
};

export const SEO_PAGES: Record<string, { title: string; description: string }> = {
  "/": { title: "Solar Inverter Repair & Installation in Nigeria | Robert Power Solutions", description: "Inverter beeping, battery draining fast, or no power? Robert Power Solutions repairs inverters and lithium batteries and installs solar systems for homes and businesses in Lagos, Anambra and across Nigeria." },
  "/repairs": { title: "Solar Inverter & Battery Repair in Nigeria | Fix Beeping, Overload & Not Charging", description: "Fast, diagnosis-first repair for solar inverters, lithium batteries, charge controllers and wiring. Deye, Cworth Energy, NetPower and more. WhatsApp a photo and get a clear answer." },
  "/installations": { title: "Solar Panel, Inverter & Lithium Battery Installation in Nigeria", description: "Solar systems designed around your real load and budget, installed and commissioned properly for homes, shops and offices in Lagos, Anambra and nationwide by arrangement." },
  "/solar-troubleshooting": { title: "Solar Inverter & Battery Troubleshooting Guide for Nigeria | Fix Common Faults", description: "Inverter beeping, overloading, not charging, battery draining fast or overheating? Practical checks you can do safely, and when to call a solar technician in Nigeria." },
  "/case-studies": { title: "Solar Repair & Installation Case Studies | Robert Power Solutions", description: "See the faults, process, field evidence and outcomes behind Robert Power Solutions solar repairs and installations in Nigeria." },
  "/about": { title: "About Robert Emeka | Solar Engineer & Founder, Robert Power Solutions", description: "Meet Robert Emeka (Ndi Robert Emeka), an electrical/electronics engineer and solar specialist installing and repairing solar systems for homes and businesses across Nigeria." },
  "/gallery": { title: "Solar Installation & Repair Photos, Lagos & Anambra | Robert Power Solutions", description: "Photos of real solar installations and repairs: Deye and Cworth Energy inverters, lithium batteries and rooftop panels in Lagos, Onitsha, Nsugbe, Ozubulu and beyond." },
  "/blog": { title: "Solar Tips, Guides & Field Notes | Robert Power Solutions Blog", description: "Practical solar guides, repair stories and installation write-ups from Robert Power Solutions across Nigeria." },
  "/contact": { title: "Contact a Solar Technician in Nigeria | Call or WhatsApp Robert Power Solutions", description: "Call or WhatsApp Robert Power Solutions for solar repair, inverter diagnosis, system design or installation. Monday to Saturday, 8am to 6pm. Serving Lagos, Anambra and Nigeria-wide." },
  "/privacy": { title: "Privacy Policy | Robert Power Solutions", description: "Read how Robert Power Solutions handles information shared through this website, WhatsApp, calls and forms." },
  "/terms": { title: "Terms & Conditions | Robert Power Solutions", description: "Read the terms that guide solar repair, installation, diagnosis, quotes and service arrangements with Robert Power Solutions." },
};

export const TROUBLESHOOTING_FAQ: { q: string; a: string }[] = [
  { q: "Why is my solar inverter beeping?", a: "Most beeping is the inverter warning you about something: an overload, low battery voltage, high temperature, a loose connection or a charging problem. Note the exact fault code and what you switched on just before it started, reduce the load, make sure the unit has airflow, and send the code to a technician if it keeps happening." },
  { q: "Why does my inverter trip when I switch on the AC, pressing iron or pumping machine?", a: "Heavy appliances draw a large surge when they start, and an inverter, battery or cable that is undersized for that surge will overload or shut down. The fix is usually correct sizing, better battery capacity or a soft-start arrangement rather than just resetting the unit." },
  { q: "Why does my battery run flat so quickly?", a: "Common causes are ageing cells, not enough charging from solar or grid, a load that has grown since installation, or wrong depth-of-discharge and charge settings. A proper battery test shows whether the battery needs balancing, new settings or replacement." },
  { q: "Why is my solar system not charging the batteries?", a: "Check for shading, dust on the panels (especially during harmattan), a tripped PV breaker or a loose panel connector. If those look fine, the cause may be a charge controller or MPPT fault, wiring loss or wrong settings, which should be tested by a technician." },
  { q: "Can a faulty inverter be repaired instead of replaced?", a: "Often yes. Many faults are traced to connections, fans, boards or settings rather than a dead unit. A diagnosis first means you only replace what actually failed." },
  { q: "Is it safe to open the inverter or battery myself?", a: "No. Inverters and batteries hold dangerous voltages and stored energy even when they appear off. Only do the visual and breaker-level checks in this guide, and leave covers and terminals to a qualified technician." },
  { q: "Do you repair and install solar systems outside Lagos?", a: "Yes. Robert Power Solutions works across Nigeria by arrangement, with recent jobs in Lagos and in Anambra State including Onitsha, Nsugbe and Ozubulu. Share your location when you enquire." },
  { q: "What should I send before a repair visit?", a: "Your location, the inverter and battery brand and model, the fault code or what the system is doing, when it started, and a photo or short video of the unit and its display. This helps get the diagnosis started before anyone travels." },
];

const sameAs = () => [BUSINESS.facebook, BUSINESS.x, BUSINESS.linkedin].filter(Boolean);

export function buildSchema(origin: string, path: string) {
  const biz = `${origin}/#business`;
  const graph: Record<string, unknown>[] = [
    {
      "@type": ["SolarEnergyContractor", "LocalBusiness"], "@id": biz, name: BUSINESS.name, alternateName: BUSINESS.alternateNames,
      url: origin, telephone: BUSINESS.telephone, image: `${origin}/images/logo.png`, logo: `${origin}/images/logo.png`,
      description: "Solar inverter and lithium battery repair, troubleshooting, and solar installation for homes and businesses across Nigeria, including Lagos and Anambra State.",
      areaServed: [{ "@type": "Country", name: "Nigeria" }, { "@type": "AdministrativeArea", name: "Lagos State" }, { "@type": "AdministrativeArea", name: "Anambra State" }, { "@type": "City", name: "Onitsha" }],
      address: { "@type": "PostalAddress", addressCountry: "NG" }, sameAs: sameAs(), priceRange: "₦₦",
      openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "08:00", closes: "18:00" }],
      knowsAbout: ["Solar inverter repair", "Inverter troubleshooting", "Lithium battery installation", "Solar panel installation", "Deye inverters", "Cworth Energy inverters", "Hybrid solar systems"],
      founder: { "@id": `${origin}/#robert` },
    },
    {
      "@type": "Person", "@id": `${origin}/#robert`, name: BUSINESS.founder, alternateName: BUSINESS.founderAlternateNames,
      jobTitle: "Founder and Solar Engineer", worksFor: { "@id": biz }, sameAs: sameAs(),
      alumniOf: { "@type": "CollegeOrUniversity", name: "Chukwuemeka Odumegwu Ojukwu University" },
    },
    { "@type": "WebSite", "@id": `${origin}/#website`, url: origin, name: BUSINESS.name, inLanguage: "en-NG", publisher: { "@id": biz } },
    { "@type": "Service", "@id": `${origin}/#solar-repairs`, name: "Solar inverter and battery repair", provider: { "@id": biz }, areaServed: { "@type": "Country", name: "Nigeria" }, serviceType: ["Solar inverter repair", "Lithium battery service", "Solar system diagnosis", "Inverter troubleshooting"] },
    { "@type": "Service", "@id": `${origin}/#solar-installation`, name: "Solar system design and installation", provider: { "@id": biz }, areaServed: { "@type": "Country", name: "Nigeria" }, serviceType: ["Solar panel installation", "Hybrid inverter installation", "Lithium battery installation"] },
  ];
  if (path !== "/") {
    const names: Record<string, string> = { "/repairs": "Repairs", "/installations": "Installations", "/solar-troubleshooting": "Troubleshooting guide", "/case-studies": "Case studies", "/about": "About", "/gallery": "Gallery", "/blog": "Blog", "/contact": "Contact", "/privacy": "Privacy", "/terms": "Terms" };
    graph.push({ "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: origin + "/" }, { "@type": "ListItem", position: 2, name: names[path] || path.replace("/", ""), item: origin + path }] });
  }
  if (path === "/solar-troubleshooting") {
    graph.push({ "@type": "FAQPage", mainEntity: TROUBLESHOOTING_FAQ.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

export const schemaScript = (obj: unknown) => JSON.stringify(obj).replace(/</g, "\\u003c");
