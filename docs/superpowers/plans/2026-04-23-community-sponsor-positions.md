# Community Section, Sponsor Name, Position Filter — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a sponsor name field, a Firestore-backed community campaigns section (with slider for 2+), and a fixed-position filter with dual-position support on player profiles.

**Architecture:** Three independent features sharing the established hook + public component + admin panel pattern. `useCommunity` follows the same `onSnapshot` shape as `useAnnouncements`. Position constants are defined inline in the two files that need them (no shared file — small enough). No test framework exists; each task ends with browser verification.

**Tech Stack:** React 19, Firebase Firestore (real-time `onSnapshot`), Firebase Storage, Vite

> **Note:** No test framework in this project. Steps include manual browser verification instead of automated tests.

---

## File Map

**Create:**
- `app/src/hooks/useCommunity.js` — subscribes to `community` collection ordered by `order`
- `app/src/components/Community.jsx` — public two-column campaign section with slider
- `app/src/admin/CommunityPanel.jsx` — admin CRUD for campaigns

**Modify:**
- `app/src/hooks/useSponsors.js` — add `name: ''` to hardcoded fallback entries
- `app/src/admin/SponsorsPanel.jsx` — add `name` to `EMPTY_FORM` + Name input in form
- `app/src/components/Sponsors.jsx` — render sponsor name caption below logo
- `app/src/components/TeamDrawer.jsx` — fixed POSITIONS list, pos2 filter logic, pos2 badge
- `app/src/pages/Admin.jsx` — RosterEditor pos/pos2 selects, Community nav + view
- `app/src/pages/Home.jsx` — add `<Community />` between Sponsors and Footer
- `app/src/index.css` — sponsor name style + community section styles

---

### Task 1: Sponsor name field

**Files:**
- Modify: `app/src/hooks/useSponsors.js`
- Modify: `app/src/admin/SponsorsPanel.jsx`
- Modify: `app/src/components/Sponsors.jsx`
- Modify: `app/src/index.css`

- [ ] **Step 1: Add `name: ''` to all hardcoded sponsors in `useSponsors.js`**

In `app/src/hooks/useSponsors.js`, update `HARDCODED_TIERS` — add `name: ''` to each sponsor object:

```js
const HARDCODED_TIERS = [
  {
    tierLabel: 'Kill Level', tierAmount: '$1,000+', tierOrder: 0,
    sponsors: [
      { id: 'hc-0', name: '', logo: 'https://static.wixstatic.com/media/bece4b_c80545f3bd9a49c9ae23d08054cd55d0~mv2.png', addr: '5825 Covington Rd, Fort Wayne, IN 46804', tierLabel: 'Kill Level', tierAmount: '$1,000+', tierOrder: 0, order: 0 },
      { id: 'hc-1', name: '', logo: 'https://static.wixstatic.com/media/bece4b_fef4f5367f6645f589c4b529e66591ae~mv2.png', addr: '243 Airport North Office Park, Fort Wayne, IN 46825', tierLabel: 'Kill Level', tierAmount: '$1,000+', tierOrder: 0, order: 1 },
    ],
  },
  {
    tierLabel: 'Ace Level', tierAmount: '$500–$999', tierOrder: 1,
    sponsors: [
      { id: 'hc-2', name: '', logo: 'https://static.wixstatic.com/media/bece4b_c95f00c14b8b4d22875727781ff15a26~mv2.jpeg', addr: '6906 Ardmore Ave, Fort Wayne, IN 46809', tierLabel: 'Ace Level', tierAmount: '$500–$999', tierOrder: 1, order: 0 },
    ],
  },
  {
    tierLabel: 'Block Level', tierAmount: '$250–$499', tierOrder: 2,
    sponsors: [
      { id: 'hc-3', name: '', logo: 'https://static.wixstatic.com/media/bece4b_5527b50f43fb4558b1b1da737dfe75c0~mv2.png', addr: '7908 Carnegie Blvd, Fort Wayne, IN 46804', tierLabel: 'Block Level', tierAmount: '$250–$499', tierOrder: 2, order: 0 },
    ],
  },
];
```

- [ ] **Step 2: Add `name` to `EMPTY_FORM` and the Name input in `SponsorsPanel.jsx`**

