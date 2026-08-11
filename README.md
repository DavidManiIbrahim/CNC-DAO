# CNC DAO

A regenerative-finance app on Solana that turns real, human-verified tree planting into a permanent on-chain record. Every submission is confirmed by two independent Nature Heroes before it's written on-chain and minted as a proof-of-stewardship NFT.

**Live:** https://naturre.xyz
**Frontend reference (design source):** https://cncdao.framer.website

---

## Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Deployment:** Vercel
- **Chain:** Solana (integration pending — see "Where backend/contract work plugs in")

## Project structure

```
app/
  layout.tsx              Root layout, font loading
  page.tsx                 Homepage — all sections
  globals.css              Tailwind entrypoint + custom keyframes
  map/page.tsx              Global Map page (2D registry browser + real OSM map + globe)
  tree-reg/page.tsx         Tree registration form (multi-step, geolocation)
  nature-heroes/page.tsx    Nature Heroes info + application CTA
  nature-heroes/apply/page.tsx  Nature Hero application form
  campaigns/page.tsx        Browse/join planting campaigns
  campaigns/new/page.tsx    Create a campaign (Nature Hero role required)
  connect-wallet/page.tsx   Wallet connect screen
  profile/page.tsx          User profile, role, application status
  contact/page.tsx          Contact form
  privacy-policy/page.tsx

components/
  Header.tsx / Footer.tsx    Shared across every page
  WalletButton.tsx           Header's connect/connected-state button
  MobileNav.tsx               Hamburger menu (mobile)
  TreeMap.tsx                 Interactive 2D tree registry map (filters, search, pan/zoom)
  OSMTreeMap.tsx               Real OpenStreetMap + Leaflet, actual tree coordinates,
                               click-to-view satellite close-up (free Esri imagery)
  DotGlobe.tsx                 Rotating 3D dot-matrix globe (real coastline data,
                               highlights pulled from OSMTreeMap's registeredTrees)
  land-points.json             Precomputed globe coastline points (see scripts/)
  ParticleSphere.jsx           Cursor-reactive particle sphere (hero visual)
  FlipCard.tsx                 3D flip-card interaction (NFT gallery)
  Visuals.tsx                  Logo marquee ticker
  Icons.tsx                    Inline SVG icon set
  Reveal.tsx                   Scroll-triggered fade/slide-in wrapper

lib/
  mockAuth.ts    Frontend-only mock wallet/role state (localStorage). NOT
                 real auth — see "Mock state" section below.

scripts/
  gen-land-points.mjs   Regenerates components/land-points.json from real
                        world-atlas coastline data. Run with
                        `node scripts/gen-land-points.mjs` if you need to
                        change the globe's resolution — do NOT compute this
                        at runtime in the browser, it's expensive (this was
                        previously a real performance bug on the live site).
```

## Backend state — read this before adding backend work

Most form data is now persisted to the **Convex backend** (see
`convex/schema.ts` and `convex/*.ts`, plus `architecture.md` for the full
design). What remains mocked:

- **Wallet connect** (`/connect-wallet`) doesn't call a real wallet adapter —
  clicking any option generates a fake address and get-or-creates a Convex
  `users` doc for it. Replacing it means wiring
  `@solana/wallet-adapter-react` + a signed message.
- **Sessions** are a localStorage cache (`lib/mockAuth.ts`) mirroring the
  Convex user (keyed by `userId`). It's UI state, not a security boundary.
- **Register role selection** lets users self-select `user` /
  `nature_hero_pending` / `nature_hero` / `admin`. Demo-only — replace with
  real role assignment before production.
- **Google sign-in** (NextAuth) needs `GOOGLE_CLIENT_ID` /
  `GOOGLE_CLIENT_SECRET` in `.env.local` (currently commented out) and a
  `NEXTAUTH_SECRET` (generated). Without Google creds the provider is
  skipped gracefully.

None of this is a security boundary — it's there so the UI has real states
to react to (pending/approved/role-gated pages) while the frontend and
contract/backend work happen in parallel. Replacing it means:

1. Real wallet connection (`@solana/wallet-adapter-react` + a signed message
   to prove wallet ownership)
2. A real backend/database storing role + application status per wallet
3. An admin-only panel/endpoint to approve or reject Nature Hero applications
4. Campaign CRUD backed by the database, with server-side enforcement that
   only approved Nature Heroes can create one

## Where backend/contract work plugs in

Nothing on-chain is wired up yet — every "Connect Wallet," form submission,
and stat on the site is currently either disabled, a placeholder, or static
mock data. Specifically:

| Area | Current state | Needs |
|---|---|---|
| `Header.tsx` / `connect-wallet/page.tsx` — Connect Wallet | Demo address → Convex `users` doc | Wallet adapter integration (`@solana/wallet-adapter-react` recommended) |
| `app/tree-reg/page.tsx` — submission form | Persisted to Convex `trees` (status `pending`) | Real 2-of-2 Nature Hero verification; photo upload |
| `components/OSMTreeMap.tsx` / `TreeMap.tsx` — `registeredTrees` | Hardcoded 2 seed trees + legacy localStorage | Fetch real trees from Convex |
| `app/page.tsx` — `registryStats` | Hardcoded numbers | Live counts from chain/DB |
| User roles (`lib/mockAuth.ts` / `convex/users.ts`) | Convex-backed, but register allows self-selected role (demo) | Real backend-enforced roles tied to wallet address |
| `nature-heroes/apply` — applications | Persisted to Convex `natureHeroApplications` + admin review UI | Notification flow; real review queue polish |
| Admin approval of Nature Heroes | Convex `setApplicationStatus` (promotes role) | Full admin panel polish |
| `campaigns/page.tsx` — campaign list | Convex `campaigns` table | Join/enroll flow (currently inert button) |
| `campaigns/new/page.tsx` — creation gate | Server-side role check in `api.campaigns.create` | Wallet-signature proof of role |
| NFT minting | Not implemented — "Mint NFT" button is inert | Mint flow once verification logic exists |
| Nature Hero verification (2-of-2 approval) | Described in copy only; single approval flips status | Actual program logic + Hero review UI |

The backend is Convex (`convex/` directory). Add an `app/api/` directory for
custom route handlers (e.g. auth/notification webhooks) or a separate
`programs/` directory if using an Anchor workspace in this same repo
(neither exists yet).

## Development

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # production build — matches what Vercel runs
```

Before pushing, it's worth running `npx tsc --noEmit` locally — `next build`
runs a strict TypeScript check that a plain syntax check won't catch.

## Deployment

Connected to Vercel, deploys automatically on push to `main`. Domain
(`naturre.xyz`) is configured via Namecheap DNS pointing at Vercel.
