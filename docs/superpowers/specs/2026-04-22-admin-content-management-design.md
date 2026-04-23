# Admin Content Management — Design Spec

**Date:** 2026-04-22
**Project:** Impact Legends VBC

---

## Overview

Add three content management features to the existing admin panel: editable registration link, full sponsor CRUD, and an announcements system with a public-facing timeline feed. All data lives in Firestore, matching the existing `teams` collection pattern.

---

## Features

### 1. Registration Link

A single configurable URL stored in Firestore that drives the "Register Now" button in the `Tryouts` section. Currently hardcoded to a Google Forms URL.

**Admin:** One text input field in a new "Settings" admin panel. Save button writes to Firestore. No validation beyond basic non-empty check.

**Public:** `Tryouts.jsx` reads the link via a `useSettings` hook. Falls back to the existing hardcoded forms.gle URL if the Firestore doc doesn't exist yet.

---

### 2. Sponsors

Full CRUD over sponsors and tiers, replacing the hardcoded `TIERS` array in `Sponsors.jsx`.

**Data model — `sponsors` collection:**
```
{
  id: auto,
  logo: string (Firebase Storage URL),
  addr: string,
  tierLabel: string,   // e.g. "Kill Level"
  tierAmount: string,  // e.g. "$1,000+"
  tierOrder: number,   // controls tier display order
  order: number        // controls sponsor order within a tier
}
```

Tiers are derived by grouping sponsors by `tierLabel` + `tierOrder` — no separate tiers collection needed.

**Admin panel — Sponsors:**
- Sponsors grouped by tier, each tier showing its label, amount, and sponsors within it
- Add new sponsor: logo upload (Firebase Storage), address field, tier assignment (pick existing tier or create new one)
- Edit sponsor: same fields
- Delete sponsor: confirmation prompt
- Add / rename / remove tier: inline in the tier header
- Reorder sponsors within a tier via up/down buttons

**Public:** `Sponsors.jsx` reads from Firestore via `useSponsors` hook. Groups by `tierOrder` then `order`. Renders the same visual tier layout as today (tier pill, logo grid). Shows existing hardcoded data if Firestore is empty (migration path).

---

### 3. Announcements

A post system for club news: signings, tournament wins, general announcements.

**Data model — `announcements` collection:**
```
{
  id: auto,
  title: string,
  body: string,
  tag: string,         // "Signing" | "Tournament" | "Announcement" | "Award"
  photoUrl: string,    // optional, Firebase Storage URL
  linkUrl: string,     // optional, external URL
  linkLabel: string,   // optional, label for the link button
  date: string,        // display date, e.g. "Apr 18, 2026"
  createdAt: timestamp
}
```

**Admin panel — Announcements:**
- List of all posts sorted newest-first
- Create new post: title, body (textarea), tag (dropdown: Signing / Tournament / Announcement / Award), date picker, optional photo upload, optional link URL + label
- Edit existing post: same form pre-filled
- Delete post: confirmation prompt
- Published immediately on save (no draft state)

**Public — `Announcements.jsx` section:**
- Placed between `VideoBanner` and `Sponsors` on `Home.jsx`
- Section header: eyebrow "Club News", title "Latest Updates"
- Timeline feed layout (Option C from mockup): vertical line, dot per post, card per post
- Each card shows: optional photo, title, body, date (pink), tag pill
- If `linkUrl` is set, shows a small "Read more →" link
- Posts sorted by `createdAt` descending, limited to 10 most recent
- Section hidden entirely if there are no posts

---

## Architecture

### New hooks
- `useSettings()` — subscribes to `settings/main` doc, exposes `{ registrationLink }`
- `useSponsors()` — subscribes to `sponsors` collection, returns sponsors grouped and sorted
- `useAnnouncements()` — subscribes to `announcements` collection ordered by `createdAt` desc, limited to 10

### New components
- `Announcements.jsx` — public-facing timeline feed
- Admin panels are sections within the existing `Admin.jsx` file, following the existing tab/panel pattern

### Modified files
- `Admin.jsx` — three new panels added to sidebar: Settings, Sponsors, Announcements
- `Sponsors.jsx` — replace hardcoded `TIERS` with `useSponsors()` data
- `Tryouts.jsx` — replace hardcoded href with `useSettings().registrationLink`
- `Home.jsx` — import and render `<Announcements />` between `<VideoBanner />` and `<Sponsors />`

### No new routes
Everything lives within the existing `/admin` route and the existing home page. No new pages needed.

---

## Migration / Seeding

- Sponsors: the existing hardcoded sponsors in `Sponsors.jsx` are NOT auto-seeded — admin must add them manually. Fallback to hardcoded data while Firestore is empty.
- Registration link: falls back to the hardcoded forms.gle URL until admin sets one.
- Announcements: section hidden until first post is created.

---

## Out of Scope

- Draft / scheduled posts
- Post ordering override (always newest-first by createdAt)
- Rich text / markdown in announcement body
- Email notifications
- Public comment system
