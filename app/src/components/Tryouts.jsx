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
            <p className="tryout-section-lbl">{content.tryouts.datesHeading}</p>
            <div className="tryout-dates">
              {content.tryouts.dates.map(d => (
                <div key={d.date + d.month} className="tryout-date-card">
                  <span className="tdc-day">{d.day}</span>
                  <span className="tdc-num">{d.date}</span>
                  <span className="tdc-month">{d.month}</span>
                </div>
              ))}
            </div>
            <div className="tryout-schedule">
              {content.tryouts.schedule.map(s => (
                <div key={s.time} className="tryout-slot">
                  <span className="slot-time">{s.time}</span>
                  <span className="slot-sep">·</span>
                  <span className="slot-ages">{s.ages}</span>
                </div>
              ))}
            </div>

            <p className="tryout-section-lbl" style={{ marginTop: '2rem' }}>{content.tryouts.locationsHeading}</p>
            <div className="loc-list">
              {content.tryouts.locations.map(l => (
                <div key={l.name} className="loc-card">
                  <div className="loc-name">{l.name}</div>
                  <div className="loc-addr">{l.address}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