In `app/src/admin/SponsorsPanel.jsx`, change the `EMPTY_FORM` constant:

```js
const EMPTY_FORM = { logo: '', name: '', addr: '', tierLabel: '', tierAmount: '', tierOrder: 0, order: 0 };
```

Then in the add/edit form (inside the `if (mode === 'add' || mode === 'edit')` block), add a Name field **after** the Logo `form-group` and **before** the Address `form-group`:

```jsx
            <div className="form-group">
              <label className="form-label">Name (optional)</label>
              <input className="form-input" value={form.name}
                     onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                     placeholder="Acme Corporation" />
            </div>
```

- [ ] **Step 3: Render sponsor name in `Sponsors.jsx`**

In `app/src/components/Sponsors.jsx`, replace the logo-card render:

```jsx
                {tier.sponsors.map(s => (
                  <div key={s.id} className="logo-card">
                    <img src={s.logo} alt={s.name || 'Sponsor logo'} />
                    {s.name && <div className="sponsor-name">{s.name}</div>}
                  </div>
                ))}
```

- [ ] **Step 4: Add `.sponsor-name` style to `index.css`**

Find the line `/* ANNOUNCEMENTS */` in `app/src/index.css` (around line 1331). Insert this block **immediately before** that comment:

```css
/* SPONSORS */
.sponsor-name { font-size: 0.68rem; font-weight: 600; color: var(--muted); text-align: center; margin-top: 0.4rem; letter-spacing: 0.04em; }
```

- [ ] **Step 5: Verify in browser**

Start dev server (`cd app && npm run dev`). Open `http://localhost:5173`. Scroll to Sponsors section — logos still appear. Open Admin → Sponsors → Add Sponsor — confirm Name field is present. Add a test sponsor with a name, verify the name caption renders below the logo on the public site.

- [ ] **Step 6: Commit**

```bash
git add app/src/hooks/useSponsors.js app/src/admin/SponsorsPanel.jsx app/src/components/Sponsors.jsx app/src/index.css
git commit -m "feat: add name field to sponsors"
```

---

### Task 2: Position filter refactor

**Files:**
- Modify: `app/src/components/TeamDrawer.jsx`
- Modify: `app/src/pages/Admin.jsx`

- [ ] **Step 1: Add fixed POSITIONS constant and update filter logic in `TeamDrawer.jsx`**

At the very top of `app/src/components/TeamDrawer.jsx`, after the existing constants (`MONTHS`, `DAYS`), add:

```js
const POSITIONS = ['OPP', 'S', 'MB', 'DS', 'L', 'OH'];
```

Then inside the `TeamDrawer` component body, replace the two lines that compute `positions` and `filtered`:

```js
  const positions = ['All', ...POSITIONS];
  const filtered = posFilter === 'All' ? roster : roster.filter(p => p.pos === posFilter || p.pos2 === posFilter);
```

- [ ] **Step 2: Show pos2 badge on the player card**

In the roster grid section of `TeamDrawer.jsx`, find the player card block that renders position badges. Replace:

```jsx
                    {p.pos && <div className="player-pos-badge">{p.pos}</div>}
```

with:

```jsx
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                      {p.pos && <div className="player-pos-badge">{p.pos}</div>}
                      {p.pos2 && <div className="player-pos-badge">{p.pos2}</div>}
                    </div>
```

- [ ] **Step 3: Add POSITIONS constant and update RosterEditor in `Admin.jsx`**

In `app/src/pages/Admin.jsx`, add this constant immediately before the `function RosterEditor` line:

```js
const POSITIONS = ['OPP', 'S', 'MB', 'DS', 'L', 'OH'];
```

Then update the `openAdd` call in `RosterEditor` to include `pos2`:

```js
  function openAdd() { setForm({ name: '', num: '', pos: '', pos2: '', photo: '', gradYear: '', school: '' }); setEditing('new'); }
```

- [ ] **Step 4: Replace the Position input row with pos/pos2 selects**

In `RosterEditor`, find the `form-row` that contains the Position input and the Player Photo upload. Replace the entire row (the outer `<div className="form-row">` containing Position + Photo) with two separate blocks:

