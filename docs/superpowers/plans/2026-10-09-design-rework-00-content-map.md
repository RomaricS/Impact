# Content Source Map — Design Rework

Required by `PROMPT.md` step 3 ("Before you change anything"). This is the
source of truth for which Firestore field / Storage path / hard-coded file
feeds every piece of content on the site, and which admin screen (if any)
edits it. Built by reading the actual code (`app/src/**`), not by inference.

## Firestore-backed content (editable in admin)

| Content | Firestore / Storage | Admin screen | Public consumer |
|---|---|---|---|
| Team name, subtitle, division, color, sort order | `teams/{id}` fields `name`, `sub`, `division`, `color`, `order` | Teams → Details tab | `Teams.jsx` grid, `TeamDrawer.jsx` header |
| Roster | `teams/{id}.roster[]` (name, num, pos, pos2, photo, gradYear, school) + Storage `players/*` | Teams → Roster tab | `TeamDrawer.jsx` Roster tab |
| Tournaments | `teams/{id}.tournaments[]` (name, date, endDate, location, address, result) | Teams → Tournaments tab | `TeamDrawer.jsx` Schedule tab (calendar + upcoming list) |
| Practices | `teams/{id}.practices[]` (day, time, location, address, type) | Teams → Practices tab | `TeamDrawer.jsx` Practices tab |
| Coaches | `teams/{id}.coaches[]` (name, title, bio, photo) + Storage `coaches/*` | Teams → Coaches tab | `TeamDrawer.jsx` Coaches tab |
| Sponsors + tiers | `sponsors/{id}` (logo, name, addr, tierLabel, tierAmount, tierOrder, order) + Storage `sponsors/*` | Sponsors panel | `Sponsors.jsx`. **Fallback:** if the collection is empty, `useSponsors.js` serves a hard-coded `HARDCODED_TIERS` seed list instead |
| Announcements ("Latest updates") | `announcements/{id}` (title, body, tag, date, photoUrl, linkUrl, linkLabel, fileUrl, fileLabel, sort, createdAt) + Storage `announcements/*` | Announcements panel (staged reorder) | `Announcements.jsx` |
| Community campaigns | `community/{id}` (headline, description, steps[], imageUrl, imageBg, linkUrl, linkLabel, fileUrl, fileLabel, order) + Storage `community/*` | Community panel (instant reorder) | `Community.jsx` slider |
| Tryout registration link | `settings/main.registrationLink` | Settings → Tryout Registration Link | `Tryouts.jsx` CTA button |
| Payment QR codes | `settings/payments.qr[]` (label, cls, src, handle, note) | Settings → Payment QR Codes | `Fees.jsx` |
| Fee schedule PDF | `settings/payments.feeSchedulePdf` | Settings → Fee Schedule PDF | `Fees.jsx` download button |
| Admin auth | Firebase Auth (email/password), no Firestore doc | — (accounts created directly in Firebase console) | `Login.jsx` / `useAuth.js` gates `/admin/*` |
| Dashboard stat tiles (Teams/Players/Tournaments) | Derived client-side from `teams` collection already loaded | Dashboard (read-only) | `Admin.jsx` dashboard |

## Hard-coded content (code/`content.json`, **not** admin-editable)

Everything below is a static string or array baked into `app/src/content.json`
or directly into a component. No admin screen writes to any of it.

| Content | Where |
|---|---|
| Nav labels/links, schedules URL, logo text | `content.json: nav` |
| Hero eyebrow/headline/subtitle/CTA labels, hero stat strip values (`6 Club Teams`, `50+ Players`, `2026 Season`, `FW`) | `content.json: hero` — **not derived from the `teams` collection**, just static numbers |
| Video banner eyebrow/heading/subtitle text | `content.json: videoBanner` |
| Section eyebrows/titles/subtitles (Teams, Announcements, Tryouts, Programs, Fees, Sponsors, Community) | `content.json` |
| Tryout dates, time slots, locations, fee amount/label, description | `content.json: tryouts` |
| Programs grid items (icon, title, description, featured flag) | `content.json: programs.items` |
| Fee payment-method pills and fee rules (icons/text) | `content.json: fees.methods`, `fees.rules` |
| Footer columns/links, address, social URLs, copyright | `content.json: footer` |
| Default/fallback QR images (`/assets/qr-*.png`) used before `settings/payments.qr` is populated | `usePayments.js: DEFAULT_QRS` |

## ⚠️ Discrepancies between PROMPT.md's assumptions and the actual code

PROMPT.md anticipated this ("the designs were drawn from a written summary
that turned out to be incomplete — for example it did not list where the
hero video link or the tryout dates are edited"). Confirmed by reading the
code:

1. **The hero video is not Firebase-driven at all.** `VideoBanner.jsx` hard-codes
   `<video src="/assets/vid.mp4">` — a static file in `app/public/assets/`.
   There is no Firestore field or Storage path for it anywhere in the codebase
   (confirmed by grep across `hooks/`, `lib/`, `content.json`). Per the "Out
   of scope unless I say so" rule, this plan keeps it as the same hard-coded
   local file — just restyled into the new full-width rounded video band —
   rather than inventing a new Firebase-backed setting.
2. **Tryout dates/sessions/locations are not Firebase-driven either.** They
   are static arrays in `content.json: tryouts`. Changing them today requires
   a code edit, not an admin action. This plan renders them from that same
   static file, unchanged.
3. **Hero stat-strip numbers are not derived from live data.** `6 Club Teams`,
   `50+ Players` etc. are hand-typed strings in `content.json`, not computed
   from the `teams` collection (unlike the Admin Dashboard tiles, which *are*
   derived). This plan leaves them as the same static strings.

## No public router for team pages

`App.jsx` only defines three routes: `/`, `/admin/login`, `/admin/*`. There is
no per-team URL. Per PROMPT.md's conditional instruction ("if public pages
already use a router, add a team route... if they do not, keep the existing
drawer"), the new sky-blue team layout will be built **inside the existing
`TeamDrawer.jsx` slide-over panel**, not as a new route.

## Content that looks like it should be editable but isn't (flagging per "Out of scope unless I say so")

- Programs grid copy (`content.json: programs.items`)
- Fee rules text/icons (`content.json: fees.rules`, `fees.methods`)
- Hero/tryouts copy and dates (see discrepancies above)
- Hero video source

None of these will be made editable or moved in this rework — flagged only,
per PROMPT.md's explicit instruction not to build this unasked.
