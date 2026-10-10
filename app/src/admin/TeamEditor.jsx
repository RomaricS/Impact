import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { POSITIONS } from '../lib/teamUtils';
import ImageUpload from './ImageUpload';
import { CollectionEditor, ConfirmDelete, Field, Chip } from './ui';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const COACH_TITLES = ['Head Coach', 'Assistant Coach', 'Volunteer Coach'];

function Input({ id, value, onChange, ...rest }) {
  return <input id={id} className="ad-input" value={value ?? ''} onChange={e => onChange(e.target.value)} {...rest} />;
}
function Select({ id, value, onChange, options, placeholder }) {
  return (
    <select id={id} className="ad-input" value={value ?? ''} onChange={e => onChange(e.target.value)}>
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function RosterTab({ team, onSave }) {
  return (
    <CollectionEditor
      items={team.roster} onSave={onSave} noun="player" addLabel="Add player"
      empty={{ title: 'No players on this roster yet', sub: 'Add the first player. The public site shows them in the order they were added.' }}
      blank={() => ({ name: '', num: '', pos: '', pos2: '', photo: '', gradYear: '', school: '' })}
      normalize={f => ({ ...f, num: Number(f.num) || 0 })}
      rowOf={p => ({
        title: p.name || 'Unnamed player',
        sub: [`#${p.num || '—'}`, p.gradYear && `Class of ${p.gradYear}`, p.school].filter(Boolean).join(' · '),
        thumb: { kind: 'photo', src: p.photo },
        chips: [p.pos && <Chip key="1" tone="ink">{p.pos}</Chip>, p.pos2 && <Chip key="2">{p.pos2}</Chip>].filter(Boolean),
      })}
      renderFields={(f, set) => (
        <>
          <Field label="Player photo">
            <ImageUpload value={f.photo} onChange={url => set('photo', url)}
                         path={`players/${(f.name || 'player').replace(/\s+/g, '-').toLowerCase()}`} portrait />
          </Field>
          <Field label="Name" htmlFor="p-name"><Input id="p-name" value={f.name} onChange={v => set('name', v)} /></Field>
          <Field label="Jersey #" span={1} htmlFor="p-num"><Input id="p-num" type="number" value={f.num} onChange={v => set('num', v)} placeholder="00" /></Field>
          <Field label="Grad year" span={1} htmlFor="p-grad"><Input id="p-grad" value={f.gradYear} onChange={v => set('gradYear', v)} placeholder="e.g. 2027" /></Field>
          <Field label="Position 1" span={1} htmlFor="p-pos1"><Select id="p-pos1" value={f.pos} onChange={v => set('pos', v)} options={POSITIONS} placeholder="Select position…" /></Field>
          <Field label="Position 2" tag="optional" span={1} htmlFor="p-pos2"><Select id="p-pos2" value={f.pos2} onChange={v => set('pos2', v)} options={POSITIONS} placeholder="None" /></Field>
          <Field label="School" htmlFor="p-school"><Input id="p-school" value={f.school} onChange={v => set('school', v)} placeholder="e.g. Canterbury HS" /></Field>
        </>
      )}
    />
  );
}

function TournamentsTab({ team, onSave }) {
  return (
    <CollectionEditor
      items={team.tournaments} onSave={onSave} noun="tournament" addLabel="Add tournament"
      countNote=" · sorted by start date automatically"
      empty={{ title: 'No tournaments yet', sub: 'Add an event and it appears on the team calendar. Leave Result blank until it has been played.' }}
      blank={() => ({ name: '', date: '', endDate: '', location: '', address: '', result: '' })}
      sort={list => [...list].sort((a, b) => a.date.localeCompare(b.date))}
      rowOf={t => ({
        title: t.name || 'Untitled tournament',
        sub: [t.date + (t.endDate && t.endDate !== t.date ? ` – ${t.endDate}` : ''), t.location, t.address].filter(Boolean).join(' · '),
        chips: t.result ? [<Chip key="r" tone="pink">{t.result}</Chip>] : [],
      })}
      renderFields={(f, set) => (
        <>
          <Field label="Tournament name" htmlFor="t-name"><Input id="t-name" value={f.name} onChange={v => set('name', v)} /></Field>
          <Field label="Start date" span={1} htmlFor="t-start"><Input id="t-start" type="date" value={f.date} onChange={v => set('date', v)} /></Field>
          <Field label="End date" span={1} htmlFor="t-end"><Input id="t-end" type="date" value={f.endDate} onChange={v => set('endDate', v)} /></Field>
          <Field label="Venue / organizer" htmlFor="t-loc"><Input id="t-loc" value={f.location} onChange={v => set('location', v)} /></Field>
          <Field label="City, State" htmlFor="t-addr"><Input id="t-addr" value={f.address} onChange={v => set('address', v)} /></Field>
          <Field label="Result" hint="Blank means upcoming." htmlFor="t-res"><Input id="t-res" value={f.result} onChange={v => set('result', v)} placeholder="e.g. 1st of 24 teams" /></Field>
        </>
      )}
    />
  );
}

function PracticesTab({ team, onSave }) {
  return (
    <CollectionEditor
      items={team.practices} onSave={onSave} noun="practice" addLabel="Add practice"
      empty={{ title: 'No practices yet', sub: 'Add each recurring session for this team.' }}
      blank={() => ({ day: 'Monday', time: '', location: '', address: '', type: '' })}
      rowOf={p => ({
        title: `${p.day} · ${p.time || '—'}`,
        sub: [p.location, p.address].filter(Boolean).join(' · '),
        chips: p.type ? [<Chip key="t" tone="blue">{p.type}</Chip>] : [],
      })}
      renderFields={(f, set) => (
        <>
          <Field label="Day" span={1} htmlFor="pr-day"><Select id="pr-day" value={f.day} onChange={v => set('day', v)} options={DAYS} /></Field>
          <Field label="Time" span={1} htmlFor="pr-time"><Input id="pr-time" value={f.time} onChange={v => set('time', v)} placeholder="6:00 – 8:00 PM" /></Field>
          <Field label="Location name" htmlFor="pr-loc"><Input id="pr-loc" value={f.location} onChange={v => set('location', v)} /></Field>
          <Field label="Address" htmlFor="pr-addr"><Input id="pr-addr" value={f.address} onChange={v => set('address', v)} /></Field>
          <Field label="Session type" htmlFor="pr-type"><Input id="pr-type" value={f.type} onChange={v => set('type', v)} placeholder="e.g. Full Team, Position Training" /></Field>
        </>
      )}
    />
  );
}

function CoachesTab({ team, onSave }) {
  return (
    <CollectionEditor
      items={team.coaches} onSave={onSave} noun="coach" addLabel="Add coach"
      empty={{ title: 'No coaches yet', sub: 'Add the staff for this team.' }}
      blank={() => ({ name: '', title: 'Head Coach', bio: '', photo: '' })}
      rowOf={c => ({ title: c.name || 'Unnamed coach', sub: c.title, thumb: { kind: 'avatar', src: c.photo } })}
      renderFields={(f, set) => (
        <>
          <Field label="Coach photo" hint="Square works best">
            <ImageUpload value={f.photo} onChange={url => set('photo', url)}
                         path={`coaches/${(f.name || 'coach').replace(/\s+/g, '-').toLowerCase()}`} />
          </Field>
          <Field label="Name" htmlFor="c-name"><Input id="c-name" value={f.name} onChange={v => set('name', v)} /></Field>
          <Field label="Title" htmlFor="c-title"><Select id="c-title" value={f.title} onChange={v => set('title', v)} options={COACH_TITLES} /></Field>
          <Field label="Bio" htmlFor="c-bio">
            <textarea id="c-bio" className="ad-input ad-textarea" value={f.bio} onChange={e => set('bio', e.target.value)} />
          </Field>
        </>
      )}
    />
  );
}

function DetailsTab({ team, onSave, onDelete }) {
  const [form, setForm] = useState({
    name: team.name || '', sub: team.sub || '', division: team.division || '',
    color: team.color || 'blue', order: team.order ?? '',
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function save(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    await onSave({
      name: form.name.trim(), sub: form.sub.trim(), division: form.division.trim(),
      color: form.color, order: Number(form.order) || 0,
    });
    setSaving(false);
  }

  const isPink = form.color === 'pink';
  return (
    <div className="ad-split">
      <form className="ad-editor" onSubmit={save}>
        <div className="ad-editor-head"><h3>Team details</h3></div>
        <div className="ad-grid">
          <Field label="Team title / name" hint="Shown as the card title everywhere." htmlFor="d-name">
            <Input id="d-name" value={form.name} onChange={v => set('name', v)} placeholder="e.g. 12 Blue" />
          </Field>
          <Field label="Subtitle" htmlFor="d-sub"><Input id="d-sub" value={form.sub} onChange={v => set('sub', v)} placeholder="e.g. Ages 12 & Under" /></Field>
          <Field label="Division (pill label)" span={1} htmlFor="d-div"><Input id="d-div" value={form.division} onChange={v => set('division', v)} placeholder="e.g. Blue" /></Field>
          <Field label="Color" span={1} hint="Drives card and pill styling." htmlFor="d-color">
            <select id="d-color" className="ad-input" value={form.color} onChange={e => set('color', e.target.value)}>
              <option value="blue">Blue</option>
              <option value="pink">Pink</option>
            </select>
          </Field>
          <Field label="Sort order" span={1} hint="Lower numbers appear first." htmlFor="d-order">
            <Input id="d-order" type="number" value={form.order} onChange={v => set('order', v)} placeholder="e.g. 1" />
          </Field>
        </div>
        <div className="ad-editor-foot">
          <div />
          <button type="submit" className="ad-btn ad-btn-primary" disabled={saving || !form.name.trim()}>
            {saving ? 'Saving…' : 'Save details'}
          </button>
        </div>
        <div className="ad-danger-zone">
          <strong>Danger zone</strong>
          <p className="ad-hint">Permanently delete this team and all of its roster, schedule, practices and coaches.</p>
          <ConfirmDelete noun="team" label="Delete team…" onConfirm={onDelete} />
        </div>
      </form>

      <div className="ad-preview">
        <div className="ad-label">Live preview</div>
        <div className={`team-card ${isPink ? 'team-card-pink' : 'team-card-blue'}`} aria-hidden="true">
          <div className="team-card-top">
            <span className="team-num">{(form.name.split(' ')[0] || '').slice(0, 3)}</span>
            <span className="team-chip">{form.division}</span>
          </div>
          <div className="team-card-bottom">
            <div>
              <div className="team-name">{form.name || 'Team name'}</div>
              <div className="team-sub">{form.sub}</div>
            </div>
            <span className="team-roster-link"><span className="team-roster-text">Roster</span> <span className="team-arrow">→</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}

const TABS = ['details', 'roster', 'tournaments', 'practices', 'coaches'];

export default function TeamEditor({ team, onBack, onDelete, toast }) {
  const [tab, setTab] = useState('details');

  async function saveFields(fields) {
    try {
      await setDoc(doc(db, 'teams', team.id), fields, { merge: true });
      toast('Saved ✓');
    } catch {
      toast('Save failed', 'error');
    }
  }
  const saveField = field => value => saveFields({ [field]: value });

  const counts = {
    roster: team.roster?.length || 0,
    tournaments: team.tournaments?.length || 0,
    practices: team.practices?.length || 0,
    coaches: team.coaches?.length || 0,
  };
  const idx = TABS.indexOf(tab);

  return (
    <div className="ad-screen">
      <button type="button" className="ad-back" onClick={onBack}>← All teams</button>
      <div className="ad-page-head">
        <div className="ad-team-head">
          <h1 className="ad-title">{team.name}</h1>
          <Chip tone={team.color === 'pink' ? 'pink' : 'blue'}>{team.division}</Chip>
          <span className="ad-sub">{team.sub}</span>
        </div>
        <a className="ad-btn ad-btn-outline" href={`/teams/${team.id}`} target="_blank" rel="noreferrer">View team page ↗</a>
      </div>

      <div className="ad-tabs" role="tablist" style={{ '--tab-i': idx }}>
        {TABS.map(t => (
          <button key={t} type="button" role="tab" aria-selected={tab === t}
                  className={`ad-tab ${tab === t ? 'on' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {counts[t] !== undefined && <span className="ad-tab-count">{counts[t]}</span>}
          </button>
        ))}
        <span className="ad-tab-ind" aria-hidden="true" />
      </div>

      <div className="ad-fade" key={`${team.id}-${tab}`}>
        {tab === 'details'     && <DetailsTab team={team} onSave={saveFields} onDelete={onDelete} />}
        {tab === 'roster'      && <RosterTab team={team} onSave={saveField('roster')} />}
        {tab === 'tournaments' && <TournamentsTab team={team} onSave={saveField('tournaments')} />}
        {tab === 'practices'   && <PracticesTab team={team} onSave={saveField('practices')} />}
        {tab === 'coaches'     && <CoachesTab team={team} onSave={saveField('coaches')} />}
      </div>
    </div>
  );
}
