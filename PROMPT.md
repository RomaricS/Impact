# Rework the Impact Legends VBC site to the new design

You are working in the codebase for **impactvbcfw.com**, the site for Impact Legends Volleyball Club (Fort Wayne, IN). It is a React app backed by Firebase (Email/Password Auth, Firestore, Storage). The public site and the admin portal both need to be restyled to a new design. This folder is the design handoff: put it somewhere outside `app/src` (for example `./design-handoff/`) and read from it; do not ship it.

**This is a visual and UX rework, not a rewrite.** Data, routes, auth and every existing admin capability stay exactly as they are.

**The site is data-driven.** Almost everything a visitor sees (teams, rosters, coaches, practices, tournaments, sponsors, announcements, community campaigns, payment QR codes, the fee schedule, the registration link, the hero video link, the tryout dates and details) is stored in Firebase and edited in the admin portal. The designs were made from the public site without access to this code or the database, so **every piece of text, date, name, link and media in the screenshots is sample content showing where live data goes.** Never hard-code anything from the screenshots. Whatever a component reads from Firestore or Storage today, it keeps reading from there.

## What is in this folder

| Path | What it is |
|---|---|
| `design/screens/light/*.png`, `design/screens/dark/*.png` | Full-page screenshots of every screen in both themes. The source of truth for how things should look. |
| `design/html/light/*.html`, `design/html/dark/*.html` | The same screens as static HTML with inline styles. Open them to read exact sizes, spacing, colours and markup structure. They are a spec: do not paste them into the app, and they are not interactive. |
| `design/tokens.css` | Colour tokens for light and dark, plus the type and shape rules. |
| `design/source/*.dc.html` | Design-canvas source for the four master artboards (`Main`, `Team`, `HomeMobile`, `Admin`). The `<style>` block at the top of each holds the keyframes and hover rules; the `<script>` at the bottom of `Admin.dc.html` shows the intended interaction logic (reorder, staged save, toast, tab indicator). Reference only. |
| `assets/logo.png` | The club logo on a transparent background, 372×252, captured from the live site. **Prefer the original `logo.png` already in the repo**; use this one only if you need a transparent version. |
| `assets/hero-1.jpg` … `hero-3.jpg` | Stills from the current hero video, used in the mock. **Not for production**: the real hero plays whatever video the database points to (see below). |

Screen names: `public-home`, `public-home-phone`, `public-team`, `admin-login`, `admin-dashboard`, `admin-teams`, `admin-team-details`, `admin-team-roster`, `admin-team-tournaments`, `admin-team-practices`, `admin-team-coaches`, `admin-sponsors`, `admin-announcements`, `admin-community`, `admin-settings`.

## Before you change anything

1. Read the codebase: at least `app/src/pages/Admin.jsx`, `app/src/admin/*.jsx`, `app/src/hooks/*.js`, the public page components, the global stylesheet, and how styling is done today (CSS files, CSS modules, Tailwind, inline). **Keep the project's existing styling approach**; do not add a UI or CSS framework.
2. Look at every screenshot in `design/screens/` and skim `design/tokens.css`.
3. Build a **content source map**: for every piece of content on the public site, note where it comes from today (Firestore collection and field, Storage, or hard-coded in a component) and which admin screen edits it. The code is the source of truth for this, not this document.
4. Write a short plan mapping each design screen to the components you will change. List (a) anything in the design you cannot map to existing data, and (b) any admin screen, section or field that exists in the code but is not in the designs. Then start.

## Hard constraints

