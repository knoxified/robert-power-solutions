import { useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BatteryCharging,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Menu,
  MessageCircle,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Sun,
  Wrench,
  X,
  Zap,
} from "lucide-react";

const PHONE = "+234 802 892 0939";
const PHONE_HREF = "tel:+2348028920939";
const WHATSAPP_HREF = "https://wa.me/2348028920939?text=Hello%20Robert%20Power%20Solutions%2C%20my%20solar%20system%20needs%20help.";

const symptoms = [
  {
    icon: BatteryCharging,
    eyebrow: "BATTERY",
    title: "Not holding charge?",
    text: "Short backup, swollen batteries, or a system that drops out too early.",
  },
  {
    icon: Zap,
    eyebrow: "INVERTER",
    title: "Beeping or showing errors?",
    text: "We diagnose fault codes, overheating, no-output, and changeover issues.",
  },
  {
    icon: Sun,
    eyebrow: "PANELS",
    title: "Low solar production?",
    text: "We trace shading, loose connections, dirt, controller faults, and wiring loss.",
  },
  {
    icon: Activity,
    eyebrow: "WHOLE SYSTEM",
    title: "Power is unpredictable?",
    text: "We find the real cause instead of resetting the same problem again and again.",
  },
];

const services = [
  "Solar inverter diagnostics & repair",
  "Battery testing, replacement & balancing",
  "Panel, charge controller & wiring faults",
  "System servicing and performance checks",
];

const faqs = [
  ["Do you only repair systems you installed?", "No. Robert Power Solutions can inspect and repair systems installed by other technicians, provided the equipment is accessible and safe to work on."],
  ["Do you cover areas outside Lagos?", "Yes. Lagos is the home base, with service available across Nigeria by arrangement. Share your location and a short video of the fault for a quick first assessment."],
  ["How do I get a quote?", "Send a WhatsApp message with your location, inverter brand, the fault you are seeing, and a photo or short video. We will advise on the next best step before any work begins."],
];

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <a href="#top" className={`brand ${compact ? "brand--compact" : ""}`} aria-label="Robert Power Solutions home">
      <span className="brand-mark"><img src="/manus-storage/robert-mark_fb817ed0.png" alt="" /></span>
      <span className="brand-copy"><strong>ROBERT</strong><span>POWER SOLUTIONS</span></span>
    </a>
  );
}

