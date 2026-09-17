# AUDIT — THE BROTHERHOOD OF LIGHT // VEIL PORTAL

**Audit-only review** of the entire application at `fraternity_portal_starter`.
No files were modified and no database records were created or destroyed during this audit.

**Date completed:** 16 September 2026
**Auditor basis:** Full source review — every route, API handler, library module, Prisma schema, migration, and script; read-only inspection of the live SQLite database.

---

## Scope and Ground Rules (reaffirmed)

1. This is an **audit and redesign blueprint only**. No code was changed and none will be changed during this review.
2. The database was **freshly reset** at the start. It holds **no fabricated historical registry**, no synthetic members, and no synthetic chamber history.
3. The historical registry (BOL-1 … BOL-2982), the synthetic member generator, and the synthetic chamber-history generator are **deliberately excluded** from any recommendation. They must not be re-introduced.
4. The portal must be experienced as **a serious, private, sacred institution** — not a SaaS dashboard, a social app, or a game.

---

## A. Application Map (Full Inventory)

### A.1 Stack

| Layer | Choice |
|---|---|
| Framework | Next.js **14.2.35** (App Router), React **18.3.1**, TypeScript (strict) |
| Data | Prisma **7.10.0** + `@prisma/adapter-better-sqlite3` (SQLite: `dev.db`), production target **PostgreSQL** |
| Auth | `argon2` (0.45.1), HMAC-signed session cookies (WebCrypto) |
| Scripting | `tsx`, `node:sqlite`-style verification scripts |
| Client generation | Prisma `prisma-client` → `lib/generated/prisma` |

### A.2 Public & Auth Routes

| Route | Module | Purpose |
|---|---|---|
| `/` | `app/page.tsx` | Veil entrance — static ceremonial landing (ENTER THE VEIL). |
| `/login` | `app/login/page.tsx` | Multi-field login (Member ID/email + password). |
| `/login/components/VeilEmblem.tsx` | — | Reusable ceremonial SVG emblem (Seal-of-style geometry). |

### A.3 Dashboard (guest-gated)

`app/dashboard/layout.tsx` performs the **server-side session gate** (`getSessionPayload()` → `redirect('/login')`) and mounts `DashboardShell` → `SessionProvider` + `Sidebar` + `TopBar` + main. `middleware.ts` additionally guards `/dashboard/:path*` with the same cookie.

| Route | Module | Status |
|---|---|---|
| `/dashboard` | `page.tsx` | Overview: role-aware hero, stats, Hierarchy, Quick Actions, Announcements, Activity, Assemblies, MemberPanels (MY MEMBERSHIP / BROTHERHOOD / COMMUNITY / CURRENT STATION). |
| `/dashboard/messages` | `messages/page.tsx` | **Brotherhood Chamber** — full DB-backed messaging client. |
| `/dashboard/assemblies` | `assemblies/page.tsx` | Register of convocations (calls, chambers, records, sealed, archive). |
| `/dashboard/assemblies/[identifier]` | `assemblies/[identifier]/page.tsx` | Single-assembly chamber detail. |
| `/dashboard/archives/history` | `archives/history/page.tsx` | Static fictional canon — Brotherhood History. |
| `/dashboard/archives/records` | `archives/records/page.tsx` | Static fictional register (BOL-ARCH-001…006). |
| `/dashboard/archives/symbols` | `archives/symbols/page.tsx` | Static SVG sigil gallery. |
| `/dashboard/codex/what-we-serve` | `codex/what-we-serve/page.tsx` | Static doctrine page. |
| `/dashboard/codex/what-we-believe` | `codex/what-we-believe/page.tsx` | Static doctrine page. |
| `/dashboard/codex/secret-rules` | `codex/secret-rules/page.tsx` | Static doctrine page. |
| `/dashboard/codex/the-oath` | `codex/the-oath/page.tsx` | Static ceremonial oath page. |
| `/dashboard/codex/conduct` | `codex/conduct/page.tsx` | Static doctrine page. |
| `/dashboard/inner-chamber` | `inner-chamber/page.tsx` | **Restricted threshold** — currently denies all (authorization record absent by design). |
| `/dashboard/membership` | `membership/page.tsx` | Formal registry dossier from the **live DB member record**. |
| `/dashboard/path` | `path/page.tsx` | Recorded membership journey (2019 → 2026), from the live DB record. |
| `/dashboard/profile` | `profile/page.tsx` | Personal identity record (read-only where backend fields do not exist). |
| `/dashboard/settings` | `settings/page.tsx` | Account/sign-out. Read-only stance for unpersisted preferences. |
| `/dashboard/[...slug]` | `page.tsx` | **Catch-all placeholder**: "THIS CHAMBER IS BEING PREPARED" for all nav items without a page. |

