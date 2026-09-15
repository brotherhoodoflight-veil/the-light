# AGENT 2 — FINAL REPORT: DASHBOARD & ROLE-BASED ARCHITECTURE

**Project:** The Brotherhood of Light — VEIL (Private Global Fraternity Portal)
**Scope:** Scheduling Dashboard & Role-Based Architecture for the authenticated portal
**Date:** 2026-09-14
**Status:** Architecture complete. No further implementation performed per instruction.

---

## 1. What I Inspected

### 1.1 Project Stack
- **Framework:** Next.js 14.2.5 (App Router), React 18.3.1, TypeScript 5.5.4 (strict, `isolatedModules`, `moduleResolution: bundler`).
- **Styling:** Plain global CSS only (no Tailwind, no CSS modules).
- **Package manager:** npm. No ESLint, Prettier, `next.config`, `.env`, or `.git` present.
- **Dependencies:** `next`, `react`, `react-dom` + dev types/TS only. No auth, ORM, or DB packages.

### 1.2 Discovered Files
- `app/layout.tsx` — minimal root layout (imports `globals.css`, renders `children`).
- `app/page.tsx` — public landing at `/` (fully styled, LOCKED).
- `app/login/page.tsx` — client-side login form (249 lines, LOCKED).
- `app/login/components/VeilEmblem.tsx` — reusable, styling-agnostic SVG seal (135 lines).
- `app/dashboard/page.tsx` — **existing but flawed**: a minified 3-line placeholder (sidebar with 9 links to `#`, 4 stat cards, 2 panels). Its CSS classes (`.shell`, `.nav`, `.card`, `.grid`, `.avatar`, `.panel`) are **not defined anywhere** in `globals.css` — the page is currently unstyled and was absent from the last `.next` build output.
- `app/globals.css` — 832 lines; defines landing (`.veil-*`) and login (`.login-*`) styling only.
- **Absent:** `components/`, `lib/`, `app/api/`, `middleware.ts`, `prisma/`, `next-env.d.ts` (present), env files, any `route.ts`.

### 1.3 Authentication / Data Layer Status
- **None exists.** Login is a UI prototype that POSTs to `/api/auth/login` (route does not exist → 404 on submit). No sessions, cookies, JWT, NextAuth, bcrypt, or middleware.
- **No database.** No Prisma schema, no ORM, no `.env`. README confirms PostgreSQL + roles/permissions/member data must be added before production.

### 1.4 Key Findings
1. The dashboard placeholder is unstyled; the shared CSS it references is missing.
2. There is no dashboard `layout.tsx`, so role-adaptive navigation cannot exist yet.
3. The `.next` build is stale relative to `/dashboard`.
4. Everything must be greenfield aside from the locked pages and the emblem component.

---

## 2. What I Created or Modified

### 2.1 Created
| File | Purpose |
|---|---|
| `lib/types/index.ts` | Core domain types: `Roles`, `Role`, `OrganizationalPositions`, `UserScope`, `Permissions`/`Permission`, `NavItem`, `NavGroup`, `StatCard`, `ActivityItem`, `DashboardUser`, `DashboardContext`. Prisma-shaped; deliberately not DB-backed. |
| `lib/navigation/index.ts` | Per-role navigation configuration (`NAVIGATION` record, `getNavigationForRole(role)`). |
| `lib/auth/authorization.ts` | Role→permission matrix (`ROLE_PERMISSIONS`, `getPermissionsForRole`), `hasPermission`, `scopeCovers`, `canAccessEntity`, scope label/title helpers. |

### 2.2 Modified
- `lib/auth/authorization.ts` — one post-creation fix: `DashboardContext` imported as type-only (isolatedModules safety). No other edits.

### 2.3 Not Modified (all LOCKED / preserved)
- `app/page.tsx`, `app/login/*`, `app/globals.css`, `app/layout.tsx`, `app/dashboard/page.tsx`
- `package.json`, `package-lock.json`, Prisma/database, auth.

### 2.4 Packages Installed
- **None.**

### 2.5 Verification
- `npx tsc --noEmit` passes clean after the type-only import fix.

---

## 3. Dashboard Architecture

### 3.1 Flow
```
/login → authentication → authorization → role + organizational scope → appropriate dashboard
```

- No single generic dashboard. Every dashboard derives from:
  `User → Role → Organizational Jurisdiction → Permissions → Resource`.
