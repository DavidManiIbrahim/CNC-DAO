# CNC DAO — Architecture

This document describes how the CNC DAO app is built today, how the pieces fit
together, and what's still mocked vs. real. It's the reference for anyone
extending the app — read this before adding features or wiring new backends.

---

## 1. High-level overview

CNC DAO is a regenerative-finance web app: people register real trees, Nature
Heroes verify them, and (eventually) each verified tree becomes an on-chain
proof-of-stewardship NFT on Solana.

The app is a **Next.js 14 (App Router) frontend** with a **Convex backend**
(database + server functions). Solana/on-chain work is planned but not wired.

**Current data flow:**

```
Browser (Next.js client components)
   │  useMutation / useQuery (convex/react)
   ▼
Convex server functions (convex/*.ts)
   │  read/write
   ▼
Convex database (tables defined in convex/schema.ts)
```

The browser keeps a thin **session cache** in localStorage
(`cncdao_mock_user`) so the UI can render instantly and gate role-based pages.
The authoritative record lives in Convex.

---

## 2. Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router), React 18 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Backend / DB | Convex (`convex` npm package) |
| Social auth | NextAuth (Google) |
| Maps | `leaflet` / `react-leaflet` (OSM + Esri satellite) |
| Globe | `d3-geo`, `topojson-client`, `world-atlas` |
| Chain | Solana (planned, not wired) |
| Deploy | Vercel (auto-deploy on push to `main`) |

---

## 3. Directory structure

```
app/
  layout.tsx                 Root layout: fonts + Convex + NextAuth providers
  page.tsx                   Homepage (hero, how-it-works, NFT, registry)
  map/page.tsx               Global map (2D registry + OSM + globe)
  tree-reg/page.tsx          Tree registration form (multi-step)
  nature-heroes/page.tsx     Nature Heroes info
  nature-heroes/apply/page.tsx  Nature Hero application form  → Convex
  campaigns/page.tsx         Browse campaigns  → Convex query
  campaigns/new/page.tsx     Create campaign (role-gated)  → Convex mutation
  connect-wallet/page.tsx    Wallet connect (demo)  → Convex get-or-create user
  auth/page.tsx              Email/password login + register  → Convex
  contact/page.tsx           Contact form (not yet wired)
  privacy-policy/page.tsx
  dashboard/
    page.tsx                 Overview (stats, quick links, recent trees)
    profile/page.tsx         Profile edit (avatar/name/bio)  → Convex
    badges/page.tsx          Badges view
    verification/page.tsx    Validation queue + application review  → Convex
    users/page.tsx           Admin user management  → Convex
providers/
  ConvexProvider.tsx         Lazy-loads the Convex client provider
  ConvexClientInner.tsx      Creates ConvexReactClient from NEXT_PUBLIC_CONVEX_URL
components/
  Header.tsx / MobileNav.tsx / Footer.tsx
  WalletButton.tsx           Connect/connected-state button (reads session cache)
  DashboardShell.tsx         Authenticated layout (sidebar + top bar)
  TreeMap.tsx / OSMTreeMap.tsx / DotGlobe.tsx   Tree visualizations
  Icons.tsx / Reveal.tsx / FlipCard.tsx / Visuals.tsx / ParticleSphere.jsx
convex/
  schema.ts                  Convex tables + indexes
  users.ts                   Auth + user/profile/admin functions
  trees.ts                   Tree registration + verification queue
  natureHeroes.ts            Nature Hero applications + review
  campaigns.ts               Campaign CRUD
  _generated/                Generated API types (run `npx convex codegen`)
lib/
  mockAuth.ts                Browser session cache (localStorage) + helpers
  useAuth.ts                 useIsAuthenticated() hook
  registeredTrees.ts         Seed trees + legacy localStorage tree helpers
  badges.ts                  Badge computation (from session + local trees)
```

---

## 4. Convex backend

### 4.1 Client wiring

`app/layout.tsx` wraps the whole app:

