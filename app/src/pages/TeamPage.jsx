import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import TeamCalendar from '../components/TeamCalendar';
import { POSITIONS, initials } from '../lib/teamUtils';
import { useTeams } from '../hooks/useTeams';
import { logEvent } from '../lib/firebase';
import content from '../content.json';

const SECTIONS = [
  { id: 'roster',    label: 'Roster' },
  { id: 'coaches',   label: 'Coaches' },
  { id: 'practices', label: 'Practices' },
  { id: 'schedule',  label: 'Schedule' },
];

export default function TeamPage({ theme, toggleTheme }) {
  const { id } = useParams();
  const { teams, loading } = useTeams();
  const team = teams[id];
  const [active, setActive] = useState('roster');
  const [posFilter, setPosFilter] = useState('All');

  useEffect(() => { window.scrollTo(0, 0); }, [id]);
  useEffect(() => {
    if (team?.name) logEvent('view_team', { team_name: team.name });
  }, [team?.name]);

  function jump(sectionId) {
    setActive(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  }

  if (loading || !team) {
    return (
      <>
        <Nav theme={theme} toggleTheme={toggleTheme} />
        <main className="tp-missing">
          {loading ? 'Loading team…' : (
            <>
              <p>That team could not be found.</p>
              <Link to="/#teams" className="btn-ink">← All teams</Link>
            </>
          )}
        </main>
        <Footer />
      </>
    );
  }

  const roster = team.roster || [];
  const coaches = team.coaches || [];
  const practices = team.practices || [];
  const filtered = posFilter === 'All' ? roster : roster.filter(p => p.pos === posFilter || p.pos2 === posFilter);

  return (
    <>
      <Nav theme={theme} toggleTheme={toggleTheme} />

      <section className={`tp-hero ${team.color === 'pink' ? 'tp-hero-pink' : ''}`}>
        <div className="tp-hero-inner">
          <nav aria-label="Breadcrumb" className="tp-crumb">
            <Link to="/#teams">{content.nav.links.find(l => l.anchor === 'teams')?.label || 'Teams'}</Link>
            <span aria-hidden="true"> / </span>{team.name}
          </nav>
          <div className="tp-title-row">
            <div>
              <div className="tp-eyebrow">
                <span className="tp-badge">{team.division}</span>{team.sub}
              </div>
              <h1 className="tp-title">{team.name}</h1>
            </div>
            <dl className="tp-counts">
              <div><dt>Players</dt><dd>{roster.length}</dd></div>
              <div><dt>Coaches</dt><dd>{coaches.length}</dd></div>
            </dl>
          </div>
          <nav aria-label="Team sections" className="tp-tabs">
            {SECTIONS.map(s => (
              <a key={s.id} href={`#${s.id}`}
                 className={`tp-tab ${active === s.id ? 'on' : ''}`}
                 aria-current={active === s.id ? 'true' : undefined}
                 onClick={e => { e.preventDefault(); jump(s.id); }}>
                {s.label}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <section id="roster" className="tp-sec">
        <div className="sec-head">
          <h2 className="tp-h2">Roster</h2>
          <p className="sec-sub">{filtered.length} player{filtered.length === 1 ? '' : 's'}</p>
        </div>
        {roster.length > 0 && (
          <div className="pos-filter">
            {['All', ...POSITIONS].map(p => (
              <button key={p} type="button" className={`pos-btn ${posFilter === p ? 'on' : ''}`}
                      onClick={() => setPosFilter(p)}>{p}</button>
            ))}
          </div>
        )}
        {roster.length === 0 ? (
          <div className="tp-empty"><strong>No players listed yet</strong><span>The roster appears here once it is posted.</span></div>
        ) : (
          <div className="roster-grid">
            {filtered.map((p, i) => (
              <article key={i} className="player-card">
                <div className="player-photo-wrap">
                  {p.photo
                    ? <img className="player-photo" src={p.photo} alt={p.name} />
                    : <div className="player-photo-placeholder">Player photo</div>}
                  {p.num > 0 && <span className="player-num">{p.num}</span>}
                </div>
                <div className="player-card-body">
                  <div className="player-name">{p.name}</div>
                  {(p.pos || p.pos2) && (
                    <div className="player-badges">
                      {p.pos && <span className="player-pos-badge primary">{p.pos}</span>}
                      {p.pos2 && <span className="player-pos-badge">{p.pos2}</span>}
                    </div>
                  )}
                  {(p.gradYear || p.school) && (
                    <div className="player-meta">
                      {p.school && <span>{p.school}</span>}
                      {p.gradYear && <span>Class of {p.gradYear}</span>}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section id="coaches" className="tp-sec">
        <h2 className="tp-h2">Coaches</h2>
        {coaches.length === 0 ? (
          <div className="tp-empty"><strong>No coaches listed yet</strong></div>
        ) : (
          <div className="coach-cards">
            {coaches.map((c, i) => (
              <article key={i} className="coach-card">
                <div className="coach-avatar">
                  {c.photo ? <img src={c.photo} alt={c.name} /> : initials(c.name)}
                </div>
                <div className="coach-info">
                  <div className="coach-title">{c.title}</div>
                  <div className="coach-name">{c.name}</div>
                  {c.bio && <p className="coach-bio">{c.bio}</p>}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="tp-sec tp-split">
        <div id="practices" className="tp-card">
          <h2 className="tp-h3">Practices</h2>
          {practices.length === 0 ? (
            <p className="sec-sub">No practices posted yet.</p>
          ) : (
            <div className="practice-rows">
              {practices.map((p, i) => (
                <div key={i} className="practice-row">
                  <span className="prac-day">{p.day}</span>
                  {p.type && <span className="prac-type">{p.type}</span>}
                  <span className="prac-time">{p.time}{p.location ? ` · ${p.location}` : ''}</span>
                  {p.address && <span className="prac-addr">{p.address}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
        <div id="schedule" className="tp-card">
          <h2 className="tp-h3">Schedule</h2>
          <TeamCalendar tournaments={team.tournaments || []} practices={practices} />
          <a href={content.nav.schedulesUrl} target="_blank" rel="noreferrer" className="tp-aes">
            Full schedules &amp; results on AES ↗
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}
