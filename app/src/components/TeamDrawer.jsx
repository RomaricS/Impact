import { useState, useEffect } from 'react';
import { logEvent } from '../lib/firebase';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function dateToNum(str) {
  if (!str) return 0;
  return parseInt(str.replace(/-/g, ''), 10);
}

function tourOwnsDay(t, year, month, day) {
  const d = parseInt(`${year}${String(month+1).padStart(2,'0')}${String(day).padStart(2,'0')}`, 10);
  const s = dateToNum(t.date);
  const e = dateToNum(t.endDate || t.date);
  return d >= s && d <= e;
}

function resultClass(result) {
  if (!result) return '';
  const n = parseInt(result);
  if (n === 1) return 'gold';
  if (n <= 3)  return 'silver';
  if (n <= 5)  return 'bronze';
  return 'neutral';
}

function initials(name) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function Calendar({ tournaments, practices }) {
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState(null);

  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const pracDays = new Set(practices.map(p => p.day));

  const first  = new Date(year, month, 1).getDay();
  const days   = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();

  function cellTournament(day, thisMonth) {
    if (!thisMonth) return null;
    return tournaments.find(t => tourOwnsDay(t, year, month, day)) || null;
  }

  function dayOfWeekName(day) {
    return DAYS[new Date(year, month, day).getDay()];
  }

  function hasPractice(day) {
    return pracDays.has(dayOfWeekName(day));
  }

  function rangeClass(t, day) {
    const d    = parseInt(`${year}${String(month+1).padStart(2,'0')}${String(day).padStart(2,'0')}`, 10);
    const s    = dateToNum(t.date);
    const e    = dateToNum(t.endDate || t.date);
    if (s === e || s === d) return 'range-start';
    if (e === d) return 'range-end';
    return 'range-mid';
  }

  const cells = [];
  for (let i = 0; i < first; i++) {
    cells.push({ day: prevDays - first + i + 1, thisMonth: false });
  }
  for (let d = 1; d <= days; d++) {
    cells.push({ day: d, thisMonth: true });
  }
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    cells.push({ day: i, thisMonth: false });
  }

  const isToday = (day, thisMonth) =>
    thisMonth && day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const upcoming = tournaments
    .filter(t => dateToNum(t.date) >= dateToNum(`${year}-${String(month+1).padStart(2,'0')}-01`))
    .sort((a, b) => dateToNum(a.date) - dateToNum(b.date));

  return (
    <div>
      <div className="cal-hdr">
        <button className="cal-nav-btn" onClick={() => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); }}>‹</button>
        <span className="cal-month-lbl">{MONTHS[month]} {year}</span>
        <button className="cal-nav-btn" onClick={() => { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); }}>›</button>
      </div>

      <div className="cal-legend">
        <div className="leg-item"><div className="leg-dot leg-t"/><span>Tournament</span></div>
        <div className="leg-item"><div className="leg-dot leg-p"/><span>Practice</span></div>
      </div>

      <div className="cal-grid">
        {dayNames.map(d => <div key={d} className="cal-dl">{d}</div>)}
        {cells.map((c, i) => {
          const t = cellTournament(c.day, c.thisMonth);
          const p = c.thisMonth && hasPractice(c.day);
          const cls = [
            'cal-cell',
            !c.thisMonth && 'other-month',
            t && 'has-tournament',
            t && rangeClass(t, c.day),
            t && 'range-day',
            !t && p && 'has-practice',
            t && p && 'has-both',
            isToday(c.day, c.thisMonth) && 'is-today',
            selected && c.thisMonth && t && t === selected && 'selected',
          ].filter(Boolean).join(' ');

          return (
            <div key={i} className={cls}
                 onClick={() => t && setSelected(t === selected ? null : t)}>
              {c.day}
              {t && <div className="cal-dot"/>}
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="evt-detail show">
          <div className="evt-date-lbl">{selected.date}{selected.endDate !== selected.date ? ` – ${selected.endDate}` : ''}</div>
          <div className="evt-name">{selected.name}</div>
          <div className="evt-loc">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            {selected.location} · {selected.address}
          </div>
          {selected.result && (
            <div className={`result-badge ${resultClass(selected.result)}`}>🏆 {selected.result}</div>
          )}
        </div>
      )}

      <div className="upcoming-lbl">Upcoming Tournaments</div>
      <div className="evt-list">
        {upcoming.length === 0 && <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No upcoming tournaments.</div>}
        {upcoming.map((t, i) => {
          const d = new Date(t.date + 'T12:00:00');
          return (
            <div key={i} className={`evt-row ${selected === t ? 'selected' : ''}`}
                 onClick={() => setSelected(t === selected ? null : t)}>
              <div className="evt-row-date">
                {d.getDate()}
                <small>{MONTHS[d.getMonth()].slice(0,3)}</small>
              </div>
              <div className="evt-row-info">
                <div className="evt-row-name">{t.name}</div>
                <div className="evt-row-loc">{t.address}</div>
                {t.result && <div className={`result-badge ${resultClass(t.result)}`}>{t.result}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TeamDrawer({ team, onClose }) {
  const [tab, setTab] = useState('schedule');
  const [posFilter, setPosFilter] = useState('All');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    logEvent('view_team', { team_name: team.name });
    return () => { document.body.style.overflow = ''; };
  }, []);

  const roster = team.roster || [];
  const positions = ['All', ...new Set(roster.map(p => p.pos).filter(Boolean))];
  const filtered = posFilter === 'All' ? roster : roster.filter(p => p.pos === posFilter);

  const tabs = [
    { id: 'schedule', label: 'Schedule' },
    { id: 'roster',   label: 'Roster' },
    { id: 'practices',label: 'Practices' },
    { id: 'coaches',  label: 'Coaches' },
  ];

  return (
    <>
      <div className="panel-bd open" onClick={onClose} />
      <div className="team-panel open">
        <div className="pnl-hdr">
          <button className="pnl-close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <div>
            <div className="pnl-title">{team.name}</div>
            <div className="pnl-sub">{team.sub}</div>
          </div>
          <span className={`pnl-badge ${team.color === 'pink' ? 'pill-p' : 'pill-b'}`}>
            {team.division}
          </span>
        </div>

        <div className="pnl-tabs">
          {tabs.map(t => (
            <button key={t.id} className={`pnl-tab ${tab === t.id ? 'on' : ''}`}
                    onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="pnl-body">
          {tab === 'schedule' && (
            <div className="pnl-pane">
              <Calendar tournaments={team.tournaments || []} practices={team.practices || []} />
            </div>
          )}

          {tab === 'roster' && (
            <div className="pnl-pane">
              <div className="pos-filter">
                {positions.map(p => (
                  <button key={p} className={`pos-btn ${posFilter === p ? 'on' : ''}`}
                          onClick={() => setPosFilter(p)}>{p}</button>
                ))}
              </div>
              <div className="roster-grid">
                {filtered.map((p, i) => (
                  <div key={i} className="player-card">
                    <div className="player-photo-wrap">
                      {p.photo
                        ? <img className="player-photo" src={p.photo} alt={p.name} />
                        : <div className="player-photo-placeholder">#{p.num || '—'}</div>
                      }
                    </div>
                    {p.num > 0 && <div className="player-num">#{p.num}</div>}
                    <div className="player-name">{p.name}</div>
                    {p.pos && <div className="player-pos-badge">{p.pos}</div>}
                    {(p.gradYear || p.school) && (
                      <div style={{ fontSize: '0.62rem', color: 'var(--muted)', marginTop: '0.3rem', lineHeight: 1.4 }}>
                        {p.school && <span>{p.school}</span>}
                        {p.gradYear && p.school && ' · '}
                        {p.gradYear && <span>'{String(p.gradYear).slice(-2)}</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'practices' && (
            <div className="pnl-pane">
              <div className="practice-cards">
                {(team.practices || []).map((p, i) => (
                  <div key={i} className="practice-crd">
                    <div className="prac-day">{p.day.slice(0,3).toUpperCase()}</div>
                    <div className="prac-info">
                      <div className="prac-time">{p.time}</div>
                      <div className="prac-loc">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        {p.location} · {p.address}
                      </div>
                    </div>
                    {p.type && <div className="prac-type">{p.type}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'coaches' && (
            <div className="pnl-pane">
              <div className="coach-cards">
                {(team.coaches || []).map((c, i) => (
                  <div key={i} className="coach-card">
                    <div className="coach-avatar">
                      {c.photo ? <img src={c.photo} alt={c.name} /> : initials(c.name)}
                    </div>
                    <div className="coach-info">
                      <div className="coach-name">{c.name}</div>
                      <div className="coach-title">{c.title}</div>
                      <div className="coach-bio">{c.bio}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