function WhatsAppButton({ className = "" }: { className?: string }) {
  return <a className={`button button--whatsapp ${className}`} href={WHATSAPP_HREF} target="_blank" rel="noreferrer"><MessageCircle size={17} /> WhatsApp Robert <ArrowUpRight size={16} /></a>;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <main id="top">
      <div className="notice-bar"><span className="pulse-dot" /> Solar system acting up? <strong>Same-day diagnosis in Lagos</strong><a href={WHATSAPP_HREF} target="_blank" rel="noreferrer">Message now <ArrowUpRight size={13} /></a></div>

      <header className="site-header">
        <div className="container header-inner">
          <Logo />
          <nav className={`main-nav ${menuOpen ? "main-nav--open" : ""}`}>
            <a href="#repairs" onClick={() => setMenuOpen(false)}>Repairs</a>
            <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="#about" onClick={() => setMenuOpen(false)}>About Robert</a>
            <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
            <a className="nav-call" href={PHONE_HREF}><PhoneCall size={15} /> Call {PHONE}</a>
          </nav>
          <button className="menu-toggle" onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu">{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-grid" />
        <div className="container hero-inner">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-line" /> SOLAR REPAIR SPECIALIST · LAGOS + NIGERIA</div>
            <h1>Your solar system should be powering your life—<em>not interrupting it.</em></h1>
            <p className="hero-lede">When your inverter starts beeping, your battery quits early, or the panels stop pulling their weight, Robert Power Solutions finds the fault and gets your power back on track.</p>
            <div className="hero-actions"><WhatsAppButton /><a className="text-link" href={PHONE_HREF}><span className="phone-icon"><PhoneCall size={15} /></span> Call {PHONE}</a></div>
            <div className="micro-proof"><div className="avatar-stack"><span>R</span><span>PS</span><span>✓</span></div><span><strong>Repairs first.</strong> Honest diagnosis before any recommendation.</span></div>
          </div>

          <div className="hero-visual" aria-label="Robert Power Solutions repair service overview">
            <div className="orbit orbit-one" /><div className="orbit orbit-two" />
            <div className="visual-topline"><span><span className="status-dot" /> SYSTEM CHECK</span><span>RPS / 001</span></div>
            <div className="power-card">
              <div className="power-card-head"><span className="mini-label">POWER STATUS</span><span className="live-pill">LIVE <span /></span></div>
              <div className="gauge-wrap"><div className="gauge"><div className="gauge-inner"><strong>94<span>%</span></strong><small>healthy output</small></div></div><div className="gauge-legend"><span><i className="legend-orange" /> Output</span><span><i className="legend-grey" /> Expected</span></div></div>
              <div className="system-readings"><div><small>INVERTER</small><strong>Stable</strong></div><div><small>BATTERY</small><strong>Charging</strong></div><div><small>SOLAR ARRAY</small><strong>Optimal</strong></div></div>
            </div>
            <div className="floating-note floating-note--top"><span className="floating-icon"><ShieldCheck size={17} /></span><div><strong>Repair-led advice</strong><small>No pressure to replace</small></div></div>
            <div className="floating-note floating-note--bottom"><span className="floating-icon floating-icon--dark"><Wrench size={17} /></span><div><strong>Fault found</strong><small>Plan the right fix</small></div><CheckCircle2 className="check-icon" size={17} /></div>
            <div className="sun-disc"><Sun size={25} /></div>
          </div>
        </div>
        <div className="hero-bottom container"><span>For homes</span><i /><span>Offices</span><i /><span>Shops</span><i /><span>Facilities</span><span className="hero-bottom-note">Built for Nigeria's power reality <ArrowUpRight size={15} /></span></div>
      </section>

      <section className="trust-strip"><div className="container trust-inner"><span className="trust-kicker">The first call when your solar stops making sense</span><div className="trust-items"><span><Check size={15} /> Clear fault-finding</span><span><Check size={15} /> Lagos-based</span><span><Check size={15} /> Nationwide by arrangement</span></div></div></section>

      <section className="section symptoms-section" id="repairs">
        <div className="container">
          <div className="section-intro section-intro--split"><div><div className="eyebrow eyebrow--dark"><span className="eyebrow-line" /> START WITH THE SYMPTOM</div><h2>Power problem? <em>Let’s get to the real cause.</em></h2></div><p>You do not need to know the technical name for the fault. Tell us what your system is doing, and we will help you work out the next step.</p></div>
          <div className="symptom-grid">{symptoms.map(({ icon: Icon, eyebrow, title, text }) => <div className="symptom-card" key={title}><div className="card-icon"><Icon size={21} /></div><div><span className="card-eyebrow">{eyebrow}</span><h3>{title}</h3><p>{text}</p></div><ArrowUpRight className="card-arrow" size={19} /></div>)}</div>
        </div>
      </section>

      <section className="section repair-section" id="how-it-works">
        <div className="container repair-grid">
          <div className="repair-visual"><div className="repair-panel"><div className="repair-panel-brand"><span className="panel-sun"><Sun size={18} /></span><strong>ROBERT POWER</strong><span>RPS FIELD DIAGNOSTIC / 24</span></div><div className="circuit-lines"><span /><span /><span /><span /></div><div className="repair-meter"><span>FAULT TRACE</span><strong>03 <small>/ 04</small></strong><div className="meter-bar"><i /></div><small>Checking connections, controls & charge flow</small></div><div className="repair-stamp"><Wrench size={18} /><span>REPAIR<br />BEFORE<br />REPLACE</span></div></div><div className="repair-caption"><span className="caption-number">01</span><span>Good repair starts<br />with good diagnosis.</span></div></div>
          <div className="repair-copy"><div className="eyebrow eyebrow--dark"><span className="eyebrow-line" /> THE ROBERT POWER METHOD</div><h2>No guesswork. <em>No upselling.</em> Just the right fix.</h2><p className="lead">Your system may not need a new inverter. It may need a clean connection, a balanced battery bank, or a fault found before it becomes an expensive failure.</p><div className="process-list"><div className="process-item"><span>01</span><div><strong>Listen to the symptom</strong><p>We start with what you are experiencing—not a sales pitch.</p></div></div><div className="process-item"><span>02</span><div><strong>Trace the fault</strong><p>We test the system from panels to batteries to output.</p></div></div><div className="process-item"><span>03</span><div><strong>Explain your options</strong><p>You get a clear recommendation before work begins.</p></div></div></div><a className="button button--dark" href={WHATSAPP_HREF} target="_blank" rel="noreferrer">Tell us what’s wrong <ArrowUpRight size={17} /></a></div>
        </div>
      </section>

      <section className="section services-section"><div className="container services-grid"><div><div className="eyebrow eyebrow--dark"><span className="eyebrow-line" /> WHAT WE HELP WITH</div><h2>Keep the system you have.<br /><em>Make it work better.</em></h2><p className="section-copy">From an isolated inverter fault to a full-system health check, we make solar less stressful to own.</p></div><div className="services-list">{services.map((service, i) => <div className="service-row" key={service}><span>0{i + 1}</span><strong>{service}</strong><ArrowUpRight size={18} /></div>)}<div className="service-note"><Sparkles size={17} /> Selling & installation are available too—<strong>but repairs are our first promise.</strong></div></div></div></section>

      <section className="section about-section" id="about"><div className="container about-grid"><div className="about-statement"><div className="quote-mark">“</div><blockquote>A solar system is an investment in peace of mind. My job is to help you keep that peace.</blockquote><div className="signature"><span className="signature-line" /><div><strong>Robert Emeka</strong><small>Founder, Robert Power Solutions</small></div></div></div><div className="about-details"><div className="eyebrow"><span className="eyebrow-line" /> THE PERSON BEHIND THE POWER</div><h2>Local hands.<br /><em>Proper thinking.</em></h2><p>Robert Power Solutions is Lagos-based and built around a simple standard: understand the system, tell the truth about the fault, and leave the customer with power they can rely on.</p><div className="location-row"><div className="location-pin"><Sun size={20} /></div><div><strong>Lagos, Nigeria</strong><span>Serving homes, businesses & facilities nationwide</span></div></div><div className="social-row"><a href="https://www.facebook.com/" target="_blank" rel="noreferrer">Facebook <ArrowUpRight size={14} /></a><a href="https://x.com/RobertSolarspro" target="_blank" rel="noreferrer">X / @RobertSolarspro <ArrowUpRight size={14} /></a></div></div></div></section>

      <section className="section faq-section" id="faq"><div className="container faq-grid"><div><div className="eyebrow eyebrow--dark"><span className="eyebrow-line" /> BEFORE YOU MESSAGE</div><h2>Good questions.<br /><em>Better decisions.</em></h2><p>Not sure if your issue is serious? Start here, then send a photo or video and we’ll help you work out what to do next.</p><WhatsAppButton /></div><div className="faq-list">{faqs.map(([question, answer], index) => <div className={`faq-item ${openFaq === index ? "faq-item--open" : ""}`} key={question}><button onClick={() => setOpenFaq(openFaq === index ? null : index)}><span>{question}</span><ChevronDown size={18} /></button>{openFaq === index && <p>{answer}</p>}</div>)}</div></div></section>

      <section className="final-cta"><div className="final-glow" /><div className="container final-inner"><div className="eyebrow"><span className="eyebrow-line" /> YOUR NEXT STEP</div><h2>Let’s get your power<br /><em>working properly again.</em></h2><p>Send a message with your location and a quick description of the fault. Robert will take it from there.</p><div className="hero-actions"><WhatsAppButton /><a className="text-link text-link--light" href={PHONE_HREF}><span className="phone-icon"><PhoneCall size={15} /></span> {PHONE}</a></div><div className="final-meta"><span><Clock3 size={15} /> Lagos-based</span><span><ShieldCheck size={15} /> Honest diagnosis</span><span><Zap size={15} /> Power restored</span></div></div></section>

      <footer className="site-footer"><div className="container footer-inner"><Logo compact /><span className="footer-note">Solar repairs, servicing & smarter power systems.</span><span className="footer-copy">© {new Date().getFullYear()} Robert Power Solutions</span></div></footer>
      <a className="floating-whatsapp" href={WHATSAPP_HREF} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp"><MessageCircle size={23} /><span>Chat with Robert</span></a>
    </main>
  );
}
