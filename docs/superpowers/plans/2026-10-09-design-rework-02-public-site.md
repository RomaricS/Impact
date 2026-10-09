# Design Rework — Public Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle every public-facing screen (nav, hero, ticker, stats, latest
updates, teams grid, team view, tryouts, programs, fees, sponsors, community,
footer) to the new design system, in both themes, at 1440px and 390px —
without changing what data each component reads or how it reads it.

**Architecture:** One component (or tightly-coupled pair) per task, done
top-to-bottom in the page's actual order, matching `PROMPT.md`'s own
sequencing. **This plan intentionally does not transcribe the design's exact
markup/CSS into each task** — `design/html/{light,dark}/<screen>.html` and
`design/screens/{light,dark}/<screen>.png` already are that spec, verbatim,
in the repo, and `PROMPT.md` explicitly says not to paste them into the app
directly (their classes/structure are demo-only; the real components keep
their existing data bindings). Instead, every task below gives the engineer:
the exact reference files to open, the exact data contract that must survive
unchanged (pulled from the content source map), the hard constraints
`PROMPT.md` states for that section, and a concrete verification checklist.
Reading the reference files and translating them into this codebase's
existing plain-CSS/JSX pattern is the implementation work itself.

**Depends on:** the Foundation plan (already done — tokens, fonts, theme
switch). Every task here can freely use the new tokens (`--ground`,
`--surface`, `--ink`, `--body`, `--muted`, `--line`, `--line2`, `--chip`,
`--inv-bg`/`--inv-fg`, `--pink`, `--sky`, `--on-accent`, `--blue-ink`,
`--blue-tint`/`--blue-tint-ink`, `--pink-tint`/`--pink-tint-ink`, `--band-bg`/
`--band-fg`, `--dot1`/`--dot2`, `--panel`, `--logo-bg`, `--danger*`,
`--warn-bg`/`--warn-line`, `--ok`) and the Archivo/Geist Mono fonts (already
loaded). Old variables (`--bg`, `--bg2`, `--fg`, `--border`, `--card`,
`--blue`, `--blue-br`, `--blue-dim`, `--pink-dim`, `--pink-glow`,
`--wm-stroke`, `--grain`, `--hero-grid`, `--svg-*`) and the old `.theme-btn`
CSS are dead once every task in this plan is done — a repo-wide grep for them
is the last task.

**No test suite exists.** Verification = `npm run build && npm run lint`
from `app/`, plus a live visual comparison against the matching screenshot in
`design/screens/{light,dark}/<screen>.png` at 1440×900 and 390×844, in both
themes, using the dev server and a browser (Chrome DevTools MCP tools —
`resize_page`, `emulate` with `colorScheme`, `take_screenshot`/
`take_snapshot` — are available in this session).

**Tech Stack:** React 18 (Vite), plain CSS custom properties. No framework
additions.

---

### Task 1: Public shell — Nav and Footer

**Files:**
- Modify: `app/src/components/Nav.jsx`
- Modify: `app/src/components/Footer.jsx`
- Modify: `app/src/index.css` (nav/footer rule blocks — search for `/* NAV */`, `/* MOBILE NAV DROPDOWN */`, `/* FOOTER */`)

- [ ] **Step 1: Read the references**

Open `design/html/light/public-home.html` and `design/html/dark/public-home.html`
(the nav and footer markup is at the top and bottom of these files — this
project has no separate nav/footer-only screen). Open
`design/screens/light/public-home.png` and `design/screens/dark/public-home.png`
to see the rendered result. Also skim `design/html/light/public-home-phone.html`
for the collapsed mobile nav (hamburger → menu button, per
`PROMPT.md`: "Collapses to logo + switch + menu button on phones").

- [ ] **Step 2: Restyle the nav**

Per `PROMPT.md`'s "Public site" → Nav bullet: logo left, links centre, theme
switch (already wired, from the Foundation plan — don't touch `ThemeSwitch`
itself) and "Register for tryouts" CTA right. Links get an underline that
grows on hover (`.il-nav` pattern in `design/source/Main.dc.html`'s
`<style>`: `background: linear-gradient(currentColor,currentColor) 0 100%/0 2px no-repeat; transition: background-size .25s;` → `background-size: 100% 2px` on hover).

