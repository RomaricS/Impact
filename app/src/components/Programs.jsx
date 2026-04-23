import { useReveal } from '../hooks/useReveal';

const PROGRAMS = [
  {
    icon: '🏐',
    title: 'Club Volleyball',
    desc: 'Competitive club teams for players ages 12–18. Six divisions spanning Blue and Pink brackets, competing in regional and national tournaments across the Midwest.',
    feat: true,
  },
  {
    icon: '🎓',
    title: 'Recruiting',
    desc: 'We actively support college-bound athletes with recruiting resources, film, and coach connections.',
  },
  {
    icon: '⛺',
    title: 'Camps & Clinics',
    desc: 'Youth development camps and position-specific clinics open to all skill levels throughout the year.',
  },
];

export default function Programs() {
  const ref = useReveal();
  return (
    <section className="sec" id="programs" style={{ background: 'var(--bg)' }} ref={ref}>
      <div className="container">
        <div className="rv">
          <div className="sec-eye">What We Offer</div>
          <h2 className="sec-title">Programs</h2>
          <p className="sec-sub">From first-time club players to college-bound athletes — we have a program for every level.</p>
        </div>
        <div className="programs-grid rv">
          {PROGRAMS.map(p => (
            <div key={p.title} className={`prog-card ${p.feat ? 'feat' : ''}`}>
              <span className="prog-icon">{p.icon}</span>
              <div className="prog-title">{p.title}</div>
              <p className="prog-desc">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
