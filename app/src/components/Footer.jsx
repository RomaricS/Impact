export default function Footer() {
  const year = new Date().getFullYear();
  const cols = [
    {
      title: 'Teams',
      links: [
        { label: '12 Blue', id: 'teams' },
        { label: '14 Blue', id: 'teams' },
        { label: '16 Blue', id: 'teams' },
        { label: '16 Pink', id: 'teams' },
        { label: '17 Blue', id: 'teams' },
        { label: '18 Blue', id: 'teams' },
      ],
    },
    {
      title: 'Club',
      links: [
        { label: 'About', id: 'about' },
        { label: 'Programs', id: 'programs' },
        { label: 'Tryouts', id: 'tryouts' },
        { label: 'Sponsors', id: 'sponsors' },
        { label: 'Club Fees', id: 'fees' },
      ],
    },
    {
      title: 'External',
      links: [
        { label: 'Schedules & Results', href: 'https://www.advancedeventsystems.com' },
        { label: 'Register (Tryouts)', href: 'https://forms.gle/bZdUaRmFzXLsSxpy7' },
        { label: 'Facebook', href: 'https://www.facebook.com/impactvolleyballclubfw/' },
        { label: 'Instagram', href: 'https://www.instagram.com/impactlegendsvbc?igsh=YWhuNGozaGt0cm5m&utm_source=qr' },
      ],
    },
  ];

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <footer>
      <div className="container">
        <div className="foot-top">
          <div className="foot-brand">
            <div className="logo">IMPACT <em>LEGENDS</em></div>
            <p>Premier youth volleyball club in Fort Wayne, Indiana. Developing elite athletes and legendary character.</p>
            <p>2525 Florida Drive, Fort Wayne, IN</p>
            <div className="socials">
              <a href="https://www.facebook.com/impactvolleyballclubfw/" className="soc" title="Facebook" target="_blank" rel="noreferrer">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/impactlegendsvbc?igsh=YWhuNGozaGt0cm5m&utm_source=qr" className="soc" title="Instagram" target="_blank" rel="noreferrer">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                </svg>
              </a>
            </div>
          </div>

          {cols.map(col => (
            <div key={col.title} className="foot-col">
              <h4>{col.title}</h4>
              <ul>
                {col.links.map(l => (
                  <li key={l.label}>
                    {l.href
                      ? <a href={l.href} target="_blank" rel="noreferrer">{l.label}</a>
                      : <a onClick={() => scrollTo(l.id)} style={{ cursor: 'pointer' }}>{l.label}</a>
                    }
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="foot-bottom">
          <p>© {year} Impact <em>Legends</em> Volleyball Club · Fort Wayne, IN</p>
          <p>Built with <em>♥</em></p>
        </div>
      </div>
    </footer>
  );
}