**Data contract — must not change:** `Nav` still renders from `content.json:
nav` (`logo`, `links[]`, `schedulesLabel`, `schedulesUrl`, `tryCta`) exactly
as today. It still receives `theme`/`toggleTheme` as props and renders
`<ThemeSwitch>` (already wired). `onTeamsClick`/`onTryoutsClick` props are
currently unused (pre-existing dead props, not yours to fix here — leave
them). The `scrollTo(id)` smooth-scroll behavior for in-page links stays.

- [ ] **Step 3: Restyle the footer**

Per `PROMPT.md`: logo, blurb, address, three link columns, and a quiet "Admin
sign in" link. **New requirement not in the current code:** add a link to
`/admin/login` labeled "Admin sign in" (quiet/muted styling) — check
`design/html/*/public-home.html`'s footer markup for exactly where it sits
and how it's styled; this is new, so there's no existing behavior to
preserve, just add a plain `<a href="/admin/login">`.

**Data contract — must not change:** `Footer` still renders from
`content.json: footer` (`logo`, `tagline`, `address`, `facebookUrl`,
`instagramUrl`, `columns[]`, `copyright`) exactly as today, including the
`scrollTo` behavior for in-page column links vs. `target="_blank"` for
external ones.

- [ ] **Step 4: Verify**

