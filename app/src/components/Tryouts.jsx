import { useReveal } from '../hooks/useReveal';
import { useSettings } from '../hooks/useSettings';
import { logEvent } from '../lib/firebase';

export default function Tryouts() {
  const ref = useReveal();
  const { settings } = useSettings();
  return (
    <section className="tryouts-sec sec" id="tryouts" ref={ref}>
      <div className="container">
        <div className="tryouts-grid">
          <div className="rv">
            <div className="sec-eye">Join the Club</div>
            <h2 className="sec-title">Tryouts<br /><span style={{ color: 'var(--pink)' }}>2026–27</span></h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1rem' }}>
              Open to players 12–18. Register online before arriving. Spots are limited — don't miss your chance to wear the jersey.
            </p>
            <div className="tryout-price">
              <span className="price-num">$40</span>
              <span className="price-lbl">tryout fee · payable at event or via Venmo/PayPal</span>
            </div>
            <a href={settings.registrationLink} target="_blank" rel="noreferrer"
               className="btn btn-p" style={{ marginTop: '2rem', display: 'inline-flex' }}
               onClick={() => logEvent('tryout_register_click')}>
              Register Now →
            </a>
          </div>

          <div className="rv" style={{ animationDelay: '0.15s' }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.9rem' }}>
              Locations
            </p>
            <div className="loc-list">
              {[
                { name: 'Saint Aloysius School', addr: '14623 Bluffton Road, Yoder, IN 46798' },
              ].map(l => (
                <div key={l.name} className="loc-card">
                  <div className="loc-name">{l.name}</div>
                  <div className="loc-addr">{l.addr}</div>
                </div>
              ))}
              <div className="loc-note">If smaller group, tryout times may be shorter.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