### A.4 Dashboard components (`app/dashboard/components/`)

`Sidebar`, `TopBar`, `DashboardShell`, `StatCard`, `HierarchyPanel`, `QuickActions`, `AnnouncementsPanel`, `ActivityPanel`, `AssembliesPanel`, `MemberPanels`, `EmptyState`.

### A.5 API routes

| Route | Method | Purpose |
|---|---|---|
| `/api/auth/login` | POST | DB-first argon2 auth + **dev-gateway fallback**. |
| `/api/auth/logout` | POST/GET | Clears session cookie. |
| `/api/messages/conversations` | GET/POST | List / open conversations. |
| `/api/messages/conversations/[id]` | GET | Conversation detail. |
| `/api/messages/conversations/[id]/members` | POST/DELETE | Add / remove members. |
| `/api/messages/conversations/[id]/messages` | GET/POST | Cursor-paginated thread / send message. |
| `/api/messages/conversations/[id]/messages/[id]/moderate` | POST | Withdraw (MODERATED) — owner/admin. |
| `/api/messages/conversations/[id]/messages/[id]/report` | POST | Report (audit). |
| `/api/messages/conversations/[id]/read` | POST | Mark read (MessageRead rows). |
| `/api/messages/directory` | GET | Member directory search (sanitized). |
| `/api/messages/notifications` | GET | Unread summary + notification list. |
| `/api/messages/notifications/read` | POST | Clear badges. |
| `/api/assemblies/[identifier]/respond` | POST | Record the reply to a summons. |

### A.6 Libraries

- `lib/db.ts` — global Prisma client via better-sqlite3 adapter.
- `lib/member-name.ts` — `memberInitials`, `memberPhotoPath` (`/members/{id}.jpg`).
- `lib/membership-journey.ts` — canonical journey reference (began 2019 · approval 2026 · full membership 2026), stage builder.
- `lib/types/index.ts` — Roles, OrganizationalPositions, UserScope, Permissions (~50), DashboardContext.
- `lib/navigation/index.ts` — per-role navigation config (~9 roles).
- `lib/auth/*` — session crypto, session provider/server, authorization matrix + scope authority, role labels, member-record→session mapping, dev-users, inner-chamber gate.
- `lib/messages/chamber-service.ts` (≈1040 lines) + `lib/messages/types.ts`.
- `lib/assemblies/access.ts`, `constants.ts`, `service.ts` (≈585 lines), `types.ts`.

### A.7 Schema & Migrations

5 migrations:
1. `20260914181433_init_member_registry`
2. `20260915044606_add_brotherhood_chamber`
3. `20260915045339_add_notification_timestamp`
4. `20260915050000_add_membership_journey`
5. `20260915163852_add_veil_assemblies`

Tables (from `prisma/schema.prisma` + live DB): `Member`, `AuthAccount`, `Conversation`, `ConversationMember`, `Message`, `MessageRead`, `MessageAttachment`, `Notification`, `ConversationAudit`, `MessageReport`, `Assembly`, `AssemblyMember`, `AssemblyAttendance`, `AssemblyRecord`, `AssemblyDocument`.

### A.8 Current database state (read-only)