```jsx
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Position 1</label>
                <select className="form-select" value={form.pos} onChange={e => setForm(f => ({ ...f, pos: e.target.value }))}>
                  <option value="">Select position…</option>
                  {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Position 2 (optional)</label>
                <select className="form-select" value={form.pos2 || ''} onChange={e => setForm(f => ({ ...f, pos2: e.target.value }))}>
                  <option value="">None</option>
                  {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
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
```

- [ ] **Step 5: Verify in browser**

Open `http://localhost:5173`. Click a team card. Switch to Roster tab. Confirm filter buttons show All, OPP, S, MB, DS, L, OH (not player-derived values). Open Admin → Teams → any team → Roster → Add Player. Confirm Position 1 and Position 2 are dropdowns. Save a player with two positions, confirm both badges appear on the public roster, and clicking either filter shows the player.

- [ ] **Step 6: Commit**

```bash
git add app/src/components/TeamDrawer.jsx app/src/pages/Admin.jsx
git commit -m "feat: fixed position filter with dual-position support (OPP/S/MB/DS/L/OH)"
```

---

### Task 3: `useCommunity` hook

**Files:**
- Create: `app/src/hooks/useCommunity.js`

- [ ] **Step 1: Create `app/src/hooks/useCommunity.js`**

```js
import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useCommunity() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'community'), orderBy('order'));
    const unsub = onSnapshot(q, snap => {
      setCampaigns(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  return { campaigns, loading };
}
```

- [ ] **Step 2: Commit**

```bash
git add app/src/hooks/useCommunity.js
git commit -m "feat: add useCommunity hook"
```

---

### Task 4: `Community.jsx` public component + CSS

**Files:**
- Create: `app/src/components/Community.jsx`
- Modify: `app/src/index.css`

- [ ] **Step 1: Create `app/src/components/Community.jsx`**

