import { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTeams } from '../hooks/useTeams';
import { usePayments } from '../hooks/usePayments';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import ImageUpload from '../admin/ImageUpload';

const TEAM_ORDER = ['12-blue', '14-blue', '16-blue', '16-pink', '17-blue', '18-blue'];

/* ─── Small helpers ─── */
function genId() { return Math.random().toString(36).slice(2, 9); }

function EmptyItem({ label, onCreate }) {
  return (
    <div className="admin-empty">
      No {label} yet. <button className="admin-btn admin-btn-ghost admin-btn-sm" style={{ marginLeft: '0.5rem' }} onClick={onCreate}>+ Add first</button>
    </div>
  );
}

/* ─── Player editor ─── */
function RosterEditor({ team, onSave }) {
  const [roster, setRoster] = useState(team.roster || []);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', num: '', pos: '', photo: '' });

  function openAdd() { setForm({ name: '', num: '', pos: '', photo: '', gradYear: '', school: '' }); setEditing('new'); }
  function openEdit(i) { setForm({ ...roster[i] }); setEditing(i); }

  function save() {
    const item = { ...form, num: Number(form.num) || 0 };
    const next = editing === 'new' ? [...roster, item] : roster.map((r, i) => i === editing ? item : r);
    setRoster(next);
    onSave(next);
    setEditing(null);
  }

  function remove(i) {
    const next = roster.filter((_, idx) => idx !== i);
    setRoster(next);
    onSave(next);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{roster.length} players</span>
        <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={openAdd}>+ Add Player</button>
      </div>

      {editing !== null && (
        <div className="admin-card" style={{ marginBottom: '1rem', borderColor: 'rgba(255,31,109,0.25)' }}>
          <div className="admin-card-title">{editing === 'new' ? 'New Player' : 'Edit Player'}</div>
          <div className="admin-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Jersey #</label>
                <input className="form-input" type="number" value={form.num} onChange={e => setForm(f => ({ ...f, num: e.target.value }))} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Position</label>
                <input className="form-input" value={form.pos} placeholder="e.g. Outside Hitter" onChange={e => setForm(f => ({ ...f, pos: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Player Photo</label>
                <ImageUpload
                  value={form.photo}
                  onChange={url => setForm(f => ({ ...f, photo: url }))}
                  path={`players/${form.name.replace(/\s+/g,'-').toLowerCase() || 'player'}`}
                  portrait
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Grad Year</label>
                <input className="form-input" value={form.gradYear} placeholder="e.g. 2027" onChange={e => setForm(f => ({ ...f, gradYear: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">School</label>
                <input className="form-input" value={form.school} placeholder="e.g. Canterbury HS" onChange={e => setForm(f => ({ ...f, school: e.target.value }))} />
              </div>
            </div>
            <div className="admin-actions">
              <button className="admin-btn admin-btn-primary" onClick={save}>Save Player</button>
              <button className="admin-btn admin-btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {roster.length === 0 && editing === null && <EmptyItem label="players" onCreate={openAdd} />}
      <div className="admin-list">
        {roster.map((p, i) => (
          <div key={i} className="admin-list-item">
            <div className="admin-list-item-info">
              <strong>#{p.num || '—'} {p.name}</strong>
              <span>{[p.pos, p.school, p.gradYear ? `'${String(p.gradYear).slice(-2)}` : ''].filter(Boolean).join(' · ') || 'No details'}</span>
            </div>
            <div className="admin-actions">
              <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => openEdit(i)}>Edit</button>
              <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => remove(i)}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Tournament editor ─── */
function TournamentEditor({ team, onSave }) {
  const [list, setList] = useState(team.tournaments || []);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', date: '', endDate: '', location: '', address: '', result: '' });

  function openAdd() { setForm({ name: '', date: '', endDate: '', location: '', address: '', result: '' }); setEditing('new'); }
  function openEdit(i) { setForm({ ...list[i] }); setEditing(i); }

  function save() {
    const next = editing === 'new' ? [...list, { ...form }] : list.map((t, i) => i === editing ? { ...form } : t);
    const sorted = [...next].sort((a, b) => a.date.localeCompare(b.date));
    setList(sorted);
    onSave(sorted);
    setEditing(null);
  }

  function remove(i) {
    const next = list.filter((_, idx) => idx !== i);
    setList(next);
    onSave(next);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{list.length} tournaments</span>
        <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={openAdd}>+ Add Tournament</button>
      </div>

      {editing !== null && (
        <div className="admin-card" style={{ marginBottom: '1rem', borderColor: 'rgba(255,31,109,0.25)' }}>
          <div className="admin-card-title">{editing === 'new' ? 'New Tournament' : 'Edit Tournament'}</div>
          <div className="admin-form">
            <div className="form-group">
              <label className="form-label">Tournament Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input className="form-input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input className="form-input" type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Venue / Organizer</label>
                <input className="form-input" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">City, State</label>
                <input className="form-input" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Result (leave blank if upcoming)</label>
              <input className="form-input" value={form.result} placeholder="e.g. 1st of 24 teams" onChange={e => setForm(f => ({ ...f, result: e.target.value }))} />
            </div>
            <div className="admin-actions">
              <button className="admin-btn admin-btn-primary" onClick={save}>Save Tournament</button>
              <button className="admin-btn admin-btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {list.length === 0 && editing === null && <EmptyItem label="tournaments" onCreate={openAdd} />}
      <div className="admin-list">
        {list.map((t, i) => (
          <div key={i} className="admin-list-item">
            <div className="admin-list-item-info">
              <strong>{t.name}</strong>
              <span>{t.date}{t.endDate !== t.date ? ` – ${t.endDate}` : ''} · {t.address} {t.result ? `· ${t.result}` : ''}</span>
            </div>
            <div className="admin-actions">
              <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => openEdit(i)}>Edit</button>
              <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => remove(i)}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Practice editor ─── */
function PracticeEditor({ team, onSave }) {
  const [list, setList] = useState(team.practices || []);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ day: 'Monday', time: '', location: '', address: '', type: '' });
  const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

  function openAdd() { setForm({ day: 'Monday', time: '', location: '', address: '', type: '' }); setEditing('new'); }
  function openEdit(i) { setForm({ ...list[i] }); setEditing(i); }

  function save() {
    const next = editing === 'new' ? [...list, { ...form }] : list.map((p, i) => i === editing ? { ...form } : p);
    setList(next);
    onSave(next);
    setEditing(null);
  }

  function remove(i) {
    const next = list.filter((_, idx) => idx !== i);
    setList(next);
    onSave(next);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{list.length} sessions</span>
        <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={openAdd}>+ Add Practice</button>
      </div>

      {editing !== null && (
        <div className="admin-card" style={{ marginBottom: '1rem', borderColor: 'rgba(255,31,109,0.25)' }}>
          <div className="admin-card-title">{editing === 'new' ? 'New Practice' : 'Edit Practice'}</div>
          <div className="admin-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Day</label>
                <select className="form-select" value={form.day} onChange={e => setForm(f => ({ ...f, day: e.target.value }))}>
                  {DAYS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Time</label>
                <input className="form-input" value={form.time} placeholder="6:00 – 8:00 PM" onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Location Name</label>
                <input className="form-input" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <input className="form-input" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Session Type</label>
              <input className="form-input" value={form.type} placeholder="e.g. Full Team, Position Training" onChange={e => setForm(f => ({ ...f, type: e.target.value }))} />
            </div>
            <div className="admin-actions">
              <button className="admin-btn admin-btn-primary" onClick={save}>Save Practice</button>
              <button className="admin-btn admin-btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {list.length === 0 && editing === null && <EmptyItem label="practices" onCreate={openAdd} />}
      <div className="admin-list">
        {list.map((p, i) => (
          <div key={i} className="admin-list-item">
            <div className="admin-list-item-info">
              <strong>{p.day} · {p.time}</strong>
              <span>{p.location}{p.type ? ` · ${p.type}` : ''}</span>
            </div>
            <div className="admin-actions">
              <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => openEdit(i)}>Edit</button>
              <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => remove(i)}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Coach editor ─── */
function CoachEditor({ team, onSave }) {
  const [list, setList] = useState(team.coaches || []);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', title: '', bio: '', photo: '' });

  function openAdd() { setForm({ name: '', title: 'Head Coach', bio: '', photo: '' }); setEditing('new'); }
  function openEdit(i) { setForm({ ...list[i] }); setEditing(i); }

  function save() {
    const next = editing === 'new' ? [...list, { ...form }] : list.map((c, i) => i === editing ? { ...form } : c);
    setList(next);
    onSave(next);
    setEditing(null);
  }

  function remove(i) {
    const next = list.filter((_, idx) => idx !== i);
    setList(next);
    onSave(next);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{list.length} coaches</span>
        <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={openAdd}>+ Add Coach</button>
      </div>

      {editing !== null && (
        <div className="admin-card" style={{ marginBottom: '1rem', borderColor: 'rgba(255,31,109,0.25)' }}>
          <div className="admin-card-title">{editing === 'new' ? 'New Coach' : 'Edit Coach'}</div>
          <div className="admin-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Title</label>
                <select className="form-select" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}>
                  <option>Head Coach</option>
                  <option>Assistant Coach</option>
                  <option>Volunteer Coach</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea className="form-textarea" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Coach Photo</label>
              <ImageUpload
                value={form.photo}
                onChange={url => setForm(f => ({ ...f, photo: url }))}
                path={`coaches/${form.name.replace(/\s+/g,'-').toLowerCase() || 'coach'}`}
              />
            </div>
            <div className="admin-actions">
              <button className="admin-btn admin-btn-primary" onClick={save}>Save Coach</button>
              <button className="admin-btn admin-btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {list.length === 0 && editing === null && <EmptyItem label="coaches" onCreate={openAdd} />}
      <div className="admin-list">
        {list.map((c, i) => (
          <div key={i} className="admin-list-item">
            <div className="admin-list-item-info">
              <strong>{c.name}</strong>
              <span>{c.title}</span>
            </div>
            <div className="admin-actions">
              <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => openEdit(i)}>Edit</button>
              <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => remove(i)}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Team editor page ─── */
function TeamEditorPage({ team, onBack, onSave, toast }) {
  const [tab, setTab] = useState('roster');

  async function saveField(field, value) {
    try {
      await setDoc(doc(db, 'teams', team.id), { [field]: value }, { merge: true });
      toast('Saved ✓');
    } catch {
      toast('Save failed', 'error');
    }
  }

  const tabs = ['roster', 'tournaments', 'practices', 'coaches'];

  return (
    <div>
      <button className="admin-back" onClick={onBack}>← All Teams</button>
      <div className="admin-page-title">{team.name}</div>
      <div className="admin-page-sub">{team.sub} · {team.roster?.length || 0} players</div>

      <div className="admin-section-tabs">
        {tabs.map(t => (
          <button key={t} className={`admin-tab ${tab === t ? 'active' : ''}`}
                  onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="admin-card">
        {tab === 'roster'      && <RosterEditor      team={team} onSave={v => saveField('roster', v)} />}
        {tab === 'tournaments' && <TournamentEditor  team={team} onSave={v => saveField('tournaments', v)} />}
        {tab === 'practices'   && <PracticeEditor    team={team} onSave={v => saveField('practices', v)} />}
        {tab === 'coaches'     && <CoachEditor       team={team} onSave={v => saveField('coaches', v)} />}
      </div>
    </div>
  );
}

/* ─── Settings page ─── */
function SettingsPage({ teams, toast }) {
  const importRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const { qrs } = usePayments();
  const [qrDraft, setQrDraft] = useState(null);
  const [savingQr, setSavingQr] = useState(false);

  // Initialize draft from live data when first opened
  function openQrEditor() {
    setQrDraft(qrs.map(q => ({ ...q })));
  }

  function updateQrField(i, field, value) {
    setQrDraft(d => d.map((q, idx) => idx === i ? { ...q, [field]: value } : q));
  }

  async function saveQrs() {
    setSavingQr(true);
    try {
      await setDoc(doc(db, 'settings', 'payments'), { qr: qrDraft });
      toast('Payment QR codes saved ✓');
      setQrDraft(null);
    } catch (err) {
      console.error(err);
      toast('Save failed', 'error');
    } finally {
      setSavingQr(false);
    }
  }

  function handleExport() {
    const clean = {};
    Object.entries(teams).forEach(([id, t]) => {
      const { id: _id, ...rest } = t;
      clean[id] = rest;
    });
    const blob = new Blob([JSON.stringify(clean, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `impact-teams-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Exported ✓');
  }

  async function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await Promise.all(
        Object.entries(data).map(([id, team]) =>
          setDoc(doc(db, 'teams', id), team)
        )
      );
      toast('Imported successfully ✓');
    } catch (err) {
      console.error(err);
      toast('Import failed — check JSON format', 'error');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  }

  return (
    <div>
      <div className="admin-page-title">Settings</div>
      <div className="admin-page-sub">Site configuration and data management.</div>

      {/* ── QR Code Editor ── */}
      <div className="admin-card">
        <div className="admin-card-title">Payment QR Codes</div>
        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1.25rem', lineHeight: 1.7 }}>
          Update QR code images and account handles. Changes appear immediately on the public site.
        </p>

        {!qrDraft ? (
          <button className="admin-btn admin-btn-primary" onClick={openQrEditor}>
            Edit QR Codes
          </button>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
              {qrDraft.map((q, i) => (
                <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{q.label}</div>
                  <ImageUpload
                    value={q.src}
                    onChange={url => updateQrField(i, 'src', url)}
                    path={`qr/${q.cls}-${i}`}
                  />
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Handle</label>
                    <input className="form-input" value={q.handle}
                           onChange={e => updateQrField(i, 'handle', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Note</label>
                    <input className="form-input" value={q.note}
                           onChange={e => updateQrField(i, 'note', e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="admin-btn admin-btn-primary" onClick={saveQrs} disabled={savingQr}>
                {savingQr ? 'Saving…' : 'Save QR Codes'}
              </button>
              <button className="admin-btn admin-btn-ghost" onClick={() => setQrDraft(null)}>
                Cancel
              </button>
            </div>
          </>
        )}
      </div>

      <div className="admin-card">
        <div className="admin-card-title">Export Data</div>
        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1.25rem', lineHeight: 1.7 }}>
          Download all current team data from Firestore as a JSON file — useful as a backup or to share for editing.
        </p>
        <button className="admin-btn admin-btn-primary" onClick={handleExport}>
          ↓ Export teams.json
        </button>
      </div>

      <div className="admin-card">
        <div className="admin-card-title">Import Data</div>
        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1.25rem', lineHeight: 1.7 }}>
          Upload a previously exported JSON file to restore or update all team data.{' '}
          <strong style={{ color: 'var(--fg)' }}>This overwrites existing data.</strong>
        </p>
        <input ref={importRef} type="file" accept=".json,application/json"
               style={{ display: 'none' }} onChange={handleImport} />
        <button className="admin-btn admin-btn-ghost" onClick={() => importRef.current?.click()} disabled={importing}>
          {importing ? 'Importing…' : '↑ Import teams.json'}
        </button>
      </div>

    </div>
  );
}

/* ─── Main Admin Page ─── */
export default function AdminPage({ toast }) {
  const { user, logout } = useAuth();
  const { teams, loading } = useTeams();
  const navigate = useNavigate();
  const [view, setView] = useState('dashboard');
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  async function handleLogout() {
    await logout();
    navigate('/admin/login');
  }

  const sorted = TEAM_ORDER.map(id => teams[id]).filter(Boolean);
  const selectedTeam = selectedTeamId ? teams[selectedTeamId] : null;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard',  icon: '⊞' },
    { id: 'teams',     label: 'Teams',       icon: '🏐' },
    { id: 'settings',  label: 'Settings',    icon: '⚙' },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="logo">IMPACT <em>LEGENDS</em></div>
          <p>Admin Dashboard</p>
        </div>
        <div className="admin-nav">
          <div className="admin-nav-section">Navigation</div>
          {navItems.map(n => (
            <button key={n.id}
                    className={`admin-nav-item ${view === n.id ? 'active' : ''}`}
                    onClick={() => { setView(n.id); setSelectedTeamId(null); }}>
              <span>{n.icon}</span> {n.label}
            </button>
          ))}
          <div className="admin-nav-section" style={{ marginTop: '1rem' }}>Account</div>
          <a className="admin-nav-item" href="/" target="_blank" rel="noreferrer">
            <span>↗</span> View Site
          </a>
          <button className="admin-nav-item" onClick={handleLogout}>
            <span>⏻</span> Sign Out
          </button>
        </div>
        <div style={{ padding: '1rem 1.75rem', fontSize: '0.7rem', color: 'var(--muted)', borderTop: '1px solid var(--border)' }}>
          {user?.email}
        </div>
      </div>

      {/* Main content */}
      <div className="admin-main">
        {/* Dashboard */}
        {view === 'dashboard' && !selectedTeam && (
          <div>
            <div className="admin-page-title">Dashboard</div>
            <div className="admin-page-sub">Welcome back — manage your club content below.</div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { label: 'Teams',       value: sorted.length },
                { label: 'Total Players', value: sorted.reduce((s, t) => s + (t.roster?.length || 0), 0) },
                { label: 'Tournaments', value: sorted.reduce((s, t) => s + (t.tournaments?.length || 0), 0) },
              ].map(s => (
                <div key={s.label} className="admin-card" style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '3rem', color: 'var(--pink)', lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.3rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div className="admin-card">
              <div className="admin-card-title">Quick Access — Teams</div>
              {loading ? <div className="admin-empty">Loading…</div> : (
                <div className="admin-grid">
                  {sorted.map(t => (
                    <button key={t.id} className="admin-team-btn"
                            onClick={() => { setSelectedTeamId(t.id); setView('teams'); }}>
                      <div className="tnum">{t.name.split(' ')[0]}</div>
                      <div className="tname">{t.name}</div>
                      <div className="tsub">{t.roster?.length || 0} players · {t.tournaments?.length || 0} events</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Teams list */}
        {view === 'teams' && !selectedTeam && (
          <div>
            <div className="admin-page-title">Teams</div>
            <div className="admin-page-sub">Select a team to manage its roster, schedule, practices, and coaches.</div>
            {loading ? <div className="admin-empty">Loading…</div> : (
              <div className="admin-grid">
                {sorted.map(t => (
                  <button key={t.id} className="admin-team-btn" onClick={() => setSelectedTeamId(t.id)}>
                    <div className="tnum">{t.name.split(' ')[0]}</div>
                    <div className="tname">{t.name}</div>
                    <div className="tsub">{t.roster?.length || 0} players · {t.tournaments?.length || 0} events</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Team editor */}
        {selectedTeam && (
          <TeamEditorPage
            team={selectedTeam}
            onBack={() => setSelectedTeamId(null)}
            toast={toast}
          />
        )}

        {/* Settings */}
        {view === 'settings' && (
          <SettingsPage teams={teams} toast={toast} />
        )}
      </div>
    </div>
  );
}