All tables **empty (0 rows)**. No members, no accounts, no conversations, no assemblies. Confirms the clean reset. `public/members/bol-1385.jpg` exists (any photo must be marked authorized).

### A.9 Seed (`prisma/seed.ts`)

Creates **only BOL-1385** (Dankwah Kwame Foster) — LIFE MEMBER / ACTIVE / MEMBER / Ghana, journey 2019→2026, argon2 hash from `VEIL_BOL1385_PASSWORD` env only. All other fields NULL. Refuses to run without the env var.

---

## B. Navigation

### B.1 Implementation
`lib/navigation/index.ts` defines per-role groups; `Sidebar` filters by permissions and renders. Roles: `AREOPAGUS`, `COUNTRY_INITIATOR`, `PREFECT`, `DIRECTORATE_OFFICER`, `MINERVAL_ASSEMBLY_OFFICER`, `INSINUATOR`, `MEMBER`, `CANDIDATE`, `SYSTEM_ADMINISTRATOR`.

### B.2 Member navigation (the realistic first-person view today)
```
MY VEIL            Overview
THE BROTHERHOOD    Announcements • Assemblies • Messages • Documents
MY JOURNEY         My Membership • My Profile • The Path
THE CODEX          What We Serve • What We Believe • Secret Rules •
                   The Oath • Conduct & Discipline
THE ARCHIVES       Brotherhood History • Symbols & Sigils • Historical Records
INNER CHAMBER      Restricted Access
ACCOUNT            Settings
```

### B.3 Findings
- **Many destinations are placeholders.** `/dashboard/announcements`, `/dashboard/documents`, `/dashboard/members`, `/dashboard/candidates`, `/dashboard/organizations/…`, `/dashboard/appointments`, `/dashboard/promotions`, `/dashboard/reports`, `/dashboard/security`, `/dashboard/users`, `/dashboard/actions`, `/dashboard/mentor` all resolve to the `[...slug]` "being prepared" chamber. The menu promises more than exists.
- **IA is sound in tone** but mixes *destinations that exist* with destinations that do not; this undercuts the sense of a finished, solemn institution.
- Officer/Areopagus menus are much richer (administration, governance, oversight) — none yet implemented as pages.
- Path-scale observations under **Section H** (proposed IA).

---

## C. Member Experience (Journey Walkthrough)

1. **Entrance (`/`)** — static; strong veil/civilization tone; instantaneous.
2. **Login** — fieldset with Member ID or email + password; argon2 DB-first; error handling solid; no CAPTCHA/rate-limiting (dev fallback documented).
3. **Dashboard shell** — sidebar + topbar; session-aware; "DEVELOPMENT GATEWAY" badge when using dev identities.
4. **Overview** — role-aware hero + stats; empty states are dignified ("AWAITING DATABASE", "NO RECORDS AVAILABLE"); member-specific panels show record view from session or live DB.
5. **Membership / Path / Profile / Settings** — all server components pulling the live DB record where available; read-only for anything not persisted; no fake toggles.
6. **Brotherhood Chamber** — full product; see Section D.
7. **Assemblies** — genuine register + response flow; see Section E.
8. **Archives / Codex / Inner Chamber** — static ceremonial fiction + a real access gate that currently denies.

**Net:** the shell, tone, and live-record behavior are excellent. The weak spots are the placeholder routes and the still-dormant parts of the Chamber/Assemblies surfaces (empty register visuals). Those should be treated as "hallowed empty states," not "under construction."

---

## D. The Brotherhood Chamber — Deep Audit

### D.1 Model fidelity
- Conversation types: `PRIVATE · BROTHERHOOD · ASSEMBLY · OFFICIAL · RESTRICTED`.
- Conversation roles: `OWNER | ADMIN | MEMBER`; status `ACTIVE | ARCHIVED`; message status `NORMAL | MODERATED | REMOVED`.
- `MessageRead` = read receipts; `Notification` = presentation layer for unreads; `ConversationAudit` + `MessageReport` = moderation trail.
- Soft removals preserve audit integrity.