```jsx
import { useState } from 'react';
import { useReveal } from '../hooks/useReveal';
import { useCommunity } from '../hooks/useCommunity';

export default function Community() {
  const ref = useReveal();
  const { campaigns, loading } = useCommunity();
  const [activeIdx, setActiveIdx] = useState(0);

  if (!loading && campaigns.length === 0) return null;
  if (loading) return null;

  const idx = Math.min(activeIdx, campaigns.length - 1);
  const c = campaigns[idx];
  const multi = campaigns.length > 1;

  return (
    <section className="sec community-sec" ref={ref}>
      <div className="container">
        <div className="comm-grid rv">
          {/* Left column */}
          <div className="comm-left">
            <div className="sec-eye">Community</div>
            <h2 className="comm-headline">{c.headline}</h2>
            {c.description && <p className="comm-desc">{c.description}</p>}
            {c.steps?.length > 0 && (
              <ol className="comm-steps">
                {c.steps.map((step, i) => (
                  <li key={i} className="comm-step">
                    <span className="comm-step-num">{i + 1}</span>
                    <span className="comm-step-text">{step}</span>
                  </li>
                ))}
              </ol>
            )}
            {c.linkUrl && (
              <a href={c.linkUrl} target="_blank" rel="noreferrer"
                 className="btn btn-p" style={{ marginTop: '2rem', display: 'inline-flex' }}>
                {c.linkLabel || 'Learn More'} →
              </a>
            )}
          </div>

          {/* Right column */}
          <div className="comm-right">
            <div className="comm-img-card" style={{ background: c.imageBg || '#1e3a2f' }}>
              {c.imageUrl && <img src={c.imageUrl} alt={c.headline} />}
            </div>
          </div>
        </div>

        {/* Slider controls — only shown for 2+ campaigns */}
        {multi && (
          <div className="comm-controls">
            <button className="comm-arrow"
                    onClick={() => setActiveIdx(i => Math.max(0, i - 1))}
                    disabled={activeIdx === 0}>‹</button>
            <div className="comm-dots">
              {campaigns.map((_, i) => (
                <button key={i}
                        className={`comm-dot ${i === idx ? 'on' : ''}`}
                        onClick={() => setActiveIdx(i)} />
              ))}
            </div>
            <button className="comm-arrow"
                    onClick={() => setActiveIdx(i => Math.min(campaigns.length - 1, i + 1))}
                    disabled={activeIdx === campaigns.length - 1}>›</button>
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add community styles to `index.css`**

Find the line `/* RESPONSIVE */` (around line 1348 after previous tasks). Insert this block **immediately before** it:

```css
/* COMMUNITY */
.community-sec { background: var(--surface); }
.comm-grid { display: grid; grid-template-columns: 55% 1fr; gap: 4rem; align-items: center; }
.comm-headline { font-family: 'Bebas Neue', sans-serif; font-size: clamp(2.8rem, 5vw, 5rem); line-height: 1; letter-spacing: 0.02em; margin: 0.5rem 0 1.25rem; }
.comm-desc { font-size: 0.95rem; color: var(--muted); line-height: 1.7; margin-bottom: 1.75rem; max-width: 480px; }
.comm-steps { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem; }
.comm-step { display: flex; align-items: flex-start; gap: 0.875rem; background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 0.9rem 1.1rem; }
.comm-step-num { width: 24px; height: 24px; border-radius: 50%; background: var(--pink); color: #fff; font-size: 0.72rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
.comm-step-text { font-size: 0.875rem; line-height: 1.5; color: var(--fg); }
.comm-img-card { border-radius: 18px; display: flex; align-items: center; justify-content: center; padding: 3rem 2.5rem; min-height: 280px; }
.comm-img-card img { max-width: 100%; max-height: 200px; object-fit: contain; }
.comm-controls { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-top: 2.5rem; }
.comm-arrow { background: var(--card); border: 1px solid var(--border); color: var(--fg); width: 36px; height: 36px; border-radius: 50%; font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: border-color 0.2s; }
.comm-arrow:hover:not(:disabled) { border-color: var(--pink); color: var(--pink); }
.comm-arrow:disabled { opacity: 0.3; cursor: default; }
.comm-dots { display: flex; gap: 0.5rem; align-items: center; }
.comm-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--border); border: none; cursor: pointer; padding: 0; transition: background 0.2s; }
.comm-dot.on { background: var(--pink); width: 10px; height: 10px; }
@media (max-width: 768px) { .comm-grid { grid-template-columns: 1fr; gap: 2rem; } .comm-img-card { min-height: 180px; padding: 2rem 1.5rem; } }
```

- [ ] **Step 3: Commit**

```bash
git add app/src/components/Community.jsx app/src/index.css
git commit -m "feat: add Community public component with slider and styles"
```

---

### Task 5: `CommunityPanel.jsx` admin component

**Files:**
- Create: `app/src/admin/CommunityPanel.jsx`

- [ ] **Step 1: Create `app/src/admin/CommunityPanel.jsx`**

```jsx
import { useState } from 'react';
import { collection, doc, addDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useCommunity } from '../hooks/useCommunity';
import ImageUpload from './ImageUpload';

const EMPTY_FORM = {
  headline: '', description: '', steps: [''],
  imageUrl: '', imageBg: '#1e3a2f',
  linkUrl: '', linkLabel: '', order: 0,
};

