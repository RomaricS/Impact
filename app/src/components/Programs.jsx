import { useReveal } from '../hooks/useReveal';
import content from '../content.json';

export default function Programs() {
  const ref = useReveal();
  return (
    <section className="sec" id="programs" style={{ background: 'var(--bg)' }} ref={ref}>
      <div className="container">
        <div className="rv">
          <div className="sec-eye">{content.programs.eyebrow}</div>
          <h2 className="sec-title">{content.programs.title}</h2>
          <p className="sec-sub">{content.programs.subtitle}</p>
        </div>
        <div className="programs-grid rv">
          {content.programs.items.map(p => (
            <div key={p.title} className={`prog-card ${p.featured ? 'feat' : ''}`}>
              <span className="prog-icon">{p.icon}</span>
              <div className="prog-title">{p.title}</div>
              <p className="prog-desc">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