### D.2 Server service (`lib/messages/chamber-service.ts`)
- **Access rule**: every op re-resolves membership via `ConversationMember` (`isRemoved = false`) and conversation `ACTIVE` status. Sender/reporter identity is always taken from the verified session.
- Presence: `touchActivity()` writes `lastActiveAt` throttled to 2 min; PRESENCE_WINDOW_MS = 5 min.
- Directory: searchMembers (case-insensitive; sanitized MemberSummary — no email/phone/address), excludes self.
- Creation: `findOrCreatePrivateConversation` (dedup) / `createGroupConversation` (ACTIVE-only members, max 200, title required; ASSEMBLY+OFFICIAL require officer role).
- Messages: cursor pagination, body ≤ 4000 chars, reply-to validation, OFFICIAL is read-only for MEMBER.
- Read state: markConversationRead caps 500 rows; unread counts derive from `MessageRead`.
- Moderation: `moderateMessage` (owner/admin only, sets MODERATED + deletedAt), `reportMessage` (open report, dedup).
- Notifications: `getUnreadSummary`, `getNotifications`, `markNotificationsRead`.

### D.3 API writers
All route handlers call `requireRequester()` (401 otherwise); errors map through `chamberError`. Conversation detail returns 404 for non-members (existence is not leaked).

### D.4 Client (`app/dashboard/messages/`)
`BrotherhoodChamber` (session + loadOverview + 3 sub-widgets). Polling: conversations 8 s, thread 4 s. `ChamberList`, `ChamberThread`, `ChamberDirectory` (search+profile), `NewConversation` (type gate by role, member picks, "ALREADY EXISTS" dedup, server re-verifies everything). `chamber.css` 1418 lines.

