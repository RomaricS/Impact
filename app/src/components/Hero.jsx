import content from '../content.json';

export default function Hero() {
  const stats = [...content.hero.stats, ...content.hero.stats];

  return (
    <>
      <section className="hero" id="about">
        <div className="orb o1" />
        <div className="orb o2" />
        <div className="orb o3" />
        <div className="hero-wm">IMPACT</div>

        <div className="hero-layout">
          <div className="hero-text">
            <div className="eyebrow">{content.hero.eyebrow}</div>
            <h1>
              {content.hero.titleLine1}<br />
              <span className="grad">{content.hero.titleLine2}</span><br />
              {content.hero.titleLine3}
            </h1>
            <p className="hero-sub">
              {content.hero.subtitle}
            </p>
            <div className="cta-row">
              <a href="#tryouts" className="btn btn-p"
                 onClick={e => { e.preventDefault(); document.getElementById('tryouts')?.scrollIntoView({ behavior: 'smooth' }); }}>
                {content.hero.ctaPrimary}
              </a>
              <a href="#teams" className="btn btn-g"
                 onClick={e => { e.preventDefault(); document.getElementById('teams')?.scrollIntoView({ behavior: 'smooth' }); }}>
                {content.hero.ctaSecondary}
              </a>
            </div>
          </div>

          <div className="hero-illus">
            <img src="/assets/ill.png" alt="Volleyball player illustration" className="hero-ill-img" />
            <svg viewBox="0 0 560 640" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="hero-ill-overlay">
              <defs>
                <radialGradient id="hero-bg-glow" cx="50%" cy="50%" r="55%">
                  <stop offset="0%" stopColor="#FF1F6D" stopOpacity="0.1"/>
                  <stop offset="100%" stopColor="#FF1F6D" stopOpacity="0"/>
                </radialGradient>
              </defs>

              {/* Background atmosphere */}
              <circle cx="270" cy="340" r="265" fill="url(#hero-bg-glow)"/>
              <circle cx="280" cy="320" r="272" stroke="var(--svg-ring)" strokeWidth="1"/>
              <circle cx="280" cy="320" r="228" stroke="var(--svg-ring)" strokeWidth="1" strokeDasharray="3 9"/>
              <circle cx="280" cy="320" r="185" stroke="var(--svg-ring)" strokeWidth="1" strokeDasharray="1 6"/>

              {/* Geometric accents */}
              <rect className="geo1" x="42" y="310" width="48" height="48" rx="8" stroke="var(--svg-line)" strokeWidth="1.5" fill="none" opacity="0.6"/>
              <rect className="geo2" x="460" y="445" width="34" height="34" rx="6" stroke="var(--svg-line)" strokeWidth="1.2" fill="none" opacity="0.5"/>
              <polygon className="geo3" points="500,120 516,148 484,148" fill="none" stroke="var(--svg-line)" strokeWidth="1.5" opacity="0.5"/>
              <circle className="geo4" cx="108" cy="140" r="8" fill="rgba(59,130,246,0.55)"/>

              {/* Floating stat cards */}
              <g className="fc1">
                <rect x="382" y="162" width="148" height="46" rx="10" fill="var(--svg-card-bg)" stroke="var(--svg-card-bd)" strokeWidth="1"/>
                <circle cx="400" cy="185" r="4" fill="#FF1F6D"/>
                <text x="412" y="190" fontFamily="'Bebas Neue', sans-serif" fontSize="18" fill="var(--fg)" letterSpacing="1">6 TEAMS</text>
              </g>
              <g className="fc2">
                <rect x="14" y="400" width="172" height="46" rx="10" fill="var(--svg-card-bg)" stroke="var(--svg-card-bd)" strokeWidth="1"/>
                <circle cx="38" cy="423" r="4" fill="#3B82F6"/>
                <text x="50" y="428" fontFamily="'Bebas Neue', sans-serif" fontSize="18" fill="var(--fg)" letterSpacing="1">50+ ATHLETES</text>
              </g>
              <g className="fc3">
                <rect x="380" y="492" width="148" height="46" rx="10" fill="var(--svg-card-bg)" stroke="var(--svg-card-bd)" strokeWidth="1"/>
                <circle cx="406" cy="515" r="4" fill="var(--svg-lbl)"/>
                <text x="418" y="520" fontFamily="'Bebas Neue', sans-serif" fontSize="18" fill="var(--fg)" letterSpacing="1">FW, INDIANA</text>
              </g>

              {/* Sparkles */}
              <circle className="spk" cx="462" cy="26"  r="3.5" fill="rgba(255,255,255,0.75)"/>
              <circle className="spk" cx="430" cy="10"  r="2"   fill="rgba(255,31,109,0.85)"/>
              <circle className="spk" cx="492" cy="50"  r="1.5" fill="rgba(255,255,255,0.55)"/>
              <circle className="spk" cx="98"  cy="170" r="2.5" fill="rgba(59,130,246,0.75)"/>
              <circle className="spk" cx="516" cy="275" r="3"   fill="rgba(255,31,109,0.65)"/>
            </svg>
          </div>
        </div>

        <div className="scroll-hint">
          <span>{content.hero.scroll}</span>
          <div className="scroll-line" />
        </div>
      </section>

      <div className="ticker-wrap">
        <div className="ticker">
          {stats.map((s, i) => (
            <div className="tick-item" key={i}>
              <span className="tick-num">{s.num}</span>
              <span className="tick-lbl">{s.lbl}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