export default function CommunityPanel({ toast }) {
  const { campaigns } = useCommunity();
  const [mode, setMode] = useState('list'); // 'list' | 'add' | 'edit'
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  function openAdd() {
    setForm({ ...EMPTY_FORM, order: campaigns.length });
    setEditingId(null);
    setMode('add');
  }

  function openEdit(c) {
    const { id, ...rest } = c;
    setForm({ ...EMPTY_FORM, ...rest, steps: rest.steps?.length ? rest.steps : [''] });
    setEditingId(id);
    setMode('edit');
  }

  function updateStep(i, value) {
    setForm(f => ({ ...f, steps: f.steps.map((s, idx) => idx === i ? value : s) }));
  }

  function addStep() {
    setForm(f => ({ ...f, steps: [...f.steps, ''] }));
  }

  function removeStep(i) {
    setForm(f => ({ ...f, steps: f.steps.filter((_, idx) => idx !== i) }));
  }

  async function save() {
    if (!form.headline.trim()) { toast('Headline is required', 'error'); return; }
    setSaving(true);
    try {
      const payload = { ...form, steps: form.steps.filter(s => s.trim()) };
      if (mode === 'edit' && editingId) {
        await setDoc(doc(db, 'community', editingId), payload);
      } else {
        await addDoc(collection(db, 'community'), payload);
      }
      toast('Saved ✓');
      setMode('list');
    } catch (err) {
      console.error(err);
      toast('Save failed', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this campaign?')) return;
    try {
      await deleteDoc(doc(db, 'community', id));
      toast('Deleted ✓');
    } catch {
      toast('Delete failed', 'error');
    }
  }

  async function moveUp(campaign) {
    const sorted = [...campaigns].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const idx = sorted.findIndex(c => c.id === campaign.id);
    if (idx <= 0) return;
    const other = sorted[idx - 1];
    const { id: id1, ...r1 } = campaign;
    const { id: id2, ...r2 } = other;
    await Promise.all([
      setDoc(doc(db, 'community', id1), { ...r1, order: other.order ?? 0 }),
      setDoc(doc(db, 'community', id2), { ...r2, order: campaign.order ?? 0 }),
    ]);
  }

  async function moveDown(campaign) {
    const sorted = [...campaigns].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const idx = sorted.findIndex(c => c.id === campaign.id);
    if (idx >= sorted.length - 1) return;
    const other = sorted[idx + 1];
    const { id: id1, ...r1 } = campaign;
    const { id: id2, ...r2 } = other;
    await Promise.all([
      setDoc(doc(db, 'community', id1), { ...r1, order: other.order ?? 0 }),
      setDoc(doc(db, 'community', id2), { ...r2, order: campaign.order ?? 0 }),
    ]);
  }

  /* ── Add / Edit form ── */
  if (mode === 'add' || mode === 'edit') {
    return (
      <div>
        <button className="admin-back" onClick={() => setMode('list')}>← Community</button>
        <div className="admin-page-title">{mode === 'add' ? 'New Campaign' : 'Edit Campaign'}</div>
        <div className="admin-card">
          <div className="admin-form">

            <div className="form-group">
              <label className="form-label">Headline</label>
              <input className="form-input" value={form.headline}
                     onChange={e => setForm(f => ({ ...f, headline: e.target.value }))}
                     placeholder="Support the Next Generation." />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" rows={3} value={form.description}
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="Every purchase you make can fund scholarships for our athletes — at zero extra cost to you." />
            </div>

            <div className="form-group">
              <label className="form-label">Steps</label>
              {form.steps.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--pink)', fontWeight: 700, minWidth: 20 }}>{i + 1}.</span>
                  <input className="form-input" style={{ flex: 1, marginBottom: 0 }} value={step}
                         onChange={e => updateStep(i, e.target.value)}
                         placeholder={`Step ${i + 1}`} />
                  {form.steps.length > 1 && (
                    <button type="button" className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => removeStep(i)}>✕</button>
                  )}
                </div>
              ))}
              <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm"
                      style={{ marginTop: '0.25rem' }} onClick={addStep}>+ Add Step</button>
            </div>

            <div className="form-group">
              <label className="form-label">Campaign Image / Logo</label>
              <ImageUpload value={form.imageUrl}
                           onChange={url => setForm(f => ({ ...f, imageUrl: url }))}
                           path="community/image" />
            </div>

            <div className="form-group">
              <label className="form-label">Image Card Background Color</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input type="color" value={form.imageBg}
                       onChange={e => setForm(f => ({ ...f, imageBg: e.target.value }))}
                       style={{ width: 44, height: 36, padding: 2, borderRadius: 6, border: '1px solid var(--border)', cursor: 'pointer', background: 'none' }} />
                <input className="form-input" value={form.imageBg}
                       onChange={e => setForm(f => ({ ...f, imageBg: e.target.value }))}
                       placeholder="#1e3a2f" style={{ flex: 1 }} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Link URL (optional)</label>
                <input className="form-input" value={form.linkUrl}
                       onChange={e => setForm(f => ({ ...f, linkUrl: e.target.value }))}
                       placeholder="https://kroger.com/…" />
              </div>
              <div className="form-group">
                <label className="form-label">Link Label</label>
                <input className="form-input" value={form.linkLabel}
                       onChange={e => setForm(f => ({ ...f, linkLabel: e.target.value }))}
                       placeholder="Learn More" />
              </div>
            </div>

            <div className="admin-actions">
              <button className="admin-btn admin-btn-primary" onClick={save} disabled={saving}>
                {saving ? 'Saving…' : 'Save Campaign'}
              </button>
              <button className="admin-btn admin-btn-ghost" onClick={() => setMode('list')}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── List view ── */
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <div className="admin-page-title">Community</div>
          <div className="admin-page-sub">Manage community campaigns shown on the public site. Two or more campaigns appear as a slider.</div>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openAdd}>+ New Campaign</button>
      </div>

      {campaigns.length === 0 && (
        <div className="admin-empty">No campaigns yet. Click "New Campaign" to create one.</div>
      )}

      <div className="admin-list">
        {campaigns.map(c => (
          <div key={c.id} className="admin-list-item">
            {c.imageUrl && (
              <div style={{ width: 48, height: 30, background: c.imageBg || '#333', borderRadius: 4, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={c.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 2 }} />
              </div>
            )}
            <div className="admin-list-item-info">
              <strong>{c.headline}</strong>
              <span>{c.steps?.length || 0} steps</span>
            </div>
            <div className="admin-actions">
              <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => moveUp(c)}>↑</button>
              <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => moveDown(c)}>↓</button>
              <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => openEdit(c)}>Edit</button>
              <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => remove(c.id)}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/src/admin/CommunityPanel.jsx
