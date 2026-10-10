import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { useTeams } from '../hooks/useTeams';
import { useSponsors } from '../hooks/useSponsors';
import { useAnnouncements } from '../hooks/useAnnouncements';
import { useCommunity } from '../hooks/useCommunity';
import { sortTeams, nextOrder } from '../lib/teamOrder';
import SponsorsPanel from '../admin/SponsorsPanel';
import AnnouncementsPanel from '../admin/AnnouncementsPanel';
import CommunityPanel from '../admin/CommunityPanel';
import SettingsPanel from '../admin/SettingsPanel';
import TeamEditor from '../admin/TeamEditor';
import { PageHead, Chip } from '../admin/ui';
import ThemeSwitch from '../components/ThemeSwitch';

function genId() { return Math.random().toString(36).slice(2, 9); }

const ICONS = {
  dashboard: 'M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z',
  teams: 'M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM21 19v-1a4 4 0 0 0-3-3.9M15.5 3.2a3.5 3.5 0 0 1 0 6.6',
  sponsors: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
  announcements: 'M3 10v4h3l6 4V6L6 10H3zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11',
  community: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
  settings: 'M4 7h10M18 7h2M4 17h2M10 17h10M16 5v4M8 15v4',
};

function useCountUp(target) {
  const [k, setK] = useState(() =>
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 1 : 0);
  useEffect(() => {
    if (k === 1) return;
    let raf, start = null;
    const step = ts => {
      if (start === null) start = ts;
      const t = Math.min(1, (ts - start) / 1100);
      setK(1 - Math.pow(1 - t, 3));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return Math.round(target * k);
}

function StatTile({ label, value, sub, tone }) {
  const shown = useCountUp(value);
  return (
    <div className={`ad-tile ad-tile-${tone}`}>
      <div className="ad-tile-label">{label}</div>
      <div className="ad-tile-value">{shown}</div>
      <div className="ad-tile-sub">{sub}</div>
    </div>
  );
}

function TeamGrid({ teams, onOpen }) {
  return (
    <div className="ad-team-grid">
      {teams.map(t => (
        <button key={t.id} type="button" className={`ad-team-card ${t.color === 'pink' ? 'is-pink' : 'is-blue'}`} onClick={() => onOpen(t.id)}>
          <span className="ad-team-num">{t.name.split(' ')[0]}</span>
          <span className="ad-team-name">{t.name}</span>
          <span className="ad-team-meta">{t.sub} · {t.roster?.length || 0} players</span>
        </button>
      ))}
    </div>
  );
}

function Dashboard({ teams, loading, onOpenTeam, goTeams }) {
  const players = teams.reduce((s, t) => s + (t.roster?.length || 0), 0);
  const tournaments = teams.reduce((s, t) => s + (t.tournaments?.length || 0), 0);
  const blue = teams.filter(t => t.color !== 'pink').length;
  const empty = teams.filter(t => !t.roster?.length);

  return (
    <div className="ad-screen">
      <PageHead title="Dashboard" sub="Welcome back. Manage your club content below." />
      {!loading && (
        <div className="ad-tiles">
          <StatTile label="Teams" value={teams.length} sub={`${blue} Blue · ${teams.length - blue} Pink`} tone="blue" />
          <StatTile label="Players" value={players} sub="Across all rosters" tone="pink" />
          <StatTile label="Tournaments" value={tournaments} sub="Across all team schedules" tone="chip" />
        </div>
      )}
      {!loading && empty.length > 0 && (
        <div className="ad-notice">
          <div>
            <strong>{empty.length} team{empty.length === 1 ? ' has an' : 's have'} empty roster{empty.length === 1 ? '' : 's'}</strong>
            <span>{empty.map(t => t.name).join(', ')}</span>
          </div>
          <button type="button" className="ad-btn ad-btn-outline" onClick={goTeams}>Open teams</button>
        </div>
      )}
      <h2 className="ad-h2">Quick access</h2>
      {loading ? <div className="ad-empty">Loading…</div> : <TeamGrid teams={teams} onOpen={onOpenTeam} />}
    </div>
  );
}

function TeamsList({ teams, loading, onOpen, onAdd }) {
  return (
    <div className="ad-screen">
      <PageHead title="Teams" sub="Select a team to manage it, or add a new one."
                action={<button type="button" className="ad-btn ad-btn-primary" onClick={onAdd}>+ Add team</button>} />
      {loading ? <div className="ad-empty">Loading…</div> : (
        <div className="ad-table" role="table" aria-label="Teams">
          <div className="ad-table-row ad-table-head" role="row">
            <span role="columnheader">#</span><span role="columnheader">Team</span>
            <span role="columnheader">Division</span><span role="columnheader">Players</span>
            <span role="columnheader">Tournaments</span><span role="columnheader" />
          </div>
          {teams.map(t => (
            <button key={t.id} type="button" className="ad-table-row" role="row" onClick={() => onOpen(t.id)}>
              <span className="ad-mono" role="cell">{t.order ?? '—'}</span>
              <span className="ad-table-team" role="cell">
                <span className={`ad-team-num sm ${t.color === 'pink' ? 'is-pink' : 'is-blue'}`}>{t.name.split(' ')[0]}</span>
                <span><strong>{t.name}</strong><span className="ad-hint">{t.sub}</span></span>
              </span>
              <span role="cell"><Chip tone={t.color === 'pink' ? 'pink' : 'blue'}>{t.division}</Chip></span>
              <span role="cell">{t.roster?.length || 0}</span>
              <span role="cell">{t.tournaments?.length || 0}</span>
              <span className="ad-table-edit" role="cell">Edit →</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminPage({ toast, theme, toggleTheme }) {
  const { user, logout } = useAuth();
  const { teams, loading } = useTeams();
  const { sponsors } = useSponsors();
  const { announcements } = useAnnouncements(100);
  const { campaigns } = useCommunity();
  const navigate = useNavigate();
  const [view, setView] = useState('dashboard');
  const [selectedTeamId, setSelectedTeamId] = useState(null);

  const sorted = sortTeams(teams);
  const selectedTeam = selectedTeamId ? teams[selectedTeamId] : null;

  async function handleLogout() {
    await logout();
    navigate('/admin/login');
  }

  async function handleAddTeam() {
    const id = genId();
    try {
      await setDoc(doc(db, 'teams', id), {
        name: 'New Team', sub: '', division: 'Blue', color: 'blue',
        order: nextOrder(teams), roster: [], coaches: [], practices: [], tournaments: [],
      });
      setSelectedTeamId(id);
      setView('teams');
      toast('Team created — edit its details ✓');
    } catch {
      toast('Could not create team', 'error');
    }
  }

  async function handleDeleteTeam(team) {
    try {
      await deleteDoc(doc(db, 'teams', team.id));
      setSelectedTeamId(null);
      toast('Team deleted ✓');
    } catch {
      toast('Delete failed', 'error');
    }
  }

  function go(v) { setView(v); setSelectedTeamId(null); }
  function openTeam(id) { setSelectedTeamId(id); setView('teams'); }

  const nav = [
    { id: 'dashboard',     label: 'Dashboard' },
    { id: 'teams',         label: 'Teams',         count: sorted.length },
    { id: 'sponsors',      label: 'Sponsors',      count: sponsors.length },
    { id: 'announcements', label: 'Announcements', count: announcements.length },
    { id: 'community',     label: 'Community',     count: campaigns.length },
    { id: 'settings',      label: 'Settings' },
  ];

  return (
    <div className="ad-layout">
      <aside className="ad-side">
        <div className="ad-brand">
          <img src="/logo-wide.png" alt="Impact Legends" className="ad-logo" />
          <span className="ad-brand-tag">Admin</span>
        </div>
        <nav className="ad-nav" aria-label="Admin">
          {nav.map(n => (
            <button key={n.id} type="button"
                    className={`ad-nav-item ${view === n.id ? 'on' : ''}`}
                    aria-current={view === n.id ? 'page' : undefined}
                    onClick={() => go(n.id)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={ICONS[n.id]} />
              </svg>
              <span>{n.label}</span>
              {n.count !== undefined && <span className="ad-nav-count">{n.count}</span>}
            </button>
          ))}
        </nav>
        <div className="ad-side-foot">
          <div className="theme-switch-row">
            <span>Dark mode</span>
            <ThemeSwitch theme={theme} onToggle={toggleTheme} variant="switch" />
          </div>
          <a className="ad-btn ad-btn-outline ad-btn-block" href="/" target="_blank" rel="noreferrer">View site ↗</a>
          <button type="button" className="ad-signout" onClick={handleLogout}>Sign out</button>
          <div className="ad-user">{user?.email}</div>
        </div>
      </aside>

      <main className="ad-main">
        <div className="ad-fade" key={selectedTeam ? `team-${selectedTeamId}` : view}>
          {selectedTeam ? (
            <TeamEditor team={selectedTeam} onBack={() => setSelectedTeamId(null)}
                        onDelete={() => handleDeleteTeam(selectedTeam)} toast={toast} />
          ) : (
            <>
              {view === 'dashboard' && <Dashboard teams={sorted} loading={loading} onOpenTeam={openTeam} goTeams={() => go('teams')} />}
              {view === 'teams' && <TeamsList teams={sorted} loading={loading} onOpen={openTeam} onAdd={handleAddTeam} />}
              {view === 'sponsors' && <SponsorsPanel toast={toast} />}
              {view === 'announcements' && <AnnouncementsPanel toast={toast} />}
              {view === 'community' && <CommunityPanel toast={toast} />}
              {view === 'settings' && <SettingsPanel teams={teams} toast={toast} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
