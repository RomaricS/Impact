import { useState } from 'react';
import content from '../content.json';
import ThemeSwitch from './ThemeSwitch';

export default function Nav({ toggleTheme, theme, onTeamsClick, onTryoutsClick }) {
  const [menuOpen, setMenuOpen] = useState(false);

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  }

  return (
    <nav>
      <a className="nav-logo" href="/" aria-label={`${content.nav.logo}, home`}>
        <img src="/logo.png" alt={content.nav.logo} className="nav-logo-img" />
      </a>

      <ul className="nav-links">
        {content.nav.links.map(l => (
          <li key={l.anchor}><a onClick={() => scrollTo(l.anchor)} style={{ cursor: 'pointer' }}>{l.label}</a></li>
        ))}
        <li>
          <a href={content.nav.schedulesUrl} target="_blank" rel="noreferrer">
            {content.nav.schedulesLabel} <span aria-hidden="true">↗</span>
          </a>
        </li>
      </ul>

      <div className="nav-actions">
        <ThemeSwitch theme={theme} onToggle={toggleTheme} variant="icon" />
        <a href="#tryouts" className="nav-cta" onClick={e => { e.preventDefault(); scrollTo('tryouts'); }}>{content.nav.tryCta}</a>
        <button
          className="hamburger"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(o => !o)}
        >
          <span/><span/><span/>
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          {content.nav.links.map(l => (
            <a key={l.anchor} onClick={() => scrollTo(l.anchor)} style={{ cursor: 'pointer' }}>{l.label}</a>
          ))}
          <a href={content.nav.schedulesUrl} target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)}>
            {content.nav.schedulesLabel} <span aria-hidden="true">↗</span>
          </a>
          <ThemeSwitch theme={theme} onToggle={toggleTheme} variant="icon" />
          <a href="#tryouts" className="nav-cta" onClick={e => { e.preventDefault(); scrollTo('tryouts'); }}>{content.nav.tryCta}</a>
        </div>
      )}
    </nav>
  );
}