Run: `cd app && npm run build && npm run lint` (baseline: 5 pre-existing
errors + 1 warning in `AnnouncementsPanel.jsx`, `Nav.jsx` ×2, `TeamDrawer.jsx`,
`Admin.jsx` ×2 — don't let your changes add to that count; you may see the
same `Nav.jsx` unused-prop errors since you're editing that file, that's
fine, just don't introduce new ones).

Start `cd app && npm run dev`, open the home page. For **both themes** and
**both 1440×900 and 390×844** viewport sizes: compare the nav and footer
against `design/screens/{light,dark}/public-home.png` (and the phone
screenshot for the mobile nav). Confirm: logo renders correctly (and sits on
the white `--logo-bg` badge in dark mode, per `PROMPT.md`'s dark-mode rules —
check `design/tokens.css`'s `--logo-bg` comment), nav underline-on-hover
works, mobile hamburger still opens/closes the dropdown, "Admin sign in"
footer link navigates to `/admin/login`.

- [ ] **Step 5: Commit**

```bash
git add app/src/components/Nav.jsx app/src/components/Footer.jsx app/src/index.css
git commit -m "style: restyle public nav and footer to new design system"
```

---

### Task 2: Hero — merge with video banner, remove illustration

**Files:**
- Modify: `app/src/components/Hero.jsx`
- Delete: `app/src/components/VideoBanner.jsx`
- Modify: `app/src/pages/Home.jsx` (remove `VideoBanner` import/usage)
- Modify: `app/src/index.css` (`/* HERO */`, `/* VIDEO BANNER */` blocks — merge into one hero block)

- [ ] **Step 1: Read the references**

Open `design/html/{light,dark}/public-home.html`'s hero section and
`design/screens/{light,dark}/public-home.png`. Read `PROMPT.md`'s "Hero"
bullet closely — it's the most detailed single requirement in the spec:
eyebrow, one-line "IMPACT LEGENDS" headline ("Legends" in pink), intro
paragraph left with two buttons right, then a full-width rounded video band
with scrim/caption/pause button below it.

- [ ] **Step 2: Implement**

This section explicitly replaces **both** the old illustrated hero (SVG
player illustration + floating stat cards + orbs) **and** the separate
`VideoBanner` section lower on the page — per `PROMPT.md`: "This replaces
both the old illustrated hero and the separate 'Where Champions Are Made'
video section. Move the video's data source into the hero; do not leave a
second copy lower on the page." Delete `VideoBanner.jsx` entirely and remove
its usage from `Home.jsx`.

**Data contract — must not change:**
- Hero text still comes from `content.json: hero` (`eyebrow`, `titleLine1/2/3`,
  `subtitle`, `ctaPrimary`, `ctaSecondary`, `scroll`). Per `PROMPT.md`'s
  "Content notes": the current `hero.subtitle` says "Eight age divisions"
  which is inaccurate (the site has six teams) — since this string is
  hard-coded in `content.json` (confirmed in the content source map, not
  Firestore-derived), use the design's wording instead (check
  `design/html/*/public-home.html` for the exact replacement copy — likely
  something like "Six teams from 12U through 18U…"). Update the
  `content.json: hero.subtitle` value to match.
- **The video source stays exactly as it is today: a hard-coded local file**
  (`<video src="/assets/vid.mp4">` in the current `VideoBanner.jsx`). Per the
  content source map, there is no Firestore field for this — `PROMPT.md`
  assumed there was one, but the code confirms there isn't, and per its own
  "out of scope unless I say so" rule this plan does not invent a new
  Firebase-backed setting for it. Just move the same `<video>` tag (same
  `src`, same `autoPlay muted loop playsInline`) into the new hero markup.
  Add `object-fit: cover`, `object-position: 50% 35%` (per `PROMPT.md`: the
  current clip is portrait with action in the upper-middle), height
  `clamp(280px, 42vw, 580px)`, radius 32px, and the dark scrim + "Impact
  Legends in action" caption with a blinking pink dot + accessible pause/play
  button described in `PROMPT.md`. Implement the pause button with a `ref`
  to the `<video>` element and `video.paused ? video.play() : video.pause()`,
  toggling its own icon/`aria-label` ("Pause video" / "Play video").
- Respect `prefers-reduced-motion`: if set, don't autoplay — render the first
  frame (remove the `autoPlay` attribute conditionally, or call
  `video.pause()` on mount) and show the play button, per `PROMPT.md`.
- If the video fails to load (`onError`) or no `src` resolves, show a solid
  `--ink`-colored band with the caption still visible, so layout holds — this
  is new defensive behavior `PROMPT.md` asks for; implement it with an
  `onError` handler setting a `videoFailed` state flag that swaps the `<video>`
  for a plain `<div>`.
- Hero stat strip (`content.hero.stats`, the `6 Club Teams` / `50+ Players` /
  `2026 Season` / `FW` values) is **not** part of this task — it becomes two
  separate sections (Ticker, Stats) in Tasks 3 and 4. Remove the old
  `.ticker-wrap` block from `Hero.jsx` (it currently lives inside this
  component) — it moves out into its own component next.

- [ ] **Step 3: Verify**

`npm run build && npm run lint`. Then in the browser, both themes, both
viewport sizes: compare against the hero portion of
`design/screens/{light,dark}/public-home.png`. Confirm: no illustration, no
orbs, single hero+video block, pause button works, reduced-motion respected
(`chrome-devtools emulate` doesn't have a motion-preference toggle, but you
can test via `page.emulateMediaFeatures` through `evaluate_script` injecting
`window.matchMedia` override, or simply confirm the code path exists and
reads `window.matchMedia('(prefers-reduced-motion: reduce)').matches`
correctly). Confirm `content.json`'s `hero.subtitle` now reads the corrected
copy.

- [ ] **Step 4: Commit**

```bash
git add app/src/components/Hero.jsx app/src/pages/Home.jsx app/src/content.json app/src/index.css
git rm app/src/components/VideoBanner.jsx
git commit -m "style: merge hero and video banner, remove old illustration"
```

---

### Task 3: Ticker (decorative marquee)

**Files:**
- Create: `app/src/components/Ticker.jsx`
- Modify: `app/src/pages/Home.jsx` (add `<Ticker />` after `<Hero />`)
- Modify: `app/src/index.css` (new `/* TICKER */` block, replacing the old one removed in Task 2)

- [ ] **Step 1: Read the references**

Open `design/html/{light,dark}/public-home.html` for the ticker band
immediately below the hero, and `design/source/Main.dc.html`'s `<style>`
block for the exact marquee mechanics: `.il-track { display:flex; width:max-content; animation: il-marquee 38s linear infinite; } .il-track:hover { animation-play-state: paused; } @keyframes il-marquee { to { transform: translateX(-50%); } }`.

- [ ] **Step 2: Implement**

A new standalone component: a slightly rotated band (per `PROMPT.md`:
"slightly rotated band with scrolling uppercase words"), `aria-hidden="true"`
(decorative, per `PROMPT.md`), pauses on hover. The looping content is
duplicated once (render the word list twice back-to-back, then animate
`translateX(-50%)`, so the loop is seamless) — read the exact words shown in
`design/html/*/public-home.html`'s ticker markup (they're generic
club/brand words, not data-bound — this section has no Firestore or
`content.json` source today and `PROMPT.md` doesn't ask for one; hard-code
the word list as plain strings, matching the design file's copy).

- [ ] **Step 3: Verify**

`npm run build && npm run lint`. Browser check both themes/sizes: ticker
scrolls continuously, pauses on hover, has no accessible-tree presence
(`aria-hidden`), rotation angle matches the screenshot.

- [ ] **Step 4: Commit**

```bash
git add app/src/components/Ticker.jsx app/src/pages/Home.jsx app/src/index.css
git commit -m "feat: add decorative ticker band"
```

---

### Task 4: Stats strip (count-up on load)

**Files:**
- Create: `app/src/components/Stats.jsx`
- Modify: `app/src/pages/Home.jsx` (add `<Stats />` after `<Ticker />`)
- Modify: `app/src/index.css` (new `/* STATS */` block)

- [ ] **Step 1: Read the references**

Open `design/html/{light,dark}/public-home.html`'s stats section (right
below the ticker) and `design/screens/*/public-home.png`. Read
`Admin.dc.html`'s `componentDidMount`/count-up `requestAnimationFrame` pattern
for the easing curve to reuse: `k = 1 - Math.pow(1 - k, 3)` over ~1100ms,
skipped entirely when `prefers-reduced-motion: reduce`.

