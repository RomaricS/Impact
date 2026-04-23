import { useReveal } from '../hooks/useReveal';

const TIERS = [
  {
    cls: 't-kill', label: 'Kill Level', amount: '$1,000+',
    sponsors: [
      { logo: 'https://static.wixstatic.com/media/bece4b_c80545f3bd9a49c9ae23d08054cd55d0~mv2.png', addr: '5825 Covington Rd, Fort Wayne, IN 46804' },
      { logo: 'https://static.wixstatic.com/media/bece4b_fef4f5367f6645f589c4b529e66591ae~mv2.png', addr: '243 Airport North Office Park, Fort Wayne, IN 46825' },
    ],
  },
  {
    cls: 't-ace', label: 'Ace Level', amount: '$500–$999',
    sponsors: [
      { logo: 'https://static.wixstatic.com/media/bece4b_c95f00c14b8b4d22875727781ff15a26~mv2.jpeg', addr: '6906 Ardmore Ave, Fort Wayne, IN 46809' },
    ],
  },
  {
    cls: 't-block', label: 'Block Level', amount: '$250–$499',
    sponsors: [
      { logo: 'https://static.wixstatic.com/media/bece4b_5527b50f43fb4558b1b1da737dfe75c0~mv2.png', addr: '7908 Carnegie Blvd, Fort Wayne, IN 46804' },
    ],
  },
];

export default function Sponsors() {
  const ref = useReveal();
  return (
    <section className="sec sponsors-sec" id="sponsors" ref={ref}>
      <div className="container">
        <div className="rv">
          <div className="sec-eye">2026 Partners</div>
          <h2 className="sec-title">Our<br />Sponsors</h2>
          <p className="sec-sub">These businesses make our club possible. Please support them.</p>
        </div>

        <div className="tier-row">
          {TIERS.map(tier => (
            <div key={tier.label} className="rv">
              <div className="tier-hdr">
                <span className={`tier-pill ${tier.cls}`}>{tier.label}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{tier.amount}</span>
                <div className="tier-line" />
              </div>
              <div className="logo-row">
                {tier.sponsors.map((s, i) => (
                  <div key={i} className="logo-card">
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
