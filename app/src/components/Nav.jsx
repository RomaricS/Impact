import { useState, useEffect } from 'react';

export default function Nav({ toggleTheme, theme, onTeamsClick, onTryoutsClick }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <nav className={scrolled ? 'scrolled' : ''}>
      <a className="nav-logo" href="/">IMPACT <em>LEGENDS</em></a>

      <ul className="nav-links">
        <li><a onClick={() => scrollTo('about')} style={{ cursor: 'pointer' }}>About</a></li>
        <li><a onClick={() => scrollTo('teams')} style={{ cursor: 'pointer' }}>Teams</a></li>
        <li><a onClick={() => scrollTo('programs')} style={{ cursor: 'pointer' }}>Programs</a></li>
        <li>
          <a href="https://www.advancedeventsystems.com" target="_blank" rel="noreferrer"
             style={{ display: 'flex', alignItems: 'center', gap: '.35rem' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Schedules
          </a>
        </li>
        <li>
          <button className="theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            )}
          </button>
        </li>
        <li><a href="#tryouts" className="nav-cta" onClick={e => { e.preventDefault(); scrollTo('tryouts'); }}>Register for Tryouts</a></li>
      </ul>
    </nav>
  );
}