- The dashboard shell (`app/dashboard/layout.tsx`, to be built next stage) reads a `DashboardContext` (user + scope + resolved permissions) and renders role-adaptive sidebar + topbar + content.
- Navigation groups are configuration-driven, not hard-coded per page: each role maps to a set of `NavGroup`s with permission-gated items.

### 3.2 Desktop Layout (recommended)
- **Left sidebar:** brand (`VEIL — The Brotherhood of Light`), sectioned nav, secure-portal note. Menu changes by role.
- **Top bar:** page title, notifications, messages, user identity/avatar, organization/location indicator (`scopeTitle`).
- **Main:** summary cards, relevant info, recent activity, upcoming events, pending actions.

### 3.3 Mobile (recommended)
- Sidebar becomes a menu/drawer; cards stack; tables become responsive; no horizontal scrolling; touch-friendly controls.

### 3.4 Design Direction
- Visual identity continues from landing/login: dark charcoal/black, muted gold `#b9a46a`, bronze `#806f45`, ivory text `#e8e1cf`.
- **Mood differs intentionally:** dashboard must be *calm, powerful, private, authoritative, organized* — not the dramatic/scary gateway of the login page.

---

## 4. Complete VEIL Role Hierarchy

```
AREOPAGUS
    │
    ▼
COUNTRY INITIATOR
    │
    ▼
PREFECTURE
    ├───────────────┐
    ▼               ▼
DIRECTORATE    MINERVAL ASSEMBLY
    │               │
    └───────┬───────┘
            ▼
           CELL
            │
            ▼
     INSINUATOR / MENTOR
            │
            ▼
          MEMBER
```

### Roles Supported
1. **Areopagus** — global organizational visibility (supreme fraternal authority).
2. **Country Initiator** — country-level scope only (NOT "Inspectorate").
3. **Prefect** — prefecture-level scope.
4. **Directorate Officer** — own directorate.
5. **Minerval Assembly Officer** — own assembly.
6. **Insinuator / Mentor** — assigned candidates/members only.
7. **Member** — self + community scope.
8. **Candidate** — restricted access until approval.
9. **System Administrator** — technical/system role; does **not** imply supreme organizational authority.

---

## 5. Role-Specific Dashboard & Navigation Structure

Each role has a dedicated, permission-gated navigation config (`lib/navigation/index.ts`):

| Role | Browsable Section | Key Navigable Items |
|---|---|---|
| **Areopagus** | Overview · Global Administration · Governance · Communication · Oversight | Members, Candidates, Countries, Country Initiators, Prefectures, Directorates, Minerval Assemblies, Cells, Insinuators; Appointments, Promotions, Membership History; Global Announcements, Events, Messages, Documents; Reports, Audit Logs, System Activity |
| **Country Initiator** | Overview · Country Administration · Governance · Communication · Oversight | Members, Candidates, Prefectures, Directorates, Assemblies, Cells, Insinuators; Recommendations, Promotions, Appointments; Announcements, Events, Messages, Documents; Reports. **No cross-country visibility.** |
| **Prefect** | Overview · Prefecture · Communication · Oversight | Members, Candidates, Directorates, Assemblies, Cells, Insinuators, Recommendations; Announcements, Events, Messages; Reports. **No cross-prefecture access.** |
| **Directorate Officer** | Overview · Directorate · Communication · Oversight | Members, Cells, Insinuators; Announcements, Events, Messages; Reports |
| **Minerval Assembly Officer** | Overview · Assembly · Communication · Oversight | Members, Meetings*, Educational Resources*, Events, Announcements, Documents, Reports, Messages |
| **Insinuator / Mentor** | Overview · Mentorship · Communication | Assigned Candidates, Assigned Members, Mentorship Status*, Progress*, Messages, Documents, Required Actions, Upcoming Meetings/Events*. **Assigned people only.** |
| **Member** | My VEIL · Community · Account | Profile, Membership, Org Position, Country, Prefecture, Directorate, Assembly, Cell, Insinuator; Announcements, Events, Documents, Messages; Settings, Security, Password, 2FA*, Login History* |
| **Candidate** | Candidate · Path · Approved | Profile, Membership Status, Invitation Info, Assigned Insinuator, Required Actions, Approved Resources, Messages, Relevant Events. **No confidential/admin data.** |
| **System Administrator** | Overview · System | Users, Security, Activity, Audit Logs, Settings. No organizational authority. |

\* Reserved placeholders for later stages (no routes scaffolded yet).

---

## 6. Organizational Scope & Jurisdiction Model