### D.5 Findings / recommendations
- **Excellence:** end-to-end security posture is sound; presence is real (no fake green dots); moderation and reports exist; cursor pagination correct; member directory privacy-respecting.
- **Read receipts** exist and are exposed as `readBy`/`readByCount`, but the thread UI does not yet render them distinctly — surface "READ · <N>"/per-participant states with ceremonial language.
- **Notification UX** exists at the API level; a bell/notices list in the shell would complete the loop (today `unread` only shows in the list header).
- **Polling** is fine for a private institution; keep it (fake "real-time" isn't sacred).
- **Metric/scale note:** `getConversationsForMember` does per-conversation lastMessage + unreadCount queries (acceptable at these volumes; the code itself flags this). No action required now.
- **Suggested thresholds:** consistently cap conversation list (currently `take:100`), message page `limit` 50/200, keep max group 200.

---

## E. The Assemblies — Audit

### E.1 Canonical structures (`lib/assemblies/constants.ts`)
- Six classifications; lifecycle `CALLED → ANNOUNCED → GATHERED → OPENED → IN SESSION → CLOSED → SEALED → ARCHIVED`; five access levels `BROTHERHOOD | COUNTRY | INVITED | RESTRICTED | INNER`.
- Access control rules in `access.ts`: officers can view all; otherwise ACTIVE status, presiding/issuing members, country match for COUNTRY, seat requirements for INVITED/RESTRICTED/INNER; response window only in CALLED/ANNOUNCED.

### E.2 Service (`lib/assemblies/service.ts`)
- `getAssembliesIndex` (server-filtered, groups into NEXT/CALLS/CHAMBERS/RECORDS/SEALED/ARCHIVE), `getAssemblyChamber` (seats + attendance + record + documents, authorization checks), `respondToAssembly` (window/authorization enforced server-side; upsert of AssemblyMember seat).
- Integrity rule: the service **never creates an Assembly**; it reads genuine records and records replies.

### E.3 Routes
- Register page (rich ceremonial layout, empty-state edicts are excellent).
- Chamber page: single assembly dossier.
- `CallResponse` client component: records WILL_ATTEND / CANNOT_ATTEND via `/api/assemblies/[identifier]/respond`.

### E.4 Findings / recommendations
- **Excellent foundation.** The honest empty register is exactly right for a sacred institution.
- **No officer "call/convoke" authoring route exists yet.** A real institution eventually needs an officer-only flow to open an assembly (with assemblyNumber issuance), grant seats, and later record attendance + seal the record. Design it as a deliberate, ceremonial, officer-only workflow — NOT a CRUD grid.
- Discussion-chamber linking (`discussionConversationId`) is modeled but not wired; connect it via the Chamber when authoring ships.
- Presence record (`AssemblyAttendance`) is modeled; keep it officer-entered, never automatic.

---

## F. Membership Models & UI

### F.1 Member record (`prisma/schema.prisma`)
Required: `memberId` (BOL-n), first/middle/last, `fullName`, `membershipType`, `status`, `role`, `country`. Optional (NULL until real): `countryInitiator`, journey years, `initiationDate`, `prefecture`, `directorate`, `minervalAssembly`, `cell`, `insinuatorName`, `email`, `phone`, `address`. `lastActiveAt` for presence only. Relations: auth (1:1), chamber, assemblies.

### F.2 Surfacing
- `memberToSessionUser` (database-first session build, scope defaults COUNTRY).
- `MemberRecordView` (DB or session) drives Overview, Membership, Path, Profile panels with tasteful "NOT YET ASSIGNED" states.
- Membership journey canonical stage builder (2019 → 2026).

### F.3 Findings / recommendations
- The model intentionally does not fabricate the 2,981 historical members — **correct**.
- `normalizeRole` falls back to MEMBER for unknown roles — safe.
- `AuthAccount` is 1:1; good for argon2; extend later with password-change flow, recovery, MFA only when a real institution asks.
- **Journey persists on the member row** (years). The redesign should keep the journey as a *derived* presentation, never duplicate history in UI constants beyond the canonical reference.

---

## G. Sacred-Institution Design (Tone & Aesthetic)

### G.1 Current system
- Dark: `#070707` base, text `#e8e1cf`, gold `#b9a46a`, Georgia serif; hairline rulers; the Wordmark "VEIL"; disciplines like "THE CALL IS ISSUED. THE CHAMBER IS OPENED. THE RECORD REMAINS."
- `globals.css` (832 lines), `dashboard.css` (**7,875 lines** — monolithic), `chamber.css` (1,418), `assemblies.css` (1,514).

### G.2 Findings
- The **voice is already a sacred institution** — confident, restrained, consistent. Keep it.
- **`dashboard.css` monolith is the single largest maintainability hazard** (7.8k lines). Split by pattern (shell/sidebar/topbar/hero/panels/stats), while preserving tokens in one place.
- Introduce a small **design-token layer** (CSS custom properties) — colors, spacing, radii, typography scale — so every new surface stays disciplined.
- **Visual furniture is sparse but effective**: hairline rules, corner glyphs (◇ ◆ ◈), locklines. Reuse this "chamber grammar" everywhere; standardize a corner/rule/frame component set.
- **Placeholder pages ("being prepared") should not sound provisional.** Replace with ceremonial "NOT YET OPEN / THE RECORD IS NOT YET ENTERED" language — matching the assemblies empty-state edicts — or within the same sentence set expectations of what will come.

---

## H. Proposed New Menu & Page IA

Goal: everything links to a real surface; nothing reads as SaaS.

**Member (this is the spine):**

```
MY VEIL            Overview
MY JOURNEY         My Membership · The Path · My Profile · Settings
THE BROTHERHOOD    Assemblies · Brotherhood Chamber (Messages) · The Codex
THE ARCHIVES       Brotherhood History · Historical Records · Symbols & Sigils
THE INNER CHAMBER  (threshold page — stays gated)
```

- Move Codex pages under one "THE CODEX" landing (choose one page as the Codex reading chamber or a small index).
- Announcements → becomes part of Overview (or a real module later — see L). Do not advertise Documents until real.
- Collapse profile/settings into the account region so "ACCOUNT" isn't a lone orphan.

**Officers (Areopagus/Prefect/Directorate/Assembly/Insinuator/Country Initiator):**
Keep the existing group skeleton (ADMINISTRATION / GOVERNANCE / COMMUNICATION / OVERSIGHT) but gate each item behind a real page; ship in blueprint order (L/M). Until pages exist, keep the item listed but route to the ceremonial "not yet entered" chamber — never to a broken URL.

**System Administration:** purely technical (users/security/audit); keep distinct from institutional governance.

---

## I. Security & Privacy

### I.1 What is correct (verified)
- Server-side session gate on layout + middleware; every API re-authorizes from the cookie.
- `argon2` password hashing; no plaintext; seed refuses without env password.
- HMAC-signed session (8 h TTL, constant-time verify, cookie `httpOnly` + `sameSite=lax`, `secure` in prod).
- **No** email/phone/address plumbed into member directory DTOs; photo exposure only when a file exists.
- Hard outer limits (group 200, message 4000, counts capped), per-message pagination, no client-trusted identity.
- Dev gateway isolated in `lib/auth/dev-users.ts` + header `X-VEIL-DEV-GATEWAY: 1`.

### I.2 Findings / hardening
1. **Dev gateway must be removed before production** (`app/api/auth/login/route.ts` fallback; `dev-users.ts`; `DEV_FALLBACK_SECRET` in session-crypto). Keep them only for the starter stage.
2. Login has **no rate limiting / lockout**. Add a modest per-IP + per-account backoff (or at minimum a small server-side delay) before real use.
3. `VEIL_SESSION_SECRET` must be a strong, unique production value (dev fallback is static).
4. **Photos** under `public/members/` are publicly reachable; acceptable now, but an authorized-photo pipeline should route through a protected handler or signed URL in production.
5. Inner Chamber gate is a hard deny — keep it as the single seam; never render secret content client-side.
6. No arbitrary file upload endpoint exists — good. Do not add one without a storage pipeline.
7. Consider adding an explicit instrumented **security-event log** (login success/failure, moderation, reports) reusing `ConversationAudit` style tables when the oversight module ships.

---

## J. Database ↔ Application Alignment

### J.1 Verified alignment
- Schema tables ↔ live DB tables are 1:1 (15 tables, all empty).
- Migrations are sequential and apply clean (`prisma` client generated from the same schema; `prisma.config.ts` reads `DATABASE_URL`).
- Every page that needs a member reads the DB (membership/path/profile/settings via `memberRecordViewFromDb`), falling back to session where server components are static.
- Presence and unread counts are derived from real tables — no speculative columns.

### J.2 Gaps / drift to watch
- **Navigation config references modules with no model or page** (members/candidates/organizations/appointments/promotions/reports/security/users). The DB has no tables for organizations (prefectures, directorates, assemblies-as-org, cells), appointments, or announcements-as-content. These are the next schema increments, not current defects.
- Assemblies belong to the register only; no authoring table gap beyond what's modeled (seats/attendance/records/documents all exist).
- Inner-chamber authorization has **no backing table** — that is by design (a future authorization system will own a grant record).
- `MessageAttachment` extends messages but has no upload route (extension point only) — matches "no unrestricted upload yet".

### J.3 Production note
Provider is SQLite now; target is PostgreSQL. The code is already adapter-driven (`PrismaBetterSqlite3`), and migrations are dialect-safe so far (raw SQL in `searchRows` uses SQLite `LIKE`/`COLLATE NOCASE` — **must be reviewed** when switching to Postgres, and `createMany`/`upsert` loops noted in the service are SQLite-specific workarounds).

---

## K. Mobile / Responsive

- Shell is responsive: sidebar slides as an overlay (`dash-sidebar-overlay`), topbar mobile menu, single main column.
- Large ceremonial pages (archives/codex/assemblies) are fluid; type scales with `clamp`.
- `dashboard.css` monolith must be **refactored responsively** as part of the token pass (currently breakpoints are inline across thousands of lines).
- Chamber grid (list + thread) — verify two-pane → single-pane behavior; hidden risk because CSS is monolithic.

---

## L. Priorities

### L.1 MUST (stability & integrity)
1. Remove/hide dev gateway & dev fallback secret behind env (`SESSION_SECRET`) before any real access.
2. Split `dashboard.css` into token + pattern files; introduce design tokens (CSS custom props).
3. Rework placeholders to ceremonial "NOT YET ENTERED" language; hide navigation items whose pages don't exist (or gate them).
4. Add login rate-limiting/backoff.

### L.2 SHOULD (complete the institution)
5. Officer-only Assembly authoring flow: convoke, seat, record attendance, seal record (ceremonial workflow).
6. Wire `discussionConversationId` (assembly ↔ chamber conversation).
7. Chamber read-receipt display + in-shell notifications bell.
8. A small "THE CODEX" reading-chamber landing consolidating the five doctrine pages.

### L.3 FUTURE (only with real records)
9. Real member import via an officer/registrar channel — **never synthetic generation**.
10. Announcements/Documents as real modules only when genuine content exists; organizations (prefectures/directorates/cells) after real structure is recorded.
11. Inner-chamber authorization grants + password recovery + audit/security module.

---

## M. Final Blueprint (Ordered Redesign)

1. **Design-token & CSS refactor** (tokens → shell → components) without changing visuals.
2. **Placeholder-page language overhaul** + navigation truth (only real pages advertised).
3. **Production-auth hardening**: drop dev gateway, enforces secrets, rate limit.
4. **Ceremonial empty-state pass** across Overview/Chamber/Assemblies (the register is empty; treat it as hallowed, not broken).
5. **Officer assembly authoring** (+ seat/attendance/record/seal) with chamber wiring.
6. **Chamber polish**: read receipts, notification bell, reply affordance.
7. **Themes & institutional furniture**: standardized Rule/Lockline/Frame/Corner components.
8. **Future modules only when real records demand them.**

---

## Final Statements

**What was built well (preserve it):**
- The institution's voice — restrained, ceremonial, consistent across landing, login, dashboard, archives, and codex.
- DB-first authentication with argon2 and a signed session, with the dev gateway cleanly isolated and visibly flagged.
- The Brotherhood Chamber: genuinely database-driven, presence, read state, moderation, reports, private-by-design directory.
- The Assemblies register and its honest, dignified empty states, plus real server-side access control.
- Membership/path/profile/settings that read from the live record and never invent data.
- A schema that refuses to fabricate the missing.

**What needs redesign:**
- The 7,875-line `dashboard.css` monolith and the related monolithic chamber/assembly styles.
- Placeholder routes that undermine the sense of a finished institution (tone and truth of navigation).
- Dev-gateway reliance for non-MEMBER roles once real officers arrive.
- Login without any rate-limitting before real use.
- Tighten the "presence of a real user" feel without faking real-time.

**What is missing (in order of institutional value):**
- Officer assembly authoring lifecycle (convoke → seat → record → seal).
- Read-receipt & notification presentation in the chamber.
- A Codex reading-chamber landing; organizations discipline but no pages.
- Production auth hardening and secrets discipline.

**Proposed final navigation (member spine):**
`MY VEIL Overview · MY JOURNEY [My Membership, The Path, My Profile, Settings] · THE BROTHERHOOD [Assemblies, Brotherhood Chamber, The Codex] · THE ARCHIVES [Brotherhood History, Historical Records, Symbols & Sigils] · THE INNER CHAMBER [threshold]`

**Implementation phases:**
Phase 0 — tokens/CSS + placeholder language + nav truth. Phase 1 — auth hardening (dev-gateway removal, rate limits, secrets). Phase 2 — ceremonial empty states + read receipts + notifications. Phase 3 — officer assembly authoring + assembly↔chamber wiring. Phase 4 — future real modules only as genuine records require.

---

*Final attestation: read-only audit. No source or database records were modified. The synthetic member/chamber generators and the historical registry remain excluded from the blueprint by design.*