- **Do not change the data model.** Firestore collections (`teams`, `sponsors`, `announcements`, `community`, `settings/main`, `settings/payments`), field names, Storage paths, and the shapes written by the admin stay identical. No migrations.
- **Do not change behaviour** of auth, routes (`/admin/login`, `/admin`), save/delete flows, image and file uploads, export/import, or the sponsors fallback seed in `useSponsors.js`.
- **Every admin screen, section and field that exists today must still exist**, with the same options and the same save behaviour. The admin designs were drawn from a written summary that turned out to be incomplete (for example it did not list where the hero video link or the tryout dates are edited). Where the code has an admin section or field the designs do not show, keep it, restyle it with the same patterns as the designed screens (section rows as in `admin-settings.png`, or the list + editor pattern), and list it for me. Where the design and the code disagree on a field, the code wins.
- **Do not turn data-driven content into static content**, and do not replace live values with copy from the screenshots.
- **The logo is not to be redrawn, recoloured or replaced.**
- Do not invent content. Where the design shows bracketed placeholders such as `[Player name]` or `[Coach bio]`, that is where real Firestore data renders. The dashboard "Tournaments" count and the "Dunes May Challenge" row in the mock are sample data.
- For the few strings that really are hard-coded in components today, keep the existing wording unless it is listed under "Content notes" below.
- Design every data-driven block for its real range: empty (no tournaments, no sponsors in a tier, no video set), one item, many items, long names, missing optional fields (no photo, no link, no file).

## Design system

Use `design/tokens.css` as the base. Summary:

- **Look:** light, editorial sports. Off-white ground, near-black ink, pink `#E84388` and sky blue `#55AEEB` from the logo. No gradients, glows, grain or cartoon illustration. Remove the current dark-navy/neon styling and the volleyball-player illustration.
- **Type:** Archivo for everything (display uses `font-stretch: 125%`, weight 800–900, tight tracking, uppercase for the hero and big section titles), Geist Mono for small uppercase labels. Replace Bebas Neue and Plus Jakarta Sans.
- **Contrast rule:** text on pink or sky is always `#0D1117`, never white. White on that pink fails contrast for body text.
- **Shape:** pill buttons, 24px card radius, 32px for the big panels, 1px `--line` borders instead of shadows.
- **Targets:** every button, link-button and input is at least 44px tall.

## Dark mode

- Theme lives on the root element as `data-theme="light" | "dark"`; all colours come from CSS variables so the switch is one attribute change.
- Default to the visitor's `prefers-color-scheme`; once they toggle, persist the choice in `localStorage` and apply it before first paint to avoid a flash.
- **Switcher:** public nav gets a round 46px sun/moon button (icons rotate and cross-fade); the admin sidebar and the sign-in screen get a "Dark mode" switch with `role="switch"` and `aria-checked`.
- The logo sits on a white rounded badge in dark mode (`--logo-bg`), because it does not read on a dark background.
- Pink tryouts block, sky team header and the hero video keep the same colours in both themes. The ticker band flips from black to pink in dark mode.
- Check every screen against `design/screens/dark/`.

## Public site

Order on the home page (`public-home.png`): nav → hero → ticker → stats → Latest updates → Our teams → Tryouts → Programs → Club fees → Sponsors → Community → footer.

- **Nav:** logo left, links centre, theme switch and "Register for tryouts" right. Links get an underline that grows on hover. Collapses to logo + switch + menu button on phones (`public-home-phone.png`).
- **Hero:** eyebrow, one-line "IMPACT LEGENDS" headline ("Legends" in pink), intro paragraph left with the two buttons right, then a full-width rounded video band.
  - The video comes from the **video link stored in Firebase**, read the same way the current site reads it. Do not hard-code a path. Render it as `<video autoplay loop muted playsinline>` with `object-fit: cover`, height `clamp(280px, 42vw, 580px)`, radius 32px.
  - The clip can be any shape. The current one is portrait (about 1288×2440) with the action in the upper-middle and app UI baked in lower down, so default to `object-position: 50% 35%`; that also works for landscape clips. If the stored value is not a direct video file (for example a YouTube or other embed link), keep however the current code handles it and fit it to the same band.
  - If no video is set or it fails to load, show a solid `--ink` band with the caption so the layout holds.
  - Bottom overlay: dark scrim, "Impact Legends in action" caption with a blinking pink dot, and a round pause/play button with an accessible label. Do not autoplay when `prefers-reduced-motion` is set; show the first frame with the play button.
  - This replaces both the old illustrated hero and the separate "Where Champions Are Made" video section. Move the video's data source into the hero; do not leave a second copy lower on the page.