### 6.1 Scope
`UserScope = { position, entityId, entityName, countryId?, countryName? }`
- `position` one of `GLOBAL | COUNTRY | PREFECTURE | DIRECTORATE | MINERVAL_ASSEMBLY | CELL`.
- Always carries country lineage for non-Areopagus users, enabling cross-level containment checks.

### 6.2 Hierarchy Levels
```
GLOBAL (6) → COUNTRY (5) → PREFECTURE (4) → DIRECTORATE (3) / MINERVAL ASSEMBLY (3) → CELL (2)
```

### 6.3 Containment (`scopeCovers`)
- Actor at GLOBAL covers everything.
- Equal positions must have matching `entityId`.
- Different positions are covered only when the actor's country lineage matches the target's.

### 6.4 Anti-privilege-escalation guarantee
- A Prefect may view `/dashboard/prefecture/abc` but must never reach `/dashboard/prefecture/xyz` by URL manipulation. **Backend authorization must enforce this** — menu hiding is never sufficient. Enforcement surfaces (next stage): server components, `app/api/*` route handlers, and (future) middleware.

---

## 7. Proposed Authorization / RBAC Structure

```
USER
 ↓
ROLE                          (single role per organizational seat)
 ↓
ORGANIZATIONAL SCOPE          (UserScope)
 ↓
PERMISSION                    (Permission enum)
 ↓
RESOURCE                      (route / API / data row)
```

### 7.1 Privilege model
- **RBAC + attribute-based scope:** permissions are granted by role; scope attrs (`position`/`entityId`/country lineage) constrain which rows each granted permission operates on.
- `ROLE_PERMISSIONS` matrix: Areopagus (broad global admin set), Country Initiator, Prefect, Directorate Officer, Minerval Assembly Officer, Insinuator, Member, Candidate (tightly restricted), and **System Administrator deliberately limited to system/security permissions only**.
- Key permissions include: `VIEW_ALL_MEMBERS`, `VIEW_ALL_CANDIDATES`, `MANAGE_COUNTRY_INITIATORS`, `MANAGE_PREFECTURES`, `MANAGE_DIRECTORATES`, `MANAGE_ASSEMBLIES`, `MANAGE_CELLS`, per-level `REPORTS`/`ANNOUNCEMENTS`/`EVENTS`, `VIEW_ASSIGNED_CANDIDATES`/`UPDATE_CANDIDATE_PROGRESS`, candidate-only `VIEW_APPROVED_RESOURCES`/`COMPLETE_REQUIRED_ACTIONS`, system `MANAGE_USERS`/`VIEW_AUDIT_LOGS`/`MANAGE_SECURITY`.

### 7.2 Enforcement layers (recommended)
1. **Server-side page guards** in dashboard routes (primary for the web UI).
2. **API route guards** in `app/api/*` (authoritative for all writes).
3. **Middleware** (optional) for fast pre-checks of authenticated state + role.
4. **Data-layer scoping** in queries (Prefect queries must be filtered by `prefectureId ∈ actor scope`) — never filter only in the client.

---

## 8. Routes Planned or Created

### 8.1 Created
- None. All dashboard routes are planned; only `/dashboard` exists as an unstyled placeholder.

### 8.2 Planned
```
/dashboard
/dashboard/profile
/dashboard/members
/dashboard/candidates
/dashboard/organizations/countries
/dashboard/organizations/country-initiators
/dashboard/organizations/prefectures
/dashboard/organizations/directorates
/dashboard/organizations/assemblies
/dashboard/organizations/cells
/dashboard/organizations/insinuators
/dashboard/recommendations
/dashboard/appointments
/dashboard/promotions
/dashboard/history
/dashboard/announcements
/dashboard/events
/dashboard/messages
/dashboard/documents
/dashboard/reports
/dashboard/actions          (candidate)
/dashboard/mentor           (candidate)
/dashboard/security
/dashboard/security/activity
/dashboard/security/audit
/dashboard/users            (system)
/dashboard/settings
/dashboard/organizations/{prefecture,directorate,assembly,cell}/[id]   (role-scoped URLs, future)
```
- **Principle:** create each route only when its feature is implemented; do not scaffold empties.

---

## 9. Database / Prisma Requirements Identified

No Prisma files were created (explicitly deferred). The following model requirements were identified for the schema stage:

- **User** (identity, credentials-hash hooks, 2FA, login-history hooks, active status).
- **Membership state machine:** `Candidate → Recommendation → Review → Approval → Member` (fields/status enum; **invitation/recommendation based, no public application**).
- **Role assignments** linked to an organizational seat (role must be paired with a scope entity).
- **Organizational entities** with hierarchy: `Country → Prefecture → {Directorate, Minerval Assembly} → Cell` (+ Insinuator assignments).
- **Membership history** — **append-only movement records** (`2024→Cell A, 2025→Cell B, 2026→Directorate C`). Never overwrite prior organizational records.
- **Candidate/member assignment** (Insinuator ↔ assigned candidates/members).
- **Recommendations, Appointments, Promotions** (workflow with review/approval states + audit trail).
- **Events, Announcements, Documents, Messages, Meetings, Educational Resources** (scoped by org entity + visibility level).
- **Reports, Audit Logs, Security Events, System Activity, Login History.**
- **Scoped query safety:** every table likely needs the org-scope key (or country lineage) to enforce row-level jurisdiction.

---

## 10. Conflicts, Risks, and Recommendations for the Next Stage

### 10.1 Conflicts / Notes
- `app/dashboard/page.tsx` currently references **undefined CSS classes** — it renders unstyled and contributes clutter. Recommend replacing its content with role-adaptive Member overview in the next stage (it is not a locked file).
- `globals.css` is locked unless a shared dashboard foundation is strictly necessary — prefer a dedicated `dashboard.css` (or CSS modules) to keep landing/login styling untouched.
- Login agent (Agent 1) is actively working on `/login` + POST `/api/auth/login`. **Do not disturb**; dashboard layout work must tolerate a temporarily non-functional auth endpoint.

### 10.2 Risks
- **Frontend-only authorization** (menu hiding) is the biggest risk; all enforcement must also live server-side.
- **System Administrator supremacy creep:** must remain a technical role without org authority.
- **Cross-scope URL access** by manually changing entity IDs — requires server-side scope checks against every request.
- **Membership history loss** if records are modeled as a single mutable "current position" field.
- Sharing the root `layout.tsx`/`globals.css` could collide with the other agent's work — keep dashboard styles isolated.

### 10.3 Recommendations
- Next: build `app/dashboard/layout.tsx` as a Server Component shell that resolves `DashboardContext` (from a placeholder session source — real session comes with the auth workstream), then the role-adaptive Member/role overview pages.
- Add shared `components/dashboard/*` primitives (StatCard, Panel, ActivityFeed, PendingActions, DataTable, Empty/Loading/Error states, mobile drawer).
- Add isolated dashboard CSS; keep landing/login files untouched.
- Defer DB schema until auth + session are agreed with the main workflow.

---

## 11. Files Agent 1 Must / Must Not Modify

### Agent 1 MUST NOT modify
- `app/page.tsx` (locked landing page).
- `app/globals.css` beyond the currently authored landing/login sections (any shared dashboard foundation must be additive, isolated, and non-destructive — ideally a separate CSS file).
- `lib/types/index.ts`, `lib/navigation/index.ts`, `lib/auth/authorization.ts` (Agent 2 architecture artifacts — coordinate before changing).
- Any `app/dashboard/**` files (Agent 2 territory).

### Agent 1 MAY / SHOULD modify
- `app/login/*` (their active workstream), the future `/api/auth/*` routes, and any auth/session plumbing they introduce.
- If they add session/context utilities useful to the dashboard, they should expose them through a clearly named module (e.g., `lib/auth/session.ts`) that Agent 2 can consume — coordinate before wire-up.

---

## 12. Exact Recommended Next Task

> **Task:** Implement the authenticated dashboard shell. Create `app/dashboard/layout.tsx` as a Server Component that (a) resolves a `DashboardContext` from the session module agreed with the auth workstream (temporarily stubbed with a safe dev fallback if no session exists), (b) renders the role-adaptive `Sidebar` (from `lib/navigation/index.ts`) plus `TopBar` (title, notifications, messages, identity, scope indicator) and a content region, and (c) adds an isolated `app/dashboard/dashboard.css` following the calm+powerful VEIL design tokens. Then replace `app/dashboard/page.tsx` with the role-adaptive Member overview (stat cards from the context, community panels), keeping the other agent's login/auth files untouched and running `npx tsc --noEmit` to verify.

*Subsequent stages (in order): shared dashboard components → role-specific overview pages → API routes with server-side scope guards → Prisma schema + migrations matching section 9 → real session/auth integration.*

---

## Verification
- Typecheck: `npx tsc --noEmit` — **passes**.
- Locked files: `app/page.tsx`, `app/login/*`, `app/globals.css`, `package.json`, `package-lock.json` — **unmodified**.
- Packages installed: **none**.