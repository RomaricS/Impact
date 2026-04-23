import { useReveal } from '../hooks/useReveal';
import { useSettings } from '../hooks/useSettings';
import { logEvent } from '../lib/firebase';
import content from '../content.json';

export default function Tryouts() {
  const ref = useReveal();
  const { settings } = useSettings();
  return (
    <section className="tryouts-sec sec" id="tryouts" ref={ref}>
      <div className="container">
        <div className="tryouts-grid">
          <div className="rv">
            <div className="sec-eye">{content.tryouts.eyebrow}</div>
            <h2 className="sec-title">{content.tryouts.titlePlain}<br /><span style={{ color: 'var(--pink)' }}>{content.tryouts.titleHighlight}</span></h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1rem' }}>
              {content.tryouts.description}
            </p>
            <div className="tryout-price">
              <span className="price-num">{content.tryouts.feeAmount}</span>
              <span className="price-lbl">{content.tryouts.feeLabel}</span>
            </div>
            <a href={settings.registrationLink} target="_blank" rel="noreferrer"
               className="btn btn-p" style={{ marginTop: '2rem', display: 'inline-flex' }}
               onClick={() => logEvent('tryout_register_click')}>
              {content.tryouts.cta}
            </a>
          </div>

          <div className="rv" style={{ animationDelay: '0.15s' }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.9rem' }}>
              {content.tryouts.locationsHeading}
            </p>
            <div className="loc-list">
              {content.tryouts.locations.map(l => (
                <div key={l.name} className="loc-card">
                  <div className="loc-name">{l.name}</div>
                  <div className="loc-addr">{l.address}</div>
                </div>
              ))}
              <div className="loc-note">{content.tryouts.locationsNote}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