- **Ticker:** a slightly rotated band with scrolling uppercase words, decorative (`aria-hidden`), pauses on hover.
- **Stats:** four cells; the numeric ones count up once on load. Use the same values and sources the current stats strip uses (derived counts where it derives them).
- **Latest updates:** first post large with its photo, the rest stacked. Tag pill colours: Signing pink tint, Tournament blue tint, Announcement neutral, Award warm yellow. Link and file buttons from the post render under the body.
- **Our teams:** card grid with a huge age numeral in the team colour (Blue or Pink), division pill, name, subtitle. Sorted by the existing sort order.
- **Team view** (`public-team.png`): the design shows this as a full page with a sky-blue header and four sections (Schedule, Roster, Practices, Coaches). If public pages already use a router, add a team route and link the cards to it. If they do not, keep the existing drawer and apply this layout inside it. Keep the existing month calendar in the Schedule section, restyled with the tokens; the mock shows only the upcoming/results lists. Roster cards show photo (portrait), jersey number, name, Position 1 and 2 chips, school, grad year.
- **Tryouts:** pink block, card on the right with dates, time slots and location, dark "Register now" button. **All of it renders from the tryout data in Firebase** (dates, sessions, age groups, venue, address, fee, note, registration URL), exactly the fields the current component reads. The design shows two dates and two sessions as an example: lay out date tiles and session rows from the data so one, two or more of each work. If the data says there are no upcoming tryouts, follow whatever the current site does in that case (hide the block or show its closed state), restyled.
- **Club fees:** rules list and fee schedule PDF button left, "Scan to pay" QR cards right (from `settings/payments`).
- **Sponsors:** one row per tier (tier name and amount label on the left), sponsor tiles with logo and label.
- **Community:** dark panel, headline, description, numbered steps, link button, and the campaign image on a card using its stored background colour. Show prev/next and an "n / total" counter only when there is more than one campaign.
- **Footer:** logo, blurb, address, three link columns, and a quiet "Admin sign in" link.

## Admin portal

Layout for every signed-in screen: a 232px sidebar on `--ground` (logo, six nav items with counts, Dark mode switch, "View site", "Sign out") and the main area on `--surface`. On narrow screens the sidebar stacks above the content and the nav items wrap two per row.

List screens share one pattern (`admin-team-roster.png`, `admin-sponsors.png`, `admin-announcements.png`, `admin-community.png`): a list of rows on the left with an "Add" button above it, and an editor panel on the right for the selected row (or an empty "Add …" form). Selecting a row highlights it with an ink border. Build this as shared components rather than repeating it.

- **Sign in** (`admin-login.png`): form on the left, sky-blue brand panel on the right. Error state shows "Invalid email or password." in a red-tinted box. No sign-up or reset links; keep the note that accounts are created by the club.
- **Dashboard:** three tinted stat tiles (teams, players, tournaments) that count up, and the Quick access team grid. Add one notice above Quick access when any team has an empty roster ("N teams have empty rosters", listing them, with an "Open teams" button). This is the only new behaviour on the dashboard; it is read-only and derived from data already loaded.
- **Teams list:** table-like rows (order, numeral + name + subtitle, division pill, player count, tournament count, "Edit →") and "+ Add team".
- **Team editor:** header with back link, team name, division pill, subtitle and "View team page". Five tabs with a pink indicator that slides between them.
  - *Details:* the five fields, plus a **live preview of the public team card** that updates as you type or change colour, and the Danger zone with a two-step delete confirm.
  - *Roster, Tournaments, Practices, Coaches:* the shared list + editor pattern with the existing fields. Empty state per tab.
- **Sponsors:** rows grouped under tier headers (name, amount label, "Edit tier"). Up/down arrows reorder within a tier and save immediately. Keep the "+ New tier…" option in the Tier select.
- **Announcements:** up/down arrows stage a new order; a dark bar slides in above the list with "Order changed. Not saved yet.", "Reset" and "Save order". This is the existing staged-save behaviour with a clearer surface.
- **Community:** one row per campaign, editor with dynamic steps (add/remove), image upload, colour swatch + hex input, link and file fields. Arrows save immediately.
- **Settings:** stacked sections with the title and help text on the left and controls on the right: Tryout registration link; Payment QR codes (one card per method, batch "Save QR codes" / "Cancel"); Fee schedule PDF (View / Replace / Remove); Team data backup (Export, and Import in a red-outlined card warning that it overwrites team data).
- **Shared:** image fields show a thumbnail, "Upload"/"Replace" and a "✕" clear button; file fields show a type badge, filename, "View" and "✕". Every save or delete shows a toast that slides up from the bottom right (existing "Saved ✓" behaviour, restyled). Deletes use an inline two-step confirm instead of `window.confirm`.