git commit -m "feat: add CommunityPanel admin component"
```

---

### Task 6: Wire Community into the app

**Files:**
- Modify: `app/src/pages/Admin.jsx`
- Modify: `app/src/pages/Home.jsx`

- [ ] **Step 1: Add `CommunityPanel` import to `Admin.jsx`**

In `app/src/pages/Admin.jsx`, add the import after the existing panel imports:

```jsx
import CommunityPanel from '../admin/CommunityPanel';
```

- [ ] **Step 2: Add Community to the nav items array in `Admin.jsx`**

Replace the existing `navItems` array:

```jsx
  const navItems = [
    { id: 'dashboard',     label: 'Dashboard',     icon: '⊞' },
    { id: 'teams',         label: 'Teams',          icon: '🏐' },
    { id: 'sponsors',      label: 'Sponsors',       icon: '🤝' },
    { id: 'announcements', label: 'Announcements',  icon: '📢' },
    { id: 'community',     label: 'Community',      icon: '🌱' },
    { id: 'settings',      label: 'Settings',       icon: '⚙' },
  ];
```

- [ ] **Step 3: Add Community view render in `Admin.jsx`**

In the `admin-main` div, add this line after the existing `{view === 'announcements' && ...}` line:

```jsx
        {view === 'community'     && <CommunityPanel    toast={toast} />}
```

- [ ] **Step 4: Add `Community` to `Home.jsx`**

In `app/src/pages/Home.jsx`, add the import:

```jsx
import Community from '../components/Community';
```

Then in the JSX return, add `<Community />` between `<Sponsors />` and `<Footer />`:

```jsx
      <Sponsors />
      <Community />
      <Footer />
```

- [ ] **Step 5: Update Firestore Security Rules**

The `community` collection needs a rule allowing public read and authenticated write, same as the other collections.

Go to Firebase Console → project `impact-4dd83` → Firestore Database → Rules tab. Add this match block inside the existing `match /databases/{database}/documents` block:

```
match /community/{docId} {
  allow read: if true;
  allow write: if request.auth != null;
}
```

Click **Publish**.

- [ ] **Step 6: End-to-end verify in browser**

Open `http://localhost:5173/admin`:
1. Sidebar shows Community nav item
2. Community → empty state → create a campaign with 3 steps, an image, and a background color
3. Switch to `http://localhost:5173` — Community section appears between Sponsors and Footer with the correct layout
4. Create a second campaign — slider controls (‹ dots ›) appear on the public site
5. Verify ↑↓ reorder in admin changes which campaign appears first

- [ ] **Step 7: Commit**

```bash
git add app/src/pages/Admin.jsx app/src/pages/Home.jsx
git commit -m "feat: wire Community section into admin nav and home page"
```
