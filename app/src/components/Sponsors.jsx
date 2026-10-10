import { useReveal } from '../hooks/useReveal';
import { useSponsors } from '../hooks/useSponsors';
import content from '../content.json';

export default function Sponsors() {
  const ref = useReveal();
  const { tiers } = useSponsors();

  return (
    <section className="sec sponsors-sec" id="sponsors" ref={ref}>
      <div className="container">
        <div className="sec-head rv">
          <div>
            <div className="sec-eye">{content.sponsors.eyebrow}</div>
            <h2 className="sec-title">{content.sponsors.titlePlain} {content.sponsors.titleHighlight}</h2>
          </div>
          <p className="sec-sub">{content.sponsors.subtitle}</p>
        </div>

        <div className="tier-list">
          {tiers.map(tier => (
            <div key={tier.tierLabel} className="tier-row rv">
              <div className="tier-meta">
                <div className="tier-name">{tier.tierLabel}</div>
                <div className="tier-amount">{tier.tierAmount}</div>
              </div>
              <div className="logo-grid">
                {tier.sponsors.map(s => (
                  <div key={s.id} className="logo-card">
                    <div className="logo-box">
                      <img src={s.logo} alt={s.name || 'Sponsor logo'} />
                    </div>
                    {s.name && <span className="sponsor-name">{s.name}</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="become-sponsor rv">
          <p><strong>{content.sponsors.becomeTitle}.</strong> {content.sponsors.becomeDescription}</p>
          <a href={`mailto:${content.sponsors.contactEmail}`} className="btn-outline">{content.sponsors.becomeCta}</a>
        </div>
      </div>
    </section>
  );
}