```
<ConvexClientProvider>        ← lazy-loads Convex so it can't crash prerender
  <SessionProvider>           ← next-auth Google session
    {children}
```

`providers/ConvexProvider.tsx` loads `ConvexClientInner.tsx` client-side only.
This matters because pages using `useMutation`/`useQuery` throw if mounted
before the Convex client exists, and server prerendering must not touch
browser-only code.

`NEXT_PUBLIC_CONVEX_URL` must be set in `.env.local`. If it's missing the app
shows a configuration screen instead of crashing.

### 4.2 Schema (`convex/schema.ts`)

- **`users`** — one row per person. Identity via `email` (email auth) and/or
  `walletAddress` (wallet connect). Optional `name`, `displayName`, `bio`,
  `avatar`. `role` gates the UI:
  `user | nature_hero_pending | nature_hero | admin`. Indexed by `by_email`,
  `by_walletAddress`.
- **`trees`** — submitted trees. `walletAddress` (owner), `name`, `species`,
  `location`, `lat`, `lng`, `status: pending | verified | minted`,
  `createdAt`. Indexed by owner and by status.
- **`natureHeroApplications`** — apply form submissions. `userId` +
  `walletAddress`, applicant details, `status: pending | approved | rejected`.
  Indexed by status and by userId.
- **`campaigns`** — planting campaigns. `name`, `region`,
  `participantLimit`, `description`, `createdBy`, `joined` counter,
  `createdAt`.

### 4.3 Server functions

**`convex/users.ts`**
- `register(email, password, name?)` — PBKDF2-hashed email signup.
- `login(email, password)` — password check, returns public user.
- `get(userId)` — fetch a user.
- `connectWallet(walletAddress)` — demo get-or-create a Convex user for a
  wallet address. Replace the fake address with a real wallet adapter later.
