import { useReveal } from '../hooks/useReveal';
import { useSponsors } from '../hooks/useSponsors';
import content from '../content.json';

const TIER_CLASSES = ['t-kill', 't-ace', 't-block'];

export default function Sponsors() {
  const ref = useReveal();
  const { tiers } = useSponsors();

  return (
    <section className="sec sponsors-sec" id="sponsors" ref={ref}>
      <div className="container">
        <div className="rv">
          <div className="sec-eye">{content.sponsors.eyebrow}</div>
          <h2 className="sec-title">{content.sponsors.titlePlain}<br /><span style={{ color: 'var(--pink)' }}>{content.sponsors.titleHighlight}</span></h2>
          <p className="sec-sub">{content.sponsors.subtitle}</p>
        </div>

        <div className="tier-row">
          {tiers.map((tier, i) => (
            <div key={tier.tierLabel} className="rv">
              <div className="tier-hdr">
                <span className={`tier-pill ${TIER_CLASSES[i] || 't-block'}`}>{tier.tierLabel}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{tier.tierAmount}</span>
                <div className="tier-line" />
              </div>
              <div className="logo-row">
                {tier.sponsors.map(s => (
                  <div key={s.id} className="logo-card">
                    <img src={s.logo} alt={s.name || 'Sponsor logo'} />
                    {s.name && <div className="sponsor-name">{s.name}</div>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="become-sponsor rv">
          <div>
            <h3>{content.sponsors.becomeTitle}</h3>
            <p>{content.sponsors.becomeDescription}</p>
          </div>
          <a href={`mailto:${content.sponsors.contactEmail}`} className="btn btn-p">{content.sponsors.becomeCta}</a>
        </div>
      </div>
    </section>
  );
}
