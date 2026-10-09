import { useState, useEffect } from 'react';
import content from '../content.json';
import ThemeSwitch from './ThemeSwitch';

export default function Nav({ toggleTheme, theme, onTeamsClick, onTryoutsClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  }

  return (
    <>
      <nav className={scrolled ? 'scrolled' : ''}>
        <a className="nav-logo" href="/">
          <img src="/logo.png" alt="" className="nav-logo-img" />
          {content.nav.logo.split(' ')[0]} <em>{content.nav.logo.split(' ')[1]}</em>
        </a>

        <ul className="nav-links">
          {content.nav.links.map(l => (
            <li key={l.anchor}><a onClick={() => scrollTo(l.anchor)} style={{ cursor: 'pointer' }}>{l.label}</a></li>
          ))}
          <li>
            <a href={content.nav.schedulesUrl} target="_blank" rel="noreferrer"
               style={{ display: 'flex', alignItems: 'center', gap: '.35rem' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {content.nav.schedulesLabel}
            </a>
          </li>
          <li>
            <ThemeSwitch theme={theme} onToggle={toggleTheme} variant="icon" />
          </li>
          <li><a href="#tryouts" className="nav-cta" onClick={e => { e.preventDefault(); scrollTo('tryouts'); }}>{content.nav.tryCta}</a></li>
        </ul>

        <button className="hamburger" aria-label="Open menu" onClick={() => setMenuOpen(o => !o)}>
          <span/><span/><span/>
        </button>
      </nav>

      {menuOpen && (
        <div className="mobile-menu">
          {content.nav.links.map(l => (
            <a key={l.anchor} onClick={() => scrollTo(l.anchor)} style={{ cursor: 'pointer' }}>{l.label}</a>
          ))}
          <a href={content.nav.schedulesUrl} target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)}>{content.nav.schedulesLabel}</a>
          <ThemeSwitch theme={theme} onToggle={toggleTheme} variant="icon" />
          <a href="#tryouts" className="nav-cta" onClick={e => { e.preventDefault(); scrollTo('tryouts'); }}>{content.nav.tryCta}</a>
        </div>
      )}
    </>
  );
}
