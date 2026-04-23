import { useReveal } from '../hooks/useReveal';
import TeamDrawer from './TeamDrawer';
import { useState } from 'react';

const TEAM_ORDER = ['12-blue', '14-blue', '16-blue', '16-pink', '17-blue', '18-blue'];

export default function Teams({ teams, loading }) {
  const ref = useReveal([loading]);
  const [activeTeam, setActiveTeam] = useState(null);

  const sorted = TEAM_ORDER.map(id => teams[id]).filter(Boolean);

  return (
    <section className="sec" id="teams" style={{ background: 'var(--bg)' }} ref={ref}>
      <div className="container">
        <div className="teams-hdr rv">
          <div>
            <div className="sec-eye">Club Teams</div>
            <h2 className="sec-title">Our<br />Teams</h2>
          </div>
          <p className="sec-sub">Six competitive divisions developing elite players from 12U through 18U across northeast Indiana.</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)' }}>Loading teams…</div>
        ) : (
          <div className="teams-grid rv">
            {sorted.map(team => (
              <button key={team.id} className="team-card" onClick={() => setActiveTeam(team)}>
                <span className={`team-pill ${team.color === 'pink' ? 'pill-p' : 'pill-b'}`}>
                  {team.division}
                </span>
                <div className="team-num">{team.name.split(' ')[0]}</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.15rem', letterSpacing: '0.06em' }}>
                  {team.name}
                </div>
                <div className="team-desc">{team.sub} · {team.roster?.length || 0} players</div>
                <span className="team-arrow">↗</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {activeTeam && (
        <TeamDrawer team={activeTeam} onClose={() => setActiveTeam(null)} />
      )}
    </section>
  );
}