## Motion

Use CSS for all of it; no animation library. Keyframes and hover rules are in the `<style>` block of `design/source/Main.dc.html` and `Team.dc.html`.

- Hero: eyebrow, headline words, paragraph and buttons rise in with a small stagger (about 0.8s, `cubic-bezier(.2,.7,.2,1)`).
- Scroll: sections rise in as they enter the viewport. Prefer CSS scroll-driven animation (`animation-timeline: view()`) inside `@supports`, with the content simply visible where it is unsupported. Do not hide content behind JS that might not run.
- Hover: cards lift 6px with a soft shadow and ink border; team numerals nudge; button arrows slide 6px; nav underline grows.
- Loops: ticker marquee, pulsing dot on the tryouts label, slow dashed ring on the tryouts block, gentle float on the community image card.
- Admin: sliding tab indicator, toast, staged-order bar expanding, a short fade-and-rise when the screen or selected row changes, count-up on dashboard tiles.
- Theme switch: 350ms cross-fade on background, border and text colour.
- Wrap everything in `@media (prefers-reduced-motion: reduce)` and turn animations and transitions off there.

## Accessibility and responsiveness

- Real `<button>`, `<a href>`, `<label for>` + `<input>`; no click handlers on divs. `aria-label` on icon-only buttons (theme switch, pause, reorder arrows, clear).
- `aria-current="page"` on the active nav item; tabs use `role="tablist"`/`role="tab"`/`aria-selected`.
- Body text contrast at least 4.5:1 in both themes (the tokens already meet this; do not lighten `--muted`).
- Everything works from 360px wide up: grids collapse to one column, the nav wraps, big panels reduce their padding, no horizontal page scroll. `public-home-phone.png` shows the condensed phone layout.

## Content notes

- Text, dates, counts and media in the screenshots are samples. Live values come from the database through the existing hooks.
- The current hero intro says "Eight age divisions" while the site lists six teams. If that sentence is hard-coded, use the design's wording ("Six teams from 12U through 18U…"). If it comes from the database or is derived, leave the logic alone and tell me.
- The tryout dates shown are the ones live when the design was made. They are data: render whatever the database holds and do not edit them.

## Out of scope unless I say so

- Adding new editable settings to the admin, or changing where any content is stored. If you find content that is still hard-coded and looks like it should be editable (programs copy, fee rules, hero text), list it for me; do not build it.
- Any change to Firestore rules, hosting config or dependencies beyond adding the two fonts.

## How to work

1. Tokens, fonts, theme attribute, theme switch and persistence. Verify light and dark on an otherwise unchanged page.
2. Public shell (nav, footer), then the home sections top to bottom, then the team view.
3. Admin shell (sidebar, toast, shared list + editor components), then each admin screen.
4. Motion pass, then reduced-motion and keyboard checks.

Commit in small, reviewable steps, one area per commit. After each area, run the app and compare against the matching screenshots in both themes at 1440px and 390px wide. Run the existing lint and build before each commit.

## Done when

- Every screen matches its light and dark screenshot in layout, colour, type and spacing at 1440px, and is usable at 390px.
- The theme switch works on the public site and in the admin, persists across reloads, and follows the system setting on first visit.
- The hero plays the video the database points to, fitted as specified, with a working pause button and a sensible fallback when none is set.
- Tryouts, stats, teams, sponsors, announcements, community, fees and payment codes all render from live data; changing a value in the admin changes the public site with no code edit.
- Nothing from the screenshots is hard-coded.
- Every existing admin action still works end to end against Firestore and Storage: add, edit, delete, reorder (immediate and staged), uploads, export, import, sign in, sign out.
- No Firestore field, collection or Storage path has changed.
- Build and lint pass, and there are no console errors.
- You have given me the content source map, plus a short list of: anything you could not match, admin sections or fields that were not in the designs and how you styled them, and any content that is still hard-coded.
