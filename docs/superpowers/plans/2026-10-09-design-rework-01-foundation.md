# Design Rework — Foundation (Tokens, Fonts, Theme) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land the new design-token colour system, the Archivo/Geist Mono
fonts, and a shared theme hook + switch component (system-preference default,
localStorage persistence, no flash), without yet restyling any screen.

**Architecture:** Additive, not destructive. The new CSS variables (from
`design/tokens.css`) are appended to `app/src/index.css` *after* the existing
variable blocks, so they win the cascade for any name they share with the old
system (`--pink`, `--muted`) while every other old variable (`--bg`, `--card`,
`--border`, `--blue*`, `--svg-*`, etc.) stays defined and in use until each
component is restyled in the Public Site / Admin Portal plans. Theme state
moves out of `App.jsx` into a `useTheme` hook so `Login` and `Admin` — which
currently receive no theme prop at all — can mount a switch too, with
`App.jsx` remaining the single owner of the state (no Context needed, since
only one route renders at a time).

**No test suite exists in this project** (`package.json` only has
`dev`/`build`/`lint`/`preview`). Every task's verification step is: run
`npm run build` and `npm run lint` from `app/`, then a manual check in the dev
server. This matches `PROMPT.md`'s own acceptance method ("run the existing
lint and build before each commit... compare against screenshots").

**Tech Stack:** React 18 (Vite), plain CSS with custom properties, no
framework additions (per hard constraint).

---

### Task 1: Add the new design tokens to `index.css`

**Files:**
- Modify: `app/src/index.css:1-44` (append after line 43, before `html { scroll-behavior: smooth; }`)

- [ ] **Step 1: Read the current token blocks to confirm line numbers haven't drifted**

Run: `sed -n '1,45p' app/src/index.css`
Expected: lines 5–26 are the old `:root { --bg: ... }` block, lines 28–43 are
the old `[data-theme="light"] { ... }` block, line 45 is `html { scroll-behavior: smooth; }`.

- [ ] **Step 2: Insert the new token blocks immediately before `html { scroll-behavior: smooth; }`**

```css
/* === New design-system tokens (design/tokens.css). Additive during the
   rework: old variables above remain defined and in use by components not
   yet restyled. --pink and --muted are shared names between the two
   systems — these blocks come after the old ones, so they win the cascade
   and every component immediately picks up the new brand pink / muted
   text colour, in both themes. Everything else here is a brand-new name,
   so nothing else changes yet. === */
:root {
  --ground: #F3F5F7;
  --surface: #FFFFFF;
  --ink: #0D1117;
  --body: #3A4350;
  --muted: #56606E;
  --line: #DDE2E8;
  --line2: #B6BEC9;
  --chip: #E9ECF0;
  --inv-bg: #0D1117;
  --inv-fg: #FFFFFF;
  --pink: #E84388;
  --sky: #55AEEB;
  --on-accent: #0D1117;
  --blue-ink: #1A73C8;
  --blue-tint: #DCEEFB;
  --blue-tint-ink: #0F4F8A;
  --pink-tint: #FCE7F0;
  --pink-tint-ink: #A80F4B;
  --band-bg: #0D1117;
  --band-fg: #FFFFFF;
  --dot1: #E84388;
  --dot2: #55AEEB;
  --panel: #0D1117;
  --logo-bg: transparent;
  --danger: #A3162A;
  --danger-ink: #8A1222;
  --danger-line: #F3B6BD;
  --warn-bg: #FFF6DF;
  --warn-line: #F0C36D;
  --ok: #1F8A4C;
}

[data-theme="dark"] {
  --ground: #0B0F15;
  --surface: #151B24;
  --ink: #F2F5F8;
  --body: #C3CBD6;
  --muted: #9AA6B5;
  --line: #283140;
  --line2: #3B4657;
  --chip: #232C39;
  --inv-bg: #F2F5F8;
  --inv-fg: #0D1117;
  --blue-ink: #6DBBF0;
  --blue-tint: #15324B;
  --blue-tint-ink: #9BD2F8;
  --pink-tint: #47162C;
  --pink-tint-ink: #F9A8CB;
  --band-bg: #E84388;
  --band-fg: #0D1117;
  --dot1: #0D1117;
  --dot2: #FFFFFF;
  --panel: #151B24;
  --logo-bg: #FFFFFF;
  --danger-ink: #FF9AA5;
  --danger-line: #5A1F27;
  --warn-bg: #33290F;
  --warn-line: #7A5E16;
}
```

- [ ] **Step 3: Verify the build still succeeds**

Run: `cd app && npm run build`
Expected: build succeeds with no new errors (pre-existing chunk-size warning
is fine).

- [ ] **Step 4: Visual smoke check**

