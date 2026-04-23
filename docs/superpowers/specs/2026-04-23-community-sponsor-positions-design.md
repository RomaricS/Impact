# Design: Community Section, Sponsor Name, Position Filter

**Date:** 2026-04-23
**Status:** Approved

---

## Overview

Three independent features:
1. **Sponsor name/label** — add a display name to each sponsor
2. **Community section** — admin-managed campaigns (Kroger-style) with a public slider
3. **Position filter** — fixed position list, dual positions per player, filter covers both

---

## Feature 1: Sponsor Name

### Data
Add `name: string` to each sponsor Firestore doc. Empty string by default. Backward-compatible — existing docs without the field render without a name.

### Admin (`SponsorsPanel.jsx`)
- Add a **Name** text input to the add/edit sponsor form, positioned after the Logo upload and before the Address field.
- `EMPTY_FORM` gains `name: ''`.

### Public (`Sponsors.jsx`)
- Each logo card renders the sponsor name as a small caption below the logo image (only if `name` is non-empty).
- Style: `0.7rem`, muted color, centered.

### Hardcoded fallback (`useSponsors.js`)
- Add `name: ''` to all entries in `HARDCODED_TIERS` for type consistency.

---

## Feature 2: Community Section

### Data model
Firestore collection: `community`. One doc per campaign.

```
{
  headline: string,       // "Support the Next Generation."
  description: string,    // supporting paragraph
  steps: string[],        // ordered list of instruction strings (variable length)
  imageUrl: string,       // logo / hero image
  imageBg: string,        // CSS color for the image card background (e.g. "#2d5a45")
  linkUrl: string,        // optional CTA URL
  linkLabel: string,      // optional CTA label, defaults to "Learn More"
  order: number           // display order (ascending)
}
```

### Hook (`useCommunity.js`)
- `onSnapshot` on `community` collection, `orderBy('order')`.
- Returns `{ campaigns, loading }`.
- No hardcoded fallback — section is hidden when empty.

### Public component (`Community.jsx`)
- Returns `null` if `!loading && campaigns.length === 0`.
- **Layout (single or active slide):** two-column grid
  - Left: `sec-eye` eyebrow "COMMUNITY", large Bebas Neue headline, description paragraph, numbered steps list (index + 1, step text), optional CTA link button
  - Right: rounded card with `imageBg` background color, `imageUrl` centered inside
- **1 campaign:** static, no navigation controls.
- **2+ campaigns:** identical layout with ← → arrow buttons and dot indicators below. Active campaign controlled by `activeIdx` state. CSS `opacity`/`transform` transition (no library).
- Placed in `Home.jsx` between `<Sponsors />` and `<Footer />`.

### Admin panel (`CommunityPanel.jsx`)
- **List view:** table of campaigns showing headline and order, with ↑ ↓ reorder, Edit, Delete buttons. "+ New Campaign" button top-right.
- **Add/Edit form:** headline (text), description (textarea), steps (dynamic — renders each step as an input with a ✕ remove button; "+ Add Step" button appends a new empty step), ImageUpload for `imageUrl`, color `<input type="color">` for `imageBg`, linkUrl (text, optional), linkLabel (text, optional).
- Save uses `addDoc` / `setDoc`. Delete uses `deleteDoc` with `window.confirm`.
- Reorder swaps `order` values between adjacent docs (same pattern as sponsors).
- Accepts `toast` prop.

### Wiring
- `Admin.jsx`: import `CommunityPanel`, add `{ id: 'community', label: 'Community', icon: '🤝' }` nav item (between Announcements and Settings), render `{view === 'community' && <CommunityPanel toast={toast} />}`.
- `Home.jsx`: import and render `<Community />` between `<Sponsors />` and `<Footer />`.
- `index.css`: add community section styles.

### CSS (community section)
- `.community-sec` — full-width section, `sec` base class
- `.comm-grid` — two-column layout (left ~55%, right ~45%), responsive single column on mobile
- `.comm-steps` — vertical list; each step is a row with a pink numbered circle + text (matches screenshot aesthetic)
- `.comm-img-card` — rounded card (`border-radius: 18px`), `imageBg` applied as inline `background`, centers `<img>` with padding
- Slider controls: `.comm-arrows` (prev/next buttons), `.comm-dots` (dot indicators)
- Slide transition: `opacity` + `translateX` CSS transition, 300ms ease

---

## Feature 3: Position Filter

### Fixed position list
Defined once as a shared constant. Used in both the admin editor and the public drawer.

```js
const POSITIONS = ['OPP', 'S', 'MB', 'DS', 'L', 'OH'];
```

Location: inline in both `TeamDrawer.jsx` and `Admin.jsx` (small enough to not need a shared file).

### Player data model
Add `pos2: string` to player objects (empty string = no second position).

### `TeamDrawer.jsx` changes
- Filter buttons: `['All', ...POSITIONS]` — always fixed, never derived from roster.
- Filter logic: `posFilter === 'All' || p.pos === posFilter || p.pos2 === posFilter`
- Player card: show `pos` badge always (if set); show `pos2` badge next to it if non-empty.

### `Admin.jsx` RosterEditor changes
- `pos` field: replace free-text `<input>` with `<select>`. Options: empty "Select position…" + `POSITIONS` map.
- `pos2` field: new `<select>` in the same form row as `pos`. Options: empty "None" + `POSITIONS` map. Optional — submitting with empty string is valid.
- `EMPTY_FORM` gains `pos2: ''`.

### Migration
No automated migration. Existing players with free-text positions (e.g. "Outside Hitter") won't match filter buttons — admins can update them via the editor. This is acceptable for a small club roster.

---

## File Map

**Create:**
- `app/src/hooks/useCommunity.js`
- `app/src/components/Community.jsx`
- `app/src/admin/CommunityPanel.jsx`

**Modify:**
- `app/src/hooks/useSponsors.js` — add `name: ''` to hardcoded fallback
- `app/src/admin/SponsorsPanel.jsx` — add Name field to form + `EMPTY_FORM`
- `app/src/components/Sponsors.jsx` — render sponsor name caption
- `app/src/components/TeamDrawer.jsx` — fixed POSITIONS, pos2 filter logic, pos2 badge
- `app/src/pages/Admin.jsx` — RosterEditor pos select + pos2 select, Community nav + view
- `app/src/pages/Home.jsx` — add `<Community />`
- `app/src/index.css` — community section styles
