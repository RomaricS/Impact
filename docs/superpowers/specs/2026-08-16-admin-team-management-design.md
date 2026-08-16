# Admin Team Management — Design

**Date:** 2026-08-16

## Goal

Let admins add, remove, and edit teams (notably the team title/name) from the
admin platform, instead of teams being fixed by a hardcoded list.

## Current state

- Teams live in the Firestore `teams` collection, keyed by IDs like `12-blue`.
- Team shape: `{ name, sub, division, color, order, coaches[], practices[], tournaments[], roster[] }`
  (`order` is new — see below).
- `useTeams()` already exports `saveTeam`, `updateTeamField`, `deleteTeam`, but the
  admin UI never used them.
- Both the public `Teams.jsx` and the admin `Admin.jsx` filtered/sorted teams through a
  hardcoded `TEAM_ORDER = ['12-blue', ...]` array. A team not in that array never rendered.
- The admin `TeamEditorPage` edited only *inside* a team (roster/tournaments/practices/coaches).
  Team-level fields (name/sub/division/color) had no editor.

## Design

### 1. Dynamic ordering (`order` field)

- Add a numeric `order` field to each team doc.
- Public `Teams.jsx` and admin `Admin.jsx` sort with:
  `Object.values(teams).sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity) || a.name.localeCompare(b.name))`
- Teams without `order` fall back to alphabetical-by-name, which happens to preserve the
  current 12→14→16 Blue→16 Pink→17→18 ordering, so no data migration is required. Admins
  assign `order` values as they edit; new teams default to `max(order) + 1`.
- The hardcoded `TEAM_ORDER` array is removed from both files.

### 2. Edit team details ("Details" tab)

- New "Details" tab inside `TeamEditorPage`, alongside Roster/Tournaments/Practices/Coaches.
- Editable fields: `name` (title), `sub`, `division` (pill text), `color` (blue/pink select),
  `order` (number).
- Saves via the existing `saveField()` (`setDoc(..., { merge: true })`) using the current
  admin card/form styling.

### 3. Add team

- "+ Add Team" button on the Teams list page.
- Generates a stable random ID via the existing `genId()` (not derived from name, so renaming
  the title never orphans the doc or its uploaded photos).
- Writes a new doc with empty roster/coaches/etc. and `order = max(order) + 1`, then opens the
  editor on its Details tab.

### 4. Remove team

- "Delete Team" button (danger styling) in the Details tab, behind a `confirm()` dialog.
- Calls `deleteDoc(doc(db, 'teams', id))` and returns to the Teams list.

## Scope guardrails (YAGNI)

- No drag-and-drop reordering — a numeric `order` field only.
- No Firestore doc-ID renaming.
- No bulk operations.
- Public team-card rendering is unchanged; only the sort source changes.
