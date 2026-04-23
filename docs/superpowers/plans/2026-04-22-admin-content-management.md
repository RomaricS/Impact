# Admin Content Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three admin-managed features — editable registration link, full sponsor CRUD, and an announcements timeline — all backed by Firestore and surfaced on the public home page.

**Architecture:** Each feature gets a dedicated Firestore hook (`useSettings`, `useSponsors`, `useAnnouncements`) consumed by public components. Admin UI is split into `SponsorsPanel.jsx` and `AnnouncementsPanel.jsx`, imported into the existing `Admin.jsx`. `ImageUpload` is extracted from `Admin.jsx` into a shared file so the new panels can reuse it.

**Tech Stack:** React 19, Firebase Firestore (real-time `onSnapshot`), Firebase Storage (image uploads), Vite 8

> **Note:** No test framework is configured in this project. Steps include manual browser verification instead of automated test commands.

---

## File Map

**Create:**
- `app/src/admin/ImageUpload.jsx` — extracted shared upload widget
- `app/src/hooks/useSettings.js` — subscribes to `settings/main` Firestore doc
- `app/src/hooks/useSponsors.js` — subscribes to `sponsors` collection, groups by tier
- `app/src/hooks/useAnnouncements.js` — subscribes to `announcements` collection
- `app/src/components/Announcements.jsx` — public-facing timeline feed section
- `app/src/admin/SponsorsPanel.jsx` — admin sponsors CRUD panel
- `app/src/admin/AnnouncementsPanel.jsx` — admin announcements CRUD panel

**Modify:**
- `app/src/pages/Admin.jsx` — remove inline ImageUpload, add imports, add nav items + views, add reg link card to SettingsPage
- `app/src/components/Sponsors.jsx` — replace hardcoded `TIERS` with `useSponsors()`
- `app/src/components/Tryouts.jsx` — replace hardcoded href with `useSettings()`
- `app/src/pages/Home.jsx` — add `<Announcements />` between VideoBanner and Teams
- `app/src/index.css` — add Announcements section styles

---

### Task 1: Extract `ImageUpload` to a shared file

**Files:**
- Create: `app/src/admin/ImageUpload.jsx`
- Modify: `app/src/pages/Admin.jsx`

- [ ] **Step 1: Create `app/src/admin/ImageUpload.jsx`**

```jsx
import { useState, useRef } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

export default function ImageUpload({ value, onChange, path, portrait = false }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const storageRef = ref(storage, `${path}-${Date.now()}.${ext}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      onChange(url);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  }

  const cls = portrait ? 'portrait' : '';

  return (
    <div className="img-upload-wrap">
      {value
        ? <img src={value} className={`img-upload-preview ${cls}`} alt="preview" />
        : <div className={`img-upload-placeholder ${cls}`}>📷</div>
      }
      <div className="img-upload-row">
        <input ref={inputRef} type="file" accept="image/*" className="img-upload-input" onChange={handleFile} />
        <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm"
                onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? '' : '↑ Upload'}
        </button>
        {uploading && <span className="img-uploading">Uploading…</span>}
        {value && !uploading && (
          <button type="button" className="admin-btn admin-btn-danger admin-btn-sm"
                  onClick={() => onChange('')}>✕</button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: In `app/src/pages/Admin.jsx`, replace the inline `ImageUpload` function (lines 11–54) with an import**

Remove the entire inline `ImageUpload` function definition and add this import after the existing imports at the top:

```jsx
import ImageUpload from '../admin/ImageUpload';
```

- [ ] **Step 3: Verify the admin still works**

```bash
cd app && npm run dev
```

Open `http://localhost:5173/admin`, log in, open any team, confirm player/coach photo uploads still work.

- [ ] **Step 4: Commit**

```bash
git add app/src/admin/ImageUpload.jsx app/src/pages/Admin.jsx
git commit -m "refactor: extract ImageUpload to shared admin component"
```

---

### Task 2: `useSettings` hook

**Files:**
- Create: `app/src/hooks/useSettings.js`

- [ ] **Step 1: Create `app/src/hooks/useSettings.js`**

```js
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

const DEFAULT_LINK = 'https://forms.gle/zmnEhvmebK5z3JJw9';

export function useSettings() {
  const [settings, setSettings] = useState({ registrationLink: DEFAULT_LINK });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'main'), snap => {
      if (snap.exists() && snap.data().registrationLink) {
        setSettings({ registrationLink: snap.data().registrationLink });
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return { settings, loading };
}
```

- [ ] **Step 2: Commit**

```bash
git add app/src/hooks/useSettings.js
git commit -m "feat: add useSettings hook"
```

---

### Task 3: `useSponsors` hook

**Files:**
- Create: `app/src/hooks/useSponsors.js`

- [ ] **Step 1: Create `app/src/hooks/useSponsors.js`**

```js
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

const HARDCODED_TIERS = [
  {
    tierLabel: 'Kill Level', tierAmount: '$1,000+', tierOrder: 0,
    sponsors: [
      { id: 'hc-0', logo: 'https://static.wixstatic.com/media/bece4b_c80545f3bd9a49c9ae23d08054cd55d0~mv2.png', addr: '5825 Covington Rd, Fort Wayne, IN 46804', tierLabel: 'Kill Level', tierAmount: '$1,000+', tierOrder: 0, order: 0 },
      { id: 'hc-1', logo: 'https://static.wixstatic.com/media/bece4b_fef4f5367f6645f589c4b529e66591ae~mv2.png', addr: '243 Airport North Office Park, Fort Wayne, IN 46825', tierLabel: 'Kill Level', tierAmount: '$1,000+', tierOrder: 0, order: 1 },
    ],
  },
  {
    tierLabel: 'Ace Level', tierAmount: '$500–$999', tierOrder: 1,
    sponsors: [
      { id: 'hc-2', logo: 'https://static.wixstatic.com/media/bece4b_c95f00c14b8b4d22875727781ff15a26~mv2.jpeg', addr: '6906 Ardmore Ave, Fort Wayne, IN 46809', tierLabel: 'Ace Level', tierAmount: '$500–$999', tierOrder: 1, order: 0 },
    ],
  },
  {
    tierLabel: 'Block Level', tierAmount: '$250–$499', tierOrder: 2,
    sponsors: [
      { id: 'hc-3', logo: 'https://static.wixstatic.com/media/bece4b_5527b50f43fb4558b1b1da737dfe75c0~mv2.png', addr: '7908 Carnegie Blvd, Fort Wayne, IN 46804', tierLabel: 'Block Level', tierAmount: '$250–$499', tierOrder: 2, order: 0 },
    ],
  },
];

export function useSponsors() {
  const [tiers, setTiers] = useState(HARDCODED_TIERS);
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'sponsors'), orderBy('tierOrder'));
    const unsub = onSnapshot(q, snap => {
      if (!snap.empty) {
        const flat = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setSponsors(flat);
        const grouped = new Map();
        for (const s of flat) {
          if (!grouped.has(s.tierLabel)) {
            grouped.set(s.tierLabel, {
              tierLabel: s.tierLabel,
              tierAmount: s.tierAmount,
              tierOrder: s.tierOrder ?? 0,
              sponsors: [],
            });
          }
          grouped.get(s.tierLabel).sponsors.push(s);
        }
        const sorted = [...grouped.values()].sort((a, b) => a.tierOrder - b.tierOrder);
        sorted.forEach(t => t.sponsors.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
        setTiers(sorted);
      } else {
        setTiers(HARDCODED_TIERS);
        setSponsors([]);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return { tiers, sponsors, loading };
}
```

- [ ] **Step 2: Commit**

```bash
git add app/src/hooks/useSponsors.js
git commit -m "feat: add useSponsors hook with Firestore subscription and hardcoded fallback"
```

---

### Task 4: `useAnnouncements` hook

**Files:**
- Create: `app/src/hooks/useAnnouncements.js`

- [ ] **Step 1: Create `app/src/hooks/useAnnouncements.js`**

```js
import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useAnnouncements(max = 10) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'announcements'),
      orderBy('createdAt', 'desc'),
      limit(max)
    );
    const unsub = onSnapshot(q, snap => {
      setAnnouncements(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [max]);

  return { announcements, loading };
}
```

- [ ] **Step 2: Commit**

```bash
git add app/src/hooks/useAnnouncements.js
git commit -m "feat: add useAnnouncements hook"
```

---

### Task 5: Update `Tryouts.jsx` to use dynamic registration link

**Files:**
- Modify: `app/src/components/Tryouts.jsx`

- [ ] **Step 1: Replace the full contents of `app/src/components/Tryouts.jsx`**

```jsx
import { useReveal } from '../hooks/useReveal';
import { useSettings } from '../hooks/useSettings';
import { logEvent } from '../lib/firebase';

export default function Tryouts() {
  const ref = useReveal();
  const { settings } = useSettings();

  return (
    <section className="tryouts-sec sec" id="tryouts" ref={ref}>
      <div className="container">
        <div className="tryouts-grid">
          <div className="rv">
            <div className="sec-eye">Join the Club</div>
            <h2 className="sec-title">Tryouts<br /><span style={{ color: 'var(--pink)' }}>2026–27</span></h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1rem' }}>
              Open to players 12–18. Register online before arriving. Spots are limited — don't miss your chance to wear the jersey.
            </p>
            <div className="tryout-price">
              <span className="price-num">$40</span>
              <span className="price-lbl">tryout fee · payable at event or via Venmo/PayPal</span>
            </div>
            <a href={settings.registrationLink} target="_blank" rel="noreferrer"
               className="btn btn-p" style={{ marginTop: '2rem', display: 'inline-flex' }}
               onClick={() => logEvent('tryout_register_click')}>
              Register Now →
            </a>
          </div>

          <div className="rv" style={{ animationDelay: '0.15s' }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.9rem' }}>
              Locations
            </p>
            <div className="loc-list">
              {[
                { name: 'Saint Aloysius School', addr: '14623 Bluffton Road, Yoder, IN 46798' },
              ].map(l => (
                <div key={l.name} className="loc-card">
                  <div className="loc-name">{l.name}</div>
                  <div className="loc-addr">{l.addr}</div>
                </div>
              ))}
              <div className="loc-note">If smaller group, tryout times may be shorter.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify in browser** — "Register Now" still opens the forms.gle URL (fallback active since Firestore has nothing yet).

- [ ] **Step 3: Commit**

```bash
git add app/src/components/Tryouts.jsx
git commit -m "feat: make tryout registration link dynamic via useSettings"
```

---

### Task 6: Update `Sponsors.jsx` to read from Firestore

**Files:**
- Modify: `app/src/components/Sponsors.jsx`

- [ ] **Step 1: Replace the full contents of `app/src/components/Sponsors.jsx`**

```jsx
import { useReveal } from '../hooks/useReveal';
import { useSponsors } from '../hooks/useSponsors';

const TIER_CLASSES = ['t-kill', 't-ace', 't-block'];

export default function Sponsors() {
  const ref = useReveal();
  const { tiers } = useSponsors();

  return (
    <section className="sec sponsors-sec" id="sponsors" ref={ref}>
      <div className="container">
        <div className="rv">
          <div className="sec-eye">2026 Partners</div>
          <h2 className="sec-title">Our<br />Sponsors</h2>
          <p className="sec-sub">These businesses make our club possible. Please support them.</p>
        </div>

        <div className="tier-row">
          {tiers.map((tier, i) => (
            <div key={tier.tierLabel} className="rv">
              <div className="tier-hdr">
                <span className={`tier-pill ${TIER_CLASSES[i] || 't-block'}`}>{tier.tierLabel}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{tier.tierAmount}</span>
                <div className="tier-line" />
              </div>
              <div className="logo-row">
                {tier.sponsors.map(s => (
                  <div key={s.id} className="logo-card">
                    <img src={s.logo} alt="Sponsor logo" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="become-sponsor rv">
          <div>
            <h3>Become a Sponsor</h3>
            <p>Support youth athletics in Fort Wayne and get your brand in front of our community.</p>
          </div>
          <a href="mailto:info@impactvbcfw.com" className="btn btn-p">Contact Us</a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify in browser** — sponsors section still shows the hardcoded sponsors (Firestore empty → fallback used).

- [ ] **Step 3: Commit**

```bash
git add app/src/components/Sponsors.jsx
git commit -m "feat: make sponsors section read from Firestore with hardcoded fallback"
```

---

### Task 7: `Announcements.jsx` public component + CSS

**Files:**
- Create: `app/src/components/Announcements.jsx`
- Modify: `app/src/index.css`

- [ ] **Step 1: Create `app/src/components/Announcements.jsx`**

```jsx
import { useReveal } from '../hooks/useReveal';
import { useAnnouncements } from '../hooks/useAnnouncements';

const TAG_EMOJI = { Signing: '🎓', Tournament: '🏆', Announcement: '📋', Award: '🏅' };

export default function Announcements() {
  const ref = useReveal();
  const { announcements, loading } = useAnnouncements(10);

  if (!loading && announcements.length === 0) return null;

  return (
    <section className="sec announcements-sec" id="news" ref={ref}>
      <div className="container">
        <div className="rv">
          <div className="sec-eye">Club News</div>
          <h2 className="sec-title">Latest <span style={{ color: 'var(--pink)' }}>Updates</span></h2>
          <p className="sec-sub">News, achievements, and announcements from the club.</p>
        </div>

        {loading ? (
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Loading…</p>
        ) : (
          <div className="ann-feed rv">
            {announcements.map(post => (
              <div key={post.id} className="ann-item">
                <div className="ann-dot">{TAG_EMOJI[post.tag] || '📢'}</div>
                <div className="ann-card">
                  {post.photoUrl && <img src={post.photoUrl} alt="" className="ann-photo" />}
                  <div className="ann-body">
                    <h3 className="ann-title">{post.title}</h3>
                    <p className="ann-text">{post.body}</p>
                    <div className="ann-meta">
                      <span className="ann-date">{post.date}</span>
                      <span className="ann-tag">{post.tag}</span>
                    </div>
                    {post.linkUrl && (
                      <a href={post.linkUrl} target="_blank" rel="noreferrer" className="ann-link">
                        {post.linkLabel || 'Read more'} →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add CSS to `app/src/index.css` — insert before the `/* RESPONSIVE */` comment**

```css
/* ANNOUNCEMENTS */
.ann-feed { display: flex; flex-direction: column; position: relative; max-width: 680px; }
.ann-feed::before { content: ''; position: absolute; left: 15px; top: 8px; bottom: 8px; width: 1px; background: var(--border); }
.ann-item { display: grid; grid-template-columns: 32px 1fr; gap: 1.25rem; align-items: start; padding-bottom: 1.5rem; }
.ann-dot { width: 32px; height: 32px; border-radius: 50%; background: var(--card); border: 2px solid var(--pink); display: flex; align-items: center; justify-content: center; font-size: 0.85rem; flex-shrink: 0; margin-top: 2px; position: relative; z-index: 1; }
.ann-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; transition: border-color 0.2s; }
.ann-card:hover { border-color: rgba(255,31,109,0.2); }
.ann-photo { width: 100%; height: 180px; object-fit: cover; }
.ann-body { padding: 1.1rem 1.25rem; }
.ann-title { font-weight: 700; font-size: 0.97rem; line-height: 1.35; margin-bottom: 0.4rem; }
.ann-text { font-size: 0.83rem; color: var(--muted); line-height: 1.65; margin-bottom: 0.65rem; }
.ann-meta { display: flex; align-items: center; gap: 0.6rem; }
.ann-date { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--pink); }
.ann-tag { font-size: 0.6rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; background: rgba(255,31,109,0.1); color: var(--pink); padding: 0.15rem 0.5rem; border-radius: 100px; }
.ann-link { display: inline-block; font-size: 0.78rem; font-weight: 600; color: var(--pink); text-decoration: none; margin-top: 0.65rem; }
.ann-link:hover { text-decoration: underline; }
```

- [ ] **Step 3: Commit**

```bash
git add app/src/components/Announcements.jsx app/src/index.css
git commit -m "feat: add public Announcements timeline feed component and styles"
```

---

### Task 8: Wire `Announcements` into `Home.jsx`

**Files:**
- Modify: `app/src/pages/Home.jsx`

- [ ] **Step 1: Replace the full contents of `app/src/pages/Home.jsx`**

```jsx
import Nav from '../components/Nav';
import Hero from '../components/Hero';
import VideoBanner from '../components/VideoBanner';
import Announcements from '../components/Announcements';
import Teams from '../components/Teams';
import Tryouts from '../components/Tryouts';
import Programs from '../components/Programs';
import Fees from '../components/Fees';
import Sponsors from '../components/Sponsors';
import Footer from '../components/Footer';
import { useTeams } from '../hooks/useTeams';

export default function Home({ theme, toggleTheme }) {
  const { teams, loading } = useTeams();

  return (
    <>
      <Nav theme={theme} toggleTheme={toggleTheme} />
      <Hero />
      <VideoBanner />
      <Announcements />
      <Teams teams={teams} loading={loading} />
      <Tryouts />
      <Programs />
      <Fees />
      <Sponsors />
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Verify in browser** — home page loads, Announcements section is invisible (returns `null` with no posts — correct).

- [ ] **Step 3: Commit**

```bash
git add app/src/pages/Home.jsx
git commit -m "feat: add Announcements section to home page"
```

---

### Task 9: Admin — registration link in Settings

**Files:**
- Modify: `app/src/pages/Admin.jsx`

- [ ] **Step 1: Update imports at the top of `Admin.jsx`**

Replace the existing first two import lines with:

```jsx
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTeams } from '../hooks/useTeams';
import { usePayments } from '../hooks/usePayments';
import { useSettings } from '../hooks/useSettings';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db, storage } from '../lib/firebase';
import ImageUpload from '../admin/ImageUpload';
```

- [ ] **Step 2: Add registration link state to `SettingsPage`**

At the top of the `SettingsPage` function body, after the existing `const [savingQr, setSavingQr] = useState(false);` line, add:

```jsx
  const { settings } = useSettings();
  const [regLink, setRegLink] = useState('');
  const [savingReg, setSavingReg] = useState(false);
  useEffect(() => { setRegLink(settings.registrationLink); }, [settings.registrationLink]);

  async function saveRegLink() {
    setSavingReg(true);
    try {
      await setDoc(doc(db, 'settings', 'main'), { registrationLink: regLink }, { merge: true });
      toast('Registration link saved ✓');
    } catch {
      toast('Save failed', 'error');
    } finally {
      setSavingReg(false);
    }
  }
```

- [ ] **Step 3: Add the registration link card as the first card inside `SettingsPage`'s returned `<div>`**

Insert this block immediately after `<div className="admin-page-sub">Site configuration and data management.</div>`:

```jsx
      <div className="admin-card">
        <div className="admin-card-title">Tryout Registration Link</div>
        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1.25rem', lineHeight: 1.7 }}>
          The URL the "Register Now" button in the Tryouts section points to.
        </p>
        <div className="admin-form">
          <div className="form-group">
            <label className="form-label">Registration URL</label>
            <input className="form-input" value={regLink}
                   onChange={e => setRegLink(e.target.value)}
                   placeholder="https://forms.gle/…" />
          </div>
          <div className="admin-actions">
            <button className="admin-btn admin-btn-primary" onClick={saveRegLink} disabled={savingReg}>
              {savingReg ? 'Saving…' : 'Save Link'}
            </button>
          </div>
        </div>
      </div>
```

- [ ] **Step 4: Verify** — Admin → Settings shows "Tryout Registration Link" card. Edit the URL, save, confirm "Register Now" on the public site uses the new URL.

- [ ] **Step 5: Commit**

```bash
git add app/src/pages/Admin.jsx
git commit -m "feat: add registration link editor to admin Settings"
```

---

### Task 10: Create `SponsorsPanel.jsx`

**Files:**
- Create: `app/src/admin/SponsorsPanel.jsx`

- [ ] **Step 1: Create `app/src/admin/SponsorsPanel.jsx`**

```jsx
import { useState } from 'react';
import { collection, doc, addDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useSponsors } from '../hooks/useSponsors';
import ImageUpload from './ImageUpload';

const TIER_CLASSES = ['t-kill', 't-ace', 't-block'];
const EMPTY_FORM = { logo: '', addr: '', tierLabel: '', tierAmount: '', tierOrder: 0, order: 0 };

export default function SponsorsPanel({ toast }) {
  const { tiers, sponsors } = useSponsors();
  const [mode, setMode] = useState('list'); // 'list' | 'add' | 'edit' | 'editTier'
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [editingTierLabel, setEditingTierLabel] = useState(null);
  const [tierForm, setTierForm] = useState({ label: '', amount: '', tierOrder: 0 });
  const [useNewTier, setUseNewTier] = useState(false);

  function openAdd(tier) {
    const maxOrder = sponsors
      .filter(s => s.tierLabel === tier.tierLabel)
      .reduce((m, s) => Math.max(m, s.order ?? 0), -1);
    setForm({ logo: '', addr: '', tierLabel: tier.tierLabel, tierAmount: tier.tierAmount, tierOrder: tier.tierOrder, order: maxOrder + 1 });
    setUseNewTier(false);
    setTierForm({ label: '', amount: '', tierOrder: tiers.length });
    setEditingId(null);
    setMode('add');
  }

  function openEdit(s) {
    const { id, ...rest } = s;
    setForm(rest);
    setEditingId(id);
    setUseNewTier(false);
    setMode('edit');
  }

  function openEditTier(tier) {
    setTierForm({ label: tier.tierLabel, amount: tier.tierAmount, tierOrder: tier.tierOrder });
    setEditingTierLabel(tier.tierLabel);
    setMode('editTier');
  }

  async function saveSponsor() {
    const data = useNewTier
      ? { ...form, tierLabel: tierForm.label, tierAmount: tierForm.amount, tierOrder: tierForm.tierOrder }
      : form;
    if (!data.logo) { toast('Please upload a logo', 'error'); return; }
    if (!data.tierLabel) { toast('Please select or create a tier', 'error'); return; }
    try {
      if (mode === 'edit' && editingId) {
        await setDoc(doc(db, 'sponsors', editingId), data);
      } else {
        await addDoc(collection(db, 'sponsors'), data);
      }
      toast('Saved ✓');
      setMode('list');
    } catch (err) {
      console.error(err);
      toast('Save failed', 'error');
    }
  }

  async function deleteSponsor(id) {
    if (!window.confirm('Delete this sponsor?')) return;
    try {
      await deleteDoc(doc(db, 'sponsors', id));
      toast('Deleted ✓');
    } catch {
      toast('Delete failed', 'error');
    }
  }

  async function saveEditTier() {
    const affected = sponsors.filter(s => s.tierLabel === editingTierLabel);
    try {
      await Promise.all(affected.map(s => {
        const { id, ...rest } = s;
        return setDoc(doc(db, 'sponsors', id), {
          ...rest,
          tierLabel: tierForm.label,
          tierAmount: tierForm.amount,
          tierOrder: tierForm.tierOrder,
        });
      }));
      toast('Tier updated ✓');
      setMode('list');
    } catch {
      toast('Update failed', 'error');
    }
  }

  async function moveUp(sponsor) {
    const sorted = sponsors
      .filter(s => s.tierLabel === sponsor.tierLabel)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const idx = sorted.findIndex(s => s.id === sponsor.id);
    if (idx <= 0) return;
    const other = sorted[idx - 1];
    const { id: id1, ...r1 } = sponsor;
    const { id: id2, ...r2 } = other;
    await Promise.all([
      setDoc(doc(db, 'sponsors', id1), { ...r1, order: other.order ?? 0 }),
      setDoc(doc(db, 'sponsors', id2), { ...r2, order: sponsor.order ?? 0 }),
    ]);
  }

  async function moveDown(sponsor) {
    const sorted = sponsors
      .filter(s => s.tierLabel === sponsor.tierLabel)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const idx = sorted.findIndex(s => s.id === sponsor.id);
    if (idx >= sorted.length - 1) return;
    const other = sorted[idx + 1];
    const { id: id1, ...r1 } = sponsor;
    const { id: id2, ...r2 } = other;
    await Promise.all([
      setDoc(doc(db, 'sponsors', id1), { ...r1, order: other.order ?? 0 }),
      setDoc(doc(db, 'sponsors', id2), { ...r2, order: sponsor.order ?? 0 }),
    ]);
  }

  /* ── Add / Edit sponsor form ── */
  if (mode === 'add' || mode === 'edit') {
    return (
      <div>
        <button className="admin-back" onClick={() => setMode('list')}>← Sponsors</button>
        <div className="admin-page-title">{mode === 'add' ? 'Add Sponsor' : 'Edit Sponsor'}</div>
        <div className="admin-card">
          <div className="admin-form">
            <div className="form-group">
              <label className="form-label">Logo</label>
              <ImageUpload value={form.logo} onChange={url => setForm(f => ({ ...f, logo: url }))} path="sponsors/logo" />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input className="form-input" value={form.addr}
                     onChange={e => setForm(f => ({ ...f, addr: e.target.value }))}
                     placeholder="123 Main St, Fort Wayne, IN" />
            </div>
            <div className="form-group">
              <label className="form-label">Tier</label>
              <select className="form-select"
                      value={useNewTier ? '__new__' : form.tierLabel}
                      onChange={e => {
                        if (e.target.value === '__new__') {
                          setUseNewTier(true);
                          setTierForm({ label: '', amount: '', tierOrder: tiers.length });
                        } else {
                          const t = tiers.find(t => t.tierLabel === e.target.value);
                          setUseNewTier(false);
                          setForm(f => ({ ...f, tierLabel: e.target.value, tierAmount: t?.tierAmount || '', tierOrder: t?.tierOrder ?? 0 }));
                        }
                      }}>
                <option value="">Select tier…</option>
                {tiers.map(t => <option key={t.tierLabel} value={t.tierLabel}>{t.tierLabel} ({t.tierAmount})</option>)}
                <option value="__new__">+ New tier…</option>
              </select>
            </div>
            {useNewTier && (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Tier Name</label>
                  <input className="form-input" value={tierForm.label}
                         onChange={e => setTierForm(f => ({ ...f, label: e.target.value }))}
                         placeholder="Diamond Level" />
                </div>
                <div className="form-group">
                  <label className="form-label">Amount Label</label>
                  <input className="form-input" value={tierForm.amount}
                         onChange={e => setTierForm(f => ({ ...f, amount: e.target.value }))}
                         placeholder="$2,000+" />
                </div>
              </div>
            )}
            <div className="admin-actions">
              <button className="admin-btn admin-btn-primary" onClick={saveSponsor}>Save Sponsor</button>
              <button className="admin-btn admin-btn-ghost" onClick={() => setMode('list')}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Edit tier form ── */
  if (mode === 'editTier') {
    return (
      <div>
        <button className="admin-back" onClick={() => setMode('list')}>← Sponsors</button>
        <div className="admin-page-title">Edit Tier</div>
        <div className="admin-card">
          <div className="admin-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Tier Name</label>
                <input className="form-input" value={tierForm.label}
                       onChange={e => setTierForm(f => ({ ...f, label: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Amount Label</label>
                <input className="form-input" value={tierForm.amount}
                       onChange={e => setTierForm(f => ({ ...f, amount: e.target.value }))}
                       placeholder="$1,000+" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Display Order (0 = first)</label>
              <input className="form-input" type="number" value={tierForm.tierOrder}
                     onChange={e => setTierForm(f => ({ ...f, tierOrder: Number(e.target.value) }))} />
            </div>
            <div className="admin-actions">
              <button className="admin-btn admin-btn-primary" onClick={saveEditTier}>Save Tier</button>
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
      <div className="admin-page-title">Sponsors</div>
      <div className="admin-page-sub">Manage sponsor tiers and logos. Changes appear immediately on the public site.</div>

      {tiers.length === 0 && (
        <div className="admin-empty">No sponsors yet. Add a sponsor to create the first tier.</div>
      )}

      {tiers.map((tier, ti) => (
        <div key={tier.tierLabel} className="admin-card" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span className={`tier-pill ${TIER_CLASSES[ti] || 't-block'}`}>{tier.tierLabel}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{tier.tierAmount}</span>
            <div style={{ flex: 1 }} />
            <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => openEditTier(tier)}>Edit Tier</button>
            <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={() => openAdd(tier)}>+ Add Sponsor</button>
          </div>
          <div className="admin-list">
            {tier.sponsors.map(s => (
              <div key={s.id} className="admin-list-item">
                {s.logo && (
                  <img src={s.logo} alt="logo"
                       style={{ width: 60, height: 32, objectFit: 'contain', background: '#fff', borderRadius: 4, padding: 2, flexShrink: 0 }} />
                )}
                <div className="admin-list-item-info">
                  <strong>{s.addr || '(no address)'}</strong>
                </div>
                <div className="admin-actions">
                  <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => moveUp(s)}>↑</button>
                  <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => moveDown(s)}>↓</button>
                  <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => openEdit(s)}>Edit</button>
                  <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => deleteSponsor(s.id)}>✕</button>
                </div>
              </div>
            ))}
            {tier.sponsors.length === 0 && (
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)', padding: '0.5rem 0' }}>No sponsors in this tier.</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/src/admin/SponsorsPanel.jsx
git commit -m "feat: add SponsorsPanel admin component"
```

---

### Task 11: Create `AnnouncementsPanel.jsx`

**Files:**
- Create: `app/src/admin/AnnouncementsPanel.jsx`

- [ ] **Step 1: Create `app/src/admin/AnnouncementsPanel.jsx`**

```jsx
import { useState } from 'react';
import { collection, doc, addDoc, setDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAnnouncements } from '../hooks/useAnnouncements';
import ImageUpload from './ImageUpload';

const TAGS = ['Announcement', 'Signing', 'Tournament', 'Award'];
const EMPTY_FORM = { title: '', body: '', tag: 'Announcement', photoUrl: '', linkUrl: '', linkLabel: '', date: '' };

function todayLabel() {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AnnouncementsPanel({ toast }) {
  const { announcements } = useAnnouncements(50);
  const [mode, setMode] = useState('list'); // 'list' | 'add' | 'edit'
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  function openAdd() {
    setForm({ ...EMPTY_FORM, date: todayLabel() });
    setEditingId(null);
    setMode('add');
  }

  function openEdit(post) {
    const { id, createdAt, ...rest } = post;
    setForm({ ...EMPTY_FORM, ...rest });
    setEditingId(id);
    setMode('edit');
  }

  async function save() {
    if (!form.title.trim()) { toast('Title is required', 'error'); return; }
    if (!form.body.trim())  { toast('Body is required', 'error'); return; }
    setSaving(true);
    try {
      const payload = { ...form, createdAt: Timestamp.now() };
      if (mode === 'edit' && editingId) {
        await setDoc(doc(db, 'announcements', editingId), payload);
      } else {
        await addDoc(collection(db, 'announcements'), payload);
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
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await deleteDoc(doc(db, 'announcements', id));
      toast('Deleted ✓');
    } catch {
      toast('Delete failed', 'error');
    }
  }

  /* ── Add / Edit form ── */
  if (mode === 'add' || mode === 'edit') {
    return (
      <div>
        <button className="admin-back" onClick={() => setMode('list')}>← Announcements</button>
        <div className="admin-page-title">{mode === 'add' ? 'New Post' : 'Edit Post'}</div>
        <div className="admin-card">
          <div className="admin-form">
            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-input" value={form.title}
                     onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                     placeholder="Emma Johnson Signs with Purdue University" />
            </div>
            <div className="form-group">
              <label className="form-label">Body</label>
              <textarea className="form-textarea" rows={4} value={form.body}
                        onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                        placeholder="We are incredibly proud of Emma and her commitment…" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Tag</label>
                <select className="form-select" value={form.tag}
                        onChange={e => setForm(f => ({ ...f, tag: e.target.value }))}>
                  {TAGS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Display Date</label>
                <input className="form-input" value={form.date}
                       onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                       placeholder="Apr 18, 2026" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Photo (optional)</label>
              <ImageUpload value={form.photoUrl}
                           onChange={url => setForm(f => ({ ...f, photoUrl: url }))}
                           path="announcements/photo" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Link URL (optional)</label>
                <input className="form-input" value={form.linkUrl}
                       onChange={e => setForm(f => ({ ...f, linkUrl: e.target.value }))}
                       placeholder="https://example.com/article" />
              </div>
              <div className="form-group">
                <label className="form-label">Link Label</label>
                <input className="form-input" value={form.linkLabel}
                       onChange={e => setForm(f => ({ ...f, linkLabel: e.target.value }))}
                       placeholder="Read more" />
              </div>
            </div>
            <div className="admin-actions">
              <button className="admin-btn admin-btn-primary" onClick={save} disabled={saving}>
                {saving ? 'Saving…' : 'Save Post'}
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
          <div className="admin-page-title">Announcements</div>
          <div className="admin-page-sub">Create news posts visible on the public site. Newest posts appear first.</div>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openAdd}>+ New Post</button>
      </div>

      {announcements.length === 0 && (
        <div className="admin-empty">No posts yet. Click "New Post" to create one.</div>
      )}

      <div className="admin-list">
        {announcements.map(post => (
          <div key={post.id} className="admin-list-item">
            <div className="admin-list-item-info">
              <strong>{post.title}</strong>
              <span>{post.date} · {post.tag}</span>
            </div>
            <div className="admin-actions">
              <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => openEdit(post)}>Edit</button>
              <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => remove(post.id)}>✕</button>
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
git add app/src/admin/AnnouncementsPanel.jsx
git commit -m "feat: add AnnouncementsPanel admin component"
```

---

### Task 12: Wire new panels into `Admin.jsx` nav and views

**Files:**
- Modify: `app/src/pages/Admin.jsx`

- [ ] **Step 1: Add imports for the two new panels in `Admin.jsx`** (after the existing imports)

```jsx
import SponsorsPanel from '../admin/SponsorsPanel';
import AnnouncementsPanel from '../admin/AnnouncementsPanel';
```

- [ ] **Step 2: Replace the `navItems` array in `AdminPage`**

```jsx
  const navItems = [
    { id: 'dashboard',     label: 'Dashboard',     icon: '⊞' },
    { id: 'teams',         label: 'Teams',          icon: '🏐' },
    { id: 'sponsors',      label: 'Sponsors',       icon: '🤝' },
    { id: 'announcements', label: 'Announcements',  icon: '📢' },
    { id: 'settings',      label: 'Settings',       icon: '⚙' },
  ];
```

- [ ] **Step 3: Add view rendering for the new panels**

In the `AdminPage` return, inside `<div className="admin-main">`, add these two lines directly after the `{view === 'settings' && <SettingsPage ... />}` line:

```jsx
        {view === 'sponsors'      && <SponsorsPanel      toast={toast} />}
        {view === 'announcements' && <AnnouncementsPanel toast={toast} />}
```

- [ ] **Step 4: Full end-to-end verification**

```bash
cd app && npm run dev
```

Open `http://localhost:5173/admin` and verify:

1. Sidebar shows: Dashboard, Teams, Sponsors, Announcements, Settings
2. **Announcements** → empty state → create a post → it appears immediately on `http://localhost:5173` in the timeline feed
3. **Sponsors** → shows hardcoded tiers → add a sponsor to Firestore → hardcoded fallback replaced by Firestore data on both admin and public site
4. **Settings** → update registration link → "Register Now" on public site uses the new URL

- [ ] **Step 5: Commit**

```bash
git add app/src/pages/Admin.jsx
git commit -m "feat: add Sponsors and Announcements to admin nav"
```
