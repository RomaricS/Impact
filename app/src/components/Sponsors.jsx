import { useReveal } from '../hooks/useReveal';
import { useSponsors } from '../hooks/useSponsors';

const TIER_CLASSES = ['t-kill', 't-ace', 't-block'];

export default function Sponsors() {
  const ref = useReveal();
  const { tiers } = useSponsors();

  return (
    <section className="sec sponsors-sec" id="sponsors" ref={ref}>
      <div className="container">
        <div className="rv">
          <div className="sec-eye">2026 Partners</div>
          <h2 className="sec-title">Our<br />Sponsors</h2>
          <p className="sec-sub">These businesses make our club possible. Please support them.</p>
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
                    <img src={s.logo} alt="Sponsor logo" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="become-sponsor rv">
          <div>
            <h3>Become a Sponsor</h3>
            <p>Support youth athletics in Fort Wayne and get your brand in front of our community.</p>
          </div>
          <a href="mailto:info@impactvbcfw.com" className="btn btn-p">Contact Us</a>
        </div>
      </div>
    </section>
  );
}