Run: `cd app && npm run dev`, open `http://localhost:5173/`.
Expected: the site still renders with its current layout. The pink accent
(nav CTA, tryouts price, etc.) and muted text may shift slightly in both
light and dark — that's expected (the two shared variable names picked up
new values) and will be fully resolved as each component is restyled later.
Nothing should be broken or unreadable.

- [ ] **Step 5: Commit**

```bash
git add app/src/index.css
git commit -m "style: add new design-token CSS variables alongside the existing palette"
```

---

### Task 2: Swap in the new fonts

**Files:**
- Modify: `app/src/index.css:1` (font `@import`), `app/src/index.css:49` (`body { font-family }`)

- [ ] **Step 1: Add the new font import next to the existing one**

Change line 1 from:
```css
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300&display=swap');
```
to:
```css
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=Geist+Mono:wght@400;500&display=swap');
```
(Keep the old import — Bebas Neue / Plus Jakarta Sans are still referenced by
every component's explicit `font-family` declarations until each one is
restyled in later plans. Removing it now would break uppercase display
headings sitewide.)

- [ ] **Step 2: Switch the base body font to Archivo**

In the `body { ... }` rule (~line 49), change:
```css
  font-family: 'Plus Jakarta Sans', sans-serif;
```
to:
```css
  font-family: 'Archivo', sans-serif;
```

- [ ] **Step 3: Verify**

Run: `cd app && npm run build && npm run lint`
Expected: both succeed.

Run: `cd app && npm run dev`, open the home page.
Expected: body copy (paragraphs, nav links, buttons) now renders in Archivo;
big uppercase headings (hero, section titles) are unchanged — they still say
`font-family: 'Bebas Neue'` explicitly and will be migrated to Archivo
per-section in the Public Site plan.

- [ ] **Step 4: Commit**

```bash
git add app/src/index.css
git commit -m "style: load Archivo/Geist Mono fonts, switch base body font to Archivo"
```

---

### Task 3: Extract theme state into a `useTheme` hook, with system-preference default and no-flash init

**Files:**
- Create: `app/src/hooks/useTheme.js`
- Modify: `app/index.html:3-8` (inline init script)
- Modify: `app/src/App.jsx:1-45`

- [ ] **Step 1: Create the hook**

```js
import { useState, useEffect } from 'react';

function getInitialTheme() {
  const stored = localStorage.getItem('theme');
  if (stored) return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  }

  return { theme, toggleTheme };
}
```

- [ ] **Step 2: Add a no-flash inline init script to `app/index.html`**

Change:
```html
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Impact Legends Volleyball Club — Fort Wayne, IN</title>
  </head>
```
to:
```html
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Impact Legends Volleyball Club — Fort Wayne, IN</title>
    <script>
      (function () {
        var stored = localStorage.getItem('theme');
        var theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', theme);
      })();
    </script>
  </head>
```
This runs before React mounts, so the correct theme attribute is present for
first paint — `useTheme`'s `useEffect` then just keeps it in sync on toggle.

- [ ] **Step 3: Update `App.jsx` to use the hook and pass theme to every route**

Replace:
```js
export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const { toasts, toast } = useToast();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home theme={theme} toggleTheme={toggleTheme} toast={toast} />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin/*" element={
          <ProtectedRoute>
            <AdminPage toast={toast} />
          </ProtectedRoute>
        } />
      </Routes>
      <Toast toasts={toasts} />
    </BrowserRouter>
  );
}
```
with:
```js
export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { toasts, toast } = useToast();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home theme={theme} toggleTheme={toggleTheme} toast={toast} />} />
        <Route path="/admin/login" element={<LoginPage theme={theme} toggleTheme={toggleTheme} />} />
        <Route path="/admin/*" element={
          <ProtectedRoute>
            <AdminPage toast={toast} theme={theme} toggleTheme={toggleTheme} />
          </ProtectedRoute>
        } />
      </Routes>
      <Toast toasts={toasts} />
    </BrowserRouter>
  );
}
```
Also update the top of the file: remove `useState` from the `react` import if
unused elsewhere in the file (`useEffect` is also no longer used directly —
check before removing), and add:
```js
import { useTheme } from './hooks/useTheme';
```

- [ ] **Step 4: Verify**

Run: `cd app && npm run build && npm run lint`
Expected: both succeed, no unused-import lint errors.

- [ ] **Step 5: Commit**

```bash
git add app/index.html app/src/App.jsx app/src/hooks/useTheme.js
git commit -m "refactor: extract theme state into useTheme hook with system-preference default and no-flash init"
```

---

### Task 4: Build the shared `ThemeSwitch` component

