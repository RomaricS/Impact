import { useReveal } from '../hooks/useReveal';
import { Link } from 'react-router-dom';
import content from '../content.json';
import { sortTeams } from '../lib/teamOrder';

export default function Teams({ teams, loading }) {
  const ref = useReveal([loading]);

  const sorted = sortTeams(teams);

  return (
    <section className="sec" id="teams" style={{ background: 'var(--bg)' }} ref={ref}>
      <div className="container">
        <div className="sec-head rv">
          <div>
            <div className="sec-eye">{content.teams.eyebrow}</div>
            <h2 className="sec-title">{content.teams.titlePlain} {content.teams.titleHighlight}</h2>
          </div>
          <p className="sec-sub">{content.teams.subtitle}</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)' }}>Loading teams…</div>
        ) : (
          <div className="teams-grid rv">
            {sorted.map(team => {
              const isPink = team.color === 'pink';
              return (
                <Link
                  key={team.id}
                  to={`/teams/${team.id}`}
                  className={`team-card ${isPink ? 'team-card-pink' : 'team-card-blue'}`}
                >
                  <div className="team-card-top">
                    <span className="team-num">{team.name.split(' ')[0]}</span>
                    <span className="team-chip">{team.division}</span>
                  </div>
                  <div className="team-card-bottom">
                    <div>
                      <div className="team-name">{team.name}</div>
                      <div className="team-sub">{team.sub}</div>
                    </div>
                    <span className="team-roster-link">
                      <span className="team-roster-text">Roster</span>{' '}
                      <span className="team-arrow" aria-hidden="true">→</span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

    </section>
  );
}
