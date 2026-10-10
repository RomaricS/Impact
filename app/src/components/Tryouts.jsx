import { useReveal } from '../hooks/useReveal';
import { useSettings } from '../hooks/useSettings';
import { logEvent } from '../lib/firebase';
import content from '../content.json';

export default function Tryouts() {
  const ref = useReveal();
  const { settings } = useSettings();
  const { dates = [], schedule = [], locations = [] } = content.tryouts;

  return (
    <section className="sec tryouts-sec" id="tryouts" ref={ref}>
      <div className="container">
        <div className="tryouts-panel rv">
          <div className="tryouts-ring" aria-hidden="true" />

          <div className="tryouts-info">
            <div className="tryouts-eyebrow">
              <span className="tryouts-dot" aria-hidden="true" />
              {content.tryouts.eyebrow}
            </div>
            <h2 className="tryouts-title">
              {content.tryouts.titlePlain}<br />{content.tryouts.titleHighlight}
            </h2>
            <p className="tryouts-desc">{content.tryouts.description}</p>
            <div className="tryouts-actions">
              <a
                href={settings.registrationLink}
                target="_blank"
                rel="noreferrer"
                className="tryouts-cta"
                onClick={() => logEvent('tryout_register_click')}
              >
                {content.tryouts.cta}
              </a>
              <span className="tryouts-fee">
                <strong>{content.tryouts.feeAmount}</strong> {content.tryouts.feeLabel}
              </span>
            </div>
          </div>

          <div className="tryouts-card">
            <div>
              <div className="tryouts-card-lbl">{content.tryouts.datesHeading}</div>
              {dates.length > 0 ? (
                <div className="tryout-dates">
                  {dates.map(d => (
                    <div key={d.day + d.date + d.month} className="tryout-date-card">
                      <span className="tdc-day">{d.day}</span>
                      <span className="tdc-num">{d.month} {d.date}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="tryouts-empty">Check back soon for tryout dates.</p>
              )}
            </div>

            {schedule.length > 0 && (
              <div className="tryout-schedule">
                {schedule.map(s => (
                  <div key={s.time} className="tryout-schedule-row">
                    <span className="slot-time">{s.time}</span>
                    <span className="slot-ages">{s.ages}</span>
                  </div>
                ))}
              </div>
            )}

            {locations.length > 0 && (
              <div>
                <div className="tryouts-card-lbl">{content.tryouts.locationsHeading}</div>
                <div className="tryout-locations">
                  {locations.map(l => (
                    <div key={l.name} className="tryout-location">
                      <div className="loc-name">{l.name}</div>
                      <div className="loc-addr">{l.address}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