- [ ] **Step 2: Implement**

Four cells, same data as today: `content.hero.stats` (`[{num, lbl}]` — `6
Club Teams`, `50+ Players`, `2026 Season`, `FW Fort Wayne, Indiana`). Per
`PROMPT.md`: "the numeric ones count up once on load. Use the same values and
sources the current stats strip uses (derived counts where it derives
them)." **These four values are not derived from the `teams` collection
today** (confirmed in the content source map — they're static strings in
`content.json`) — leave them as static strings, just animate the ones that
parse as a leading number (`6`, `50`, `2026`) by counting up from 0 with a
`requestAnimationFrame` loop on mount (using `IntersectionObserver` so it
fires once when the section scrolls into view, matching the "once on load"
framing — reuse the existing `useReveal` hook's observer pattern as a
reference, but this needs its own numeric interpolation, not just an
opacity/transform reveal, so write a small local hook rather than extending
`useReveal`). The `FW` cell (not a number) just renders statically. Respect
`prefers-reduced-motion`: render the final value immediately, no animation.

- [ ] **Step 3: Verify**

`npm run build && npm run lint`. Browser check: load the page, scroll to the
stats section, confirm the three numeric cells count up once (not on every
scroll back into view — add a "has already animated" guard), `FW` renders
statically, reduced-motion shows final values immediately. Compare both
themes/sizes against the screenshot.

- [ ] **Step 4: Commit**

```bash
git add app/src/components/Stats.jsx app/src/pages/Home.jsx app/src/index.css
git commit -m "feat: add stats strip with count-up animation"
```

---

### Task 5: Latest updates (Announcements)

**Files:**
- Modify: `app/src/components/Announcements.jsx`
- Modify: `app/src/index.css` (`/* ANNOUNCEMENTS */` block)

- [ ] **Step 1: Read the references**

Open `design/html/{light,dark}/public-home.html`'s "Latest updates" section
and the matching screenshots.

- [ ] **Step 2: Implement**

Per `PROMPT.md`: first post large with its photo, the rest stacked. Tag pill
colours: Signing → `--pink-tint`/`--pink-tint-ink`, Tournament →
`--blue-tint`/`--blue-tint-ink`, Announcement → `--chip`/`--ink` (neutral),
Award → a warm yellow **not** in `design/tokens.css` as a named variable —
use the literal hex pair from the design source
(`design/source/Admin.dc.html`'s `TAGC.Award = ['#FFF0C9', '#6B4300']`, which
is the same tag-color system used consistently across the whole design) for
both themes (it doesn't have a dark-mode variant defined elsewhere in the
spec, so keep it constant across themes same as the design source does).
Link and file buttons from the post still render under the body.