**Files:**
- Create: `app/src/components/ThemeSwitch.jsx`
- Modify: `app/src/index.css` (append new rules at end of file)

- [ ] **Step 1: Create the component**

```jsx
export default function ThemeSwitch({ theme, onToggle, variant = 'icon' }) {
  const isDark = theme === 'dark';
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  if (variant === 'switch') {
    return (
      <button
        type="button"
        className="theme-switch-toggle"
        role="switch"
        aria-checked={isDark}
        aria-label={label}
        onClick={onToggle}
      >
        <span className="theme-switch-toggle-thumb" />
      </button>
    );
  }

  return (
    <button type="button" className="theme-switch-icon" aria-label={label} onClick={onToggle}>
      <svg className="theme-switch-sun" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
      <svg className="theme-switch-moon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    </button>
  );
}
```

- [ ] **Step 2: Add its CSS**

Append to the end of `app/src/index.css`:
```css
/* THEME SWITCH */
.theme-switch-icon {
  width: 46px; height: 46px;
  border-radius: 50%;
  border: 1px solid var(--line2);
  background: var(--surface);
  color: var(--ink);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
  transition: border-color 0.2s, background 0.2s, color 0.2s;
}
.theme-switch-icon:hover { border-color: var(--pink); color: var(--pink); }
.theme-switch-sun, .theme-switch-moon {
  position: absolute;
  transition: transform 0.35s cubic-bezier(.2,.7,.2,1), opacity 0.35s ease;
}
[data-theme="dark"] .theme-switch-sun { opacity: 0; transform: rotate(90deg) scale(0); }
[data-theme="light"] .theme-switch-sun { opacity: 1; transform: rotate(0deg) scale(1); }
[data-theme="dark"] .theme-switch-moon { opacity: 1; transform: rotate(0deg) scale(1); }
[data-theme="light"] .theme-switch-moon { opacity: 0; transform: rotate(-90deg) scale(0); }

.theme-switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.8rem;
  color: var(--muted);
}
.theme-switch-toggle {
  width: 42px; height: 24px;
  border-radius: 100px;
  border: 1px solid var(--line2);
  background: var(--line2);
  cursor: pointer;
  position: relative;
  padding: 2px;
  flex-shrink: 0;
  transition: background 0.2s, border-color 0.2s;
}
[data-theme="dark"] .theme-switch-toggle { background: var(--pink); border-color: var(--pink); }
.theme-switch-toggle-thumb {
  display: block;
  width: 18px; height: 18px;
  border-radius: 50%;
  background: var(--surface);
  transition: transform 0.25s cubic-bezier(.2,.7,.2,1);
}
.theme-switch-toggle[aria-checked="true"] .theme-switch-toggle-thumb { transform: translateX(18px); }

@media (prefers-reduced-motion: reduce) {
  .theme-switch-sun, .theme-switch-moon, .theme-switch-toggle-thumb { transition: none; }
}
```

- [ ] **Step 3: Verify**