- `updateProfile(userId, displayName?, bio?, avatar?)` — profile edits.
- `listUsers(adminId)` — admin-only user list.
- `setUserRole(adminId, userId, role)` — admin-only role change.
- `removeUser(adminId, userId)` — admin-only removal (can't self-remove).

**`convex/trees.ts`**
- `register(walletAddress, name, species, location, lat, lng)` — creates a
  tree with `status: "pending"`.
- `listMine(walletAddress)` — a user's trees.
- `listPending(verifierId)` — Nature Hero/Admin verification queue.
- `updateStatus(verifierId, treeId, status)` — approve/mark tree.

**`convex/natureHeroes.ts`**
- `apply(userId, fullName, email, cityRegion, country, motivation, experience?)`
  — inserts a `pending` application and flips the user's role to
  `nature_hero_pending` (prevents duplicate pending applications).
- `listApplications(adminId)` — admin-only list.
- `setApplicationStatus(adminId, applicationId, status)` — approve/reject;
  approving promotes the applicant to `nature_hero`.

**`convex/campaigns.ts`**
- `create(creatorId, name, region, participantLimit, description)` — only
  `nature_hero`/`admin` callers; server-side role check.
- `list()` — all campaigns.

Server functions gate by role **on the server** (`requireAdmin` /
`requireVerifier` helpers), so roles can't be forged from the client.

---

## 5. Identity & session model

There is **no full authentication system yet**. Identity is a two-part model:

1. **Convex `users` documents** are the source of truth (profile fields,
   role, application status).
2. **localStorage session cache** (`lib/mockAuth.ts`, key
   `cncdao_mock_user`) is a mirror that the UI reads synchronously so it can
   render instantly and gate role-based pages.

The cache stores `{ userId, walletAddress, role, displayName?, bio?,
avatar?, joinedAt }`. `userId` is the Convex document id — this is the link
between the browser session and the database. After any mutation the page
writes the fresh result back to the cache and dispatches `mockuser:change`.

**How a session is created:**
- **Wallet connect (demo):** `connect-wallet/page.tsx` calls
  `api.users.connectWallet` with a generated demo address; Convex
  get-or-creates the user; the returned `userId` is cached.
- **Email auth:** `auth/page.tsx` calls `api.users.register`/`login`; the
  returned `_id` is cached with `walletAddress = "email:..."`.
- **Google:** NextAuth session; the app falls back to the cached mock user.

`lib/useAuth.ts` — `useIsAuthenticated()` returns true when there's a Google
session OR a cached mock user. Note: this is *not* a security boundary; real
wallet signature auth is future work.

---

## 6. Frontend flows

### 6.1 Header

`components/Header.tsx` renders the sticky site header on public pages and
links (How It Works, Global Map, Verification, Campaigns, NFT, Nature
Heroes). `components/WalletButton.tsx` shows either "Connect Wallet" (→
`/connect-wallet`) or the signed-in avatar/menu (dashboard, profile, sign
out/disconnect). `components/MobileNav.tsx` is the mobile hamburger menu.
Authenticated pages that need a persistent sidebar use
`components/DashboardShell.tsx` instead of the site `Header`.

### 6.2 Form → Convex examples

**Nature Hero application** (`app/nature-heroes/apply/page.tsx`):
controlled fields → `api.natureHeroes.apply({ userId, ... })` → on success the
cached user's role becomes `nature_hero_pending` and the success screen
shows. Unauthenticated users are redirected to `/connect-wallet`.

**Profile edit** (`app/dashboard/profile/page.tsx`):
avatar/display name/bio → `api.users.updateProfile({ userId, ... })` → result
mirrored back into the session cache.

**Campaign creation** (`app/campaigns/new/page.tsx`):
role-gated on the client (must be `nature_hero`/`admin`) and **enforced again
server-side** by `api.campaigns.create`. `app/campaigns/page.tsx` lists
campaigns via `api.campaigns.list`.

**Tree registration** (`app/tree-reg/page.tsx`):
multi-step form; final submit calls `api.trees.register(...)`, creating a
`pending` tree that appears in the Nature Hero validation queue.

### 6.3 Role-gated views

- `/dashboard/verification` — validation queue (`api.trees.listPending`) for
  `nature_hero`/`admin`; application review (`api.natureHeroes.listApplications`)
  for `admin`.
- `/dashboard/users` — `api.users.listUsers` + `setUserRole`/`removeUser`,
  admin-only (server-enforced).
- `/campaigns/new` — only `nature_hero`/`admin`.

---

## 7. Known mocks / future work

| Area | Current state | Needs |
|---|---|---|
| Wallet connect | Demo: generated address → Convex user | `@solana/wallet-adapter-react` + signed-message proof |
| Session | localStorage cache; UI-readable, not server-verified | Real auth provider (Convex auth or wallet session) |
| Tree maps/globe (`TreeMap`, `OSMTreeMap`, `DotGlobe`) | Read seed + legacy localStorage trees | Read from `api.trees.listMine` / a public tree query |
| Badges (`lib/badges.ts`) | Computed from session + local trees | Compute from Convex history |
| Tree verification | Single approval flips status | Real 2-of-2 independent Nature Hero consensus |
| Tree photos | Placeholder upload boxes, no capture | File upload (IPFS) + photo URLs in `trees` |
| Contact form (`/contact`) | Sets local "sent" state only | `contactMessages` table + mutation |
| NFT minting | Button inert | Mint flow once verification exists |
| Homepage stats | Hardcoded numbers | Live counts from Convex |
| `registeredTrees.ts` | Legacy localStorage helpers for maps | Remove once maps read Convex |

---

## 8. Development commands

```bash
npm install
npm run dev                # http://localhost:3000
npx convex dev             # run Convex locally (needs Convex account/project)
npx convex codegen         # regenerate convex/_generated after changing schema/functions
npm run lint               # next lint
npx tsc --noEmit           # strict type check (matches what `next build` runs)
npm run build              # production build (what Vercel runs)
```

Convex note: after editing `convex/schema.ts` or adding a function file, run
`npx convex codegen` (or `npx convex dev`) so the generated `api`/types used
by the frontend include the new tables/functions.