**Data contract — must not change:** still reads from `useAnnouncements(10)`
→ Firestore `announcements` collection, same fields (`title`, `body`, `tag`,
`date`, `photoUrl`, `linkUrl`, `linkLabel`, `fileUrl`, `fileLabel`), same
"return null while loading, return null if empty" behavior, same sort order
(already handled by the hook).

Design every range per `PROMPT.md`'s instruction: 0 posts (section hides,
already handled), 1 post (just the large one, no stacked list), many posts,
missing photo, missing link, missing file — check each visually using the
live data already in Firestore (there are 3 real announcements per the
content source map) plus by temporarily considering edge cases in your
review (you don't need to mutate Firestore to test — reason about the JSX
for the missing-field cases, e.g. `{post.photoUrl && <img .../>}` guards
already exist, keep them).

- [ ] **Step 3: Verify**

`npm run build && npm run lint`. Browser check both themes/sizes against the
screenshot, using the live announcements data.

- [ ] **Step 4: Commit**

```bash
git add app/src/components/Announcements.jsx app/src/index.css
git commit -m "style: restyle latest updates feed to new design system"
```

---

### Task 6: Our teams (grid)

**Files:**
- Modify: `app/src/components/Teams.jsx`
- Modify: `app/src/index.css` (`/* TEAMS */` block)

- [ ] **Step 1: Read the references**

Open `design/html/{light,dark}/public-home.html`'s teams grid section and
screenshots.

- [ ] **Step 2: Implement**

Per `PROMPT.md`: card grid with a huge age numeral in the team colour (Blue
→ `--blue-ink`, Pink → `--pink`), division pill (`--blue-tint`/
`--blue-tint-ink` or `--pink-tint`/`--pink-tint-ink`), name, subtitle. Hover:
card lifts 6px with soft shadow + ink border, numeral nudges (the `.il-lift`/
`.il-num` pattern from `design/source/Main.dc.html`'s `<style>` — the lift
and numeral-nudge hover motion itself is Task-4-of-Plan-4's job per
`PROMPT.md`'s "How to work" ordering, so for *this* task just get the static
layout and colors right; it's fine if you also add the hover transition now
since it's trivial CSS, but don't treat getting it exactly right as blocking
this task — the Motion plan will do a dedicated pass).

**Data contract — must not change:** still receives `teams`/`loading` props
from `Home.jsx` (sourced from `useTeams()`), still sorted via the existing
`sortTeams()` helper (`app/src/lib/teamOrder.js` — already merged from an
earlier branch, do not reintroduce a hardcoded `TEAM_ORDER` array), still
opens `TeamDrawer` on click. Design every range: a team with 0 players (shows
"0 players" today — check the design's wording for this, it may say
something different for an empty roster), many teams.

- [ ] **Step 3: Verify**

`npm run build && npm run lint`. Browser check both themes/sizes.

- [ ] **Step 4: Commit**

```bash
git add app/src/components/Teams.jsx app/src/index.css
git commit -m "style: restyle teams grid to new design system"
```

---

### Task 7: Team view (inside the existing drawer)

**Files:**
- Modify: `app/src/components/TeamDrawer.jsx`
- Modify: `app/src/index.css` (`/* TEAM DRAWER */`, `/* CALENDAR */`, `/* ROSTER */`, `/* PRACTICES */`, `/* COACHES */` blocks)

- [ ] **Step 1: Read the references**

Open `design/html/{light,dark}/public-team.html` and
`design/screens/{light,dark}/public-team.png`, plus
`design/source/Team.dc.html`'s `<style>` block for this screen's specific
hover/motion classes (`.il-slide`, `.il-photo` zoom-on-hover, `.il-tab`).

- [ ] **Step 2: Implement**

Per `PROMPT.md`: "the design shows this as a full page with a sky-blue header
and four sections (Schedule, Roster, Practices, Coaches). ... keep the
existing drawer and apply this layout inside it." So: **do not add a route**
(confirmed in the content source map — no public router exists for teams
today). Restyle `TeamDrawer.jsx`'s existing slide-over panel to match the new
full-page team-view design as closely as the drawer's dimensions allow: a
sky-blue (`--sky`, with `--on-accent` text per the "text on sky is always
`--ink`, never white" rule) header area, and the same four tabs
(Schedule/Roster/Practices/Coaches) restyled.

**Data contract — must not change:**
- Schedule tab: keep the existing month `Calendar` sub-component and its date
  math (`tourOwnsDay`, `rangeClass`, etc. — don't touch the logic, only the
  CSS) — restyled with the new tokens. Per `PROMPT.md`, the mock only shows
  upcoming/results lists, but "keep the existing month calendar... restyled
  with the tokens" — i.e. keep the calendar grid, just recolor/retype it.
- Roster tab: still reads `team.roster[]`, same position filter buttons, same
  fields (photo, jersey number, name, Position 1/2 chips, school, grad year).
- Practices / Coaches tabs: still read `team.practices[]`/`team.coaches[]`,
  same fields.
- `logEvent('view_team', { team_name: team.name })` call on mount stays.

Design every range: a team with an empty roster/practices/coaches/tournaments
array (check what the current "No X yet" or empty-grid behavior is and keep
it, just restyled), one item, many items, a player missing `photo`/`gradYear`/
`school`, a coach missing `photo`.

- [ ] **Step 3: Verify**

`npm run build && npm run lint`. Browser check: open a team card on the home
page (both themes, both sizes), compare the opened drawer against
`design/screens/*/public-team.png`, click through all four tabs, test the
position filter, test the calendar's prev/next month buttons and clicking a
tournament day.

- [ ] **Step 4: Commit**

```bash
git add app/src/components/TeamDrawer.jsx app/src/index.css
git commit -m "style: restyle team view (drawer) to new sky-blue design"
```

---

### Task 8: Tryouts

**Files:**
- Modify: `app/src/components/Tryouts.jsx`
- Modify: `app/src/index.css` (`/* TRYOUTS */` block)

- [ ] **Step 1: Read the references**

Open `design/html/{light,dark}/public-home.html`'s tryouts section and
screenshots.

- [ ] **Step 2: Implement**

Per `PROMPT.md`: pink block (`--pink` background, `--on-accent` text per the
contrast rule), card on the right with dates, time slots and location, dark
("`--inv-bg`/`--inv-fg`") "Register now" button. Loop motion (pulsing dot,
dashed ring) is Plan 4's job — get the static layout/colors right here.

**Data contract — must not change:** all of it — dates, sessions, age
groups, venue, address, fee, note, registration URL — still renders from
`content.json: tryouts` and `useSettings()` (`settings.registrationLink`),
exactly the fields the current component reads (confirmed in the content
source map: none of this is Firestore-driven except the registration link
itself). The design shows two dates and two sessions as an example — lay out
the date-tile row and session-row list so they work for one, two, or more of
each (`content.tryouts.dates.map(...)`/`schedule.map(...)` already does
this, just restyle the tiles/rows). If `content.tryouts` is ever empty,
check what the current component does (today it would render empty
date/session rows with no fallback — if that looks broken, follow whatever
graceful empty state is easiest to add consistent with the design, but don't
over-build; a one-line "check dates" fallback text is enough if the arrays
are empty) and note what you did in your report.

- [ ] **Step 3: Verify**

`npm run build && npm run lint`. Browser check both themes/sizes.

- [ ] **Step 4: Commit**

```bash
git add app/src/components/Tryouts.jsx app/src/index.css
git commit -m "style: restyle tryouts section to new design system"
```

---

### Task 9: Programs

**Files:**
- Modify: `app/src/components/Programs.jsx`
- Modify: `app/src/index.css` (`/* PROGRAMS */` block)

- [ ] **Step 1: Read the references**

Open `design/html/{light,dark}/public-home.html`'s programs grid and
screenshots.

- [ ] **Step 2: Implement**

Restyle the 3-card grid (one "featured" card, two standard) to the new card
shape (24px radius, 1px `--line` border, no gradients/glows per the "no
gradients, glows, grain" rule).

**Data contract — must not change:** still reads `content.programs.items[]`
(`icon`, `title`, `description`, `featured`) — this is flagged in the content
source map as hard-coded copy that looks like it could be admin-editable;
per `PROMPT.md`'s "Out of scope unless I say so," do not make it editable,
just restyle it.

- [ ] **Step 3: Verify**

`npm run build && npm run lint`. Browser check both themes/sizes.

- [ ] **Step 4: Commit**

```bash
git add app/src/components/Programs.jsx app/src/index.css
git commit -m "style: restyle programs grid to new design system"
```

---

### Task 10: Club fees

**Files:**
- Modify: `app/src/components/Fees.jsx`
- Modify: `app/src/index.css` (`/* FEES */` block)

- [ ] **Step 1: Read the references**

Open `design/html/{light,dark}/public-home.html`'s fees section and
screenshots.

- [ ] **Step 2: Implement**

Per `PROMPT.md`: rules list and fee schedule PDF button on the left,
"Scan to pay" QR cards on the right.

**Data contract — must not change:** `content.fees.methods[]`/`rules[]` (flag
as hard-coded per the content source map, same "don't make editable" note as
Task 9) plus `usePayments()` → Firestore `settings/payments` (`qrs[]`,
`pdfUrl`) exactly as today. Design every range: `pdfUrl` empty (today the PDF
button block doesn't render at all — keep that), one QR code vs. four (the
`qr-row`/`qr-item` grid already handles this via `.map`).

- [ ] **Step 3: Verify**

`npm run build && npm run lint`. Browser check both themes/sizes, confirm the
live QR codes and PDF link from Firestore still render.

- [ ] **Step 4: Commit**

```bash
git add app/src/components/Fees.jsx app/src/index.css
git commit -m "style: restyle club fees section to new design system"
```

---

### Task 11: Sponsors

**Files:**
- Modify: `app/src/components/Sponsors.jsx`
- Modify: `app/src/index.css` (`/* SPONSORS */` block)

- [ ] **Step 1: Read the references**

Open `design/html/{light,dark}/public-home.html`'s sponsors section and
screenshots.

- [ ] **Step 2: Implement**

Per `PROMPT.md`: one row per tier (tier name and amount label on the left),
sponsor tiles with logo and label.

**Data contract — must not change:** still reads `useSponsors()` →
`tiers[]`/`sponsors` (Firestore `sponsors` collection, falling back to
`HARDCODED_TIERS` in `useSponsors.js` when empty — confirmed in the content
source map, do not touch that fallback). Design every range: a tier with one
sponsor vs. many, a sponsor with/without a `name` (the logo-only case already
has a guard — keep it), the "Become a Sponsor" block at the bottom.

- [ ] **Step 3: Verify**

`npm run build && npm run lint`. Browser check both themes/sizes, confirm the
live sponsor data (or the fallback seed, since the collection may be
populated or not depending on current Firestore state — check either way).

- [ ] **Step 4: Commit**

```bash
git add app/src/components/Sponsors.jsx app/src/index.css
git commit -m "style: restyle sponsors section to new design system"
```

---

### Task 12: Community

**Files:**
- Modify: `app/src/components/Community.jsx`
- Modify: `app/src/index.css` (`/* COMMUNITY (campaign slider) */` block)

- [ ] **Step 1: Read the references**

Open `design/html/{light,dark}/public-home.html`'s community section and
screenshots.

- [ ] **Step 2: Implement**

Per `PROMPT.md`: dark panel (`--panel` background), headline, description,
numbered steps, link button, and the campaign image on a card using its
stored background colour. Show prev/next arrows and an "n / total" counter
**only** when there's more than one campaign (already implemented via the
`multi` flag — keep that logic, just restyle). The slow "gentle float" on
the image card is Plan 4's job.

**Data contract — must not change:** still reads `useCommunity()` →
Firestore `community` collection (`headline`, `description`, `steps[]`,
`imageUrl`, `imageBg`, `linkUrl`, `linkLabel`, `fileUrl`, `fileLabel`,
`order`), same "return null while loading or empty" behavior, same slider
`activeIdx` state and dot/arrow navigation.

Design every range: 1 campaign (no slider controls, confirmed by the `multi`
check), many campaigns, missing `imageUrl`/`fileUrl`/`linkUrl`, long
`headline`/`description` text, many `steps`.

- [ ] **Step 3: Verify**

`npm run build && npm run lint`. Browser check both themes/sizes with the
live community campaign data.

- [ ] **Step 4: Commit**

```bash
git add app/src/components/Community.jsx app/src/index.css
git commit -m "style: restyle community section to new design system"
```

---

### Task 13: Final verification and dead-CSS cleanup

**Files:**
- Modify: `app/src/index.css` (removal only)

- [ ] **Step 1: Grep for dead old-system variables**

Run from `app/src`:
```bash
grep -rln -- '--bg\b\|--bg2\b\|--fg\b\|--border\b\|--card\b\|--blue\b\|--blue-br\b\|--blue-dim\b\|--pink-dim\b\|--pink-glow\b\|--wm-stroke\b\|--grain\b\|--hero-grid\b\|--svg-' . --include=*.jsx --include=*.css
```
Expected: no matches in any **public** component (`components/`, `pages/Home.jsx`)
or in `index.css`'s public-site rule blocks. Matches are expected in
`admin/`, `pages/Admin.jsx`, `pages/Login.jsx`, and `components/TeamDrawer.jsx`
if it wasn't fully covered — wait, `TeamDrawer.jsx` **is** covered by this
plan (Task 7), so it should also be clean. Admin files are out of scope for
this plan (Plan 3 covers them) — expect matches there, that's fine.

- [ ] **Step 2: Remove now-dead old-variable blocks and the old `.theme-btn` rule from `index.css`, but only the parts confirmed dead by Step 1**

If Step 1 shows the old `:root`/`[data-theme="light"]` variable blocks (top
of `index.css`, from before the Foundation plan's additive new-token blocks)
are no longer referenced by any **public**-facing CSS rule, but *are* still
referenced by admin-only rules (expected, since Plan 3 hasn't happened yet),
**do not delete those variable definitions yet** — they're still load-bearing
for the admin screens. Only remove the dead `.theme-btn` rule (replaced by
`ThemeSwitch` in the Foundation plan) and any other individual rule you can
confirm by grep has zero remaining references anywhere in the repo (not just
in public components).

- [ ] **Step 3: Full build + lint**

Run: `cd app && npm run build && npm run lint`. Expected: clean against the
known baseline.

- [ ] **Step 4: Full visual sweep**

For every public screen (`public-home`, `public-home-phone`, `public-team`),
both themes, both 1440×900 and 390×844: compare against
`design/screens/{light,dark}/<screen>.png`. List anything that doesn't match
layout/colour/type/spacing — fix before moving on. Confirm no horizontal
scroll at 360px width (per `PROMPT.md`'s accessibility section — test at
360px specifically, not just 390px).

- [ ] **Step 5: Commit (if any cleanup/fixes were made)**

```bash
git add -A
git commit -m "chore: remove dead theme-btn CSS, final public-site visual pass"
```

---

## Self-review notes

- **Spec coverage:** every bullet in `PROMPT.md`'s "Public site" section maps
  to exactly one task above, in the same top-to-bottom order `PROMPT.md`
  itself specifies. The "Content notes" section (hero subtitle wording,
  tryout dates being data not to edit) is addressed inline in Tasks 2 and 8.
- **Explicitly deferred to the Motion plan (Plan 4), not missing:** scroll-
  reveal (`animation-timeline: view()`), hover lift/nudge/arrow-slide
  animations, the ticker's pause-on-hover is in Task 3 since it's load-bearing
  for the ticker's basic function (not purely decorative motion), count-up is
  in Task 4 for the same reason (it's the stat strip's core behavior, not
  decorative), tryouts' pulsing dot and dashed ring, community's floating
  image card, and the full reduced-motion/keyboard audit.
- **Data contracts:** every task's "must not change" block was cross-checked
  against `docs/superpowers/plans/2026-10-09-design-rework-00-content-map.md`
  — nothing in this plan moves data between Firestore/`content.json`/hard-
  coded, consistent with the hard constraint.