Run: `cd app && npm run build && npm run lint`
Expected: both succeed (component isn't used yet, so no visual change).

- [ ] **Step 4: Commit**

```bash
git add app/src/components/ThemeSwitch.jsx app/src/index.css
git commit -m "feat: add shared ThemeSwitch component (icon and switch variants)"
```

---

### Task 5: Wire `ThemeSwitch` into the public nav

**Files:**
- Modify: `app/src/components/Nav.jsx`

- [ ] **Step 1: Import the component**

Add near the top of `Nav.jsx`:
```js
import ThemeSwitch from './ThemeSwitch';
```

- [ ] **Step 2: Replace the desktop theme button**

Replace this block (the `<li>` containing `.theme-btn` and its two inline
SVGs):
```jsx
          <li>
            <button className="theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              )}
            </button>
          </li>
```
with:
```jsx
          <li>
            <ThemeSwitch theme={theme} onToggle={toggleTheme} variant="icon" />
          </li>
```

- [ ] **Step 3: Replace the mobile-menu theme button**

Replace:
```jsx
          <button onClick={toggleTheme}>{theme === 'dark' ? content.nav.themeLight : content.nav.themeDark}</button>
```
with:
```jsx
          <ThemeSwitch theme={theme} onToggle={toggleTheme} variant="icon" />
```
(The old button's text came from `content.nav.themeLight`/`themeDark` — those
two content.json strings become unused by this component; leave them in
`content.json` for now, since removing content fields is outside this plan's
scope. Flag them as dead content in the final cleanup report.)

- [ ] **Step 4: Verify**

Run: `cd app && npm run build && npm run lint`

Run: `cd app && npm run dev`, open the home page.
Expected: a round 46px button with sun/moon icon sits where the old square
button was; clicking it toggles theme and the icon cross-fades; reload
persists the choice; resize to mobile width, open the hamburger menu, confirm
the same switch appears and works there too.

- [ ] **Step 5: Commit**

```bash
git add app/src/components/Nav.jsx
git commit -m "feat: replace nav theme button with shared ThemeSwitch (icon variant)"
```

---

### Task 6: Wire `ThemeSwitch` into Login and the Admin sidebar

**Files:**
- Modify: `app/src/pages/Login.jsx`
- Modify: `app/src/pages/Admin.jsx`

- [ ] **Step 1: Add the switch to the login card**

In `Login.jsx`, change the function signature from:
```js
export default function LoginPage() {
  const { login } = useAuth();
```
to:
```js
export default function LoginPage({ theme, toggleTheme }) {
  const { login } = useAuth();
```
Add the import:
```js
import ThemeSwitch from '../components/ThemeSwitch';
```
Add a switch row right after `<div className="login-sub">...</div>` and
before the error/form block:
```jsx
        <div className="theme-switch-row" style={{ marginBottom: '1.5rem' }}>
          <span>Dark mode</span>
          <ThemeSwitch theme={theme} onToggle={toggleTheme} variant="switch" />
        </div>
```

- [ ] **Step 2: Add the switch to the admin sidebar**

In `Admin.jsx`, change the `AdminPage` signature from:
```js
export default function AdminPage({ toast }) {
```
to:
```js
export default function AdminPage({ toast, theme, toggleTheme }) {
```
Add the import:
```js
import ThemeSwitch from '../components/ThemeSwitch';
```
In the sidebar JSX, insert a switch row right before the "View Site" link
(inside `.admin-nav`, after the nav-items `.map`):
```jsx
          <div className="admin-nav-section" style={{ marginTop: '1rem' }}>Account</div>
          <div className="theme-switch-row" style={{ padding: '0.5rem 1.75rem' }}>
            <span>Dark mode</span>
            <ThemeSwitch theme={theme} onToggle={toggleTheme} variant="switch" />
          </div>
          <a className="admin-nav-item" href="/" target="_blank" rel="noreferrer">
```
(This sits right above the existing "Account" section divider that already
precedes "View Site" / "Sign Out" — keep that divider in place, just add the
switch row beneath it.)

- [ ] **Step 3: Verify**

Run: `cd app && npm run build && npm run lint`

Run: `cd app && npm run dev`:
- Open `/admin/login`: confirm the "Dark mode" switch toggles the whole
  page's theme and persists on reload.
- Log in, open `/admin`: confirm the sidebar's "Dark mode" switch is present,
  reflects the current theme (`aria-checked` matches), and toggling it
  flips the whole app (including re-opening the public site in another tab
  — same `localStorage` key).

- [ ] **Step 4: Commit**

```bash
git add app/src/pages/Login.jsx app/src/pages/Admin.jsx
git commit -m "feat: add Dark mode switch to login and admin sidebar"
```

---

### Task 7: Final foundation verification

**Files:** none (verification only)

- [ ] **Step 1: Full build + lint**

Run: `cd app && npm run build && npm run lint`
Expected: both clean.

- [ ] **Step 2: Manual cross-check against `PROMPT.md`'s dark-mode checklist**

- Default theme follows `prefers-color-scheme` on first visit (test via
  DevTools → Rendering → "Emulate CSS media feature prefers-color-scheme",
  after clearing `localStorage`).
- Toggling anywhere persists across reload.
- No flash of the wrong theme on load (hard refresh a few times in both OS
  modes).
- Nav icon switch, login switch, and admin sidebar switch all control the
  same global state.

- [ ] **Step 3: Commit (if any fixups were needed)**

```bash
git add -A
git commit -m "fix: foundation theme/token polish"
```

---

## Self-review notes

- **Spec coverage:** tokens ✅ (Task 1), fonts ✅ (Task 2), theme attribute +
  persistence + system default + no-flash ✅ (Task 3), nav round switch ✅
  (Task 5), admin/login "Dark mode" switch with `role="switch"`/`aria-checked`
  ✅ (Task 4 + 6). Per-screen visual restyling is explicitly **not** in this
  plan — it belongs to the Public Site and Admin Portal plans that follow.
- **Old variables still in use:** `--bg`, `--bg2`, `--fg`, `--border`,
  `--card`, `--blue`, `--blue-br`, `--blue-dim`, `--pink-dim`, `--pink-glow`,
  `--wm-stroke`, `--grain`, `--hero-grid`, `--svg-*` remain defined and
  referenced by every component until it's restyled. Removing them is a
  cleanup task at the end of the Admin Portal / Motion plan, once a
  repo-wide grep finds zero remaining references.
