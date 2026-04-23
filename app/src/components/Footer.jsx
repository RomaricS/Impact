import content from '../content.json';

export default function Footer() {
  const year = new Date().getFullYear();
  const cols = content.footer.columns;

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <footer>
      <div className="container">
        <div className="foot-top">
          <div className="foot-brand">
            <div className="logo">{content.footer.logo.split(' ')[0]} <em>{content.footer.logo.split(' ')[1]}</em></div>
            <p>{content.footer.tagline}</p>
            <p>{content.footer.address}</p>
            <div className="socials">
              <a href={content.footer.facebookUrl} className="soc" title="Facebook" target="_blank" rel="noreferrer">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a href={content.footer.instagramUrl} className="soc" title="Instagram" target="_blank" rel="noreferrer">
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
          <p>© {year} {content.footer.copyright}</p>
          <p>Built with <em>♥</em></p>
        </div>
      </div>
    </footer>
  );
}
