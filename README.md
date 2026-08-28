# CNC DAO

A regenerative-finance decentralized application (ReFi) connecting real-world community tree planting with blockchain proof and proof-of-stewardship NFTs. Every tree submission is verified by Nature Heroes before minting on-chain records.

**Live Site:** [https://naturre.xyz](https://naturre.xyz)  
**Frontend Reference:** [https://cncdao.framer.website](https://cncdao.framer.website)

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database & Realtime Backend:** [Convex](https://convex.dev)
- **Authentication:** NextAuth (Google OAuth) + Convex Email/Password & Wallet Session State
- **Theming:** `next-themes` (Dark/Light mode with CSS variables and Tailwind tokens)
- **Maps & GIS:** Leaflet, OpenStreetMap, Esri High-Resolution Satellite Imagery
- **Icons & UI:** Lucide React, Syne, DM Sans, Space Grotesk, Space Mono
- **Deployment:** Vercel (CI/CD via `main` branch)

---

## Key Features & Architecture

### 1. Interactive Tree Registry & GIS Mapping
- **Dedicated Global Map & Registry (`/dashboard/map`):** Interactive Leaflet map synchronized in real-time with Convex database records. Features street view and satellite tile layers, click-to-center animation, search/filter pills (`All`, `Pending`, `Verified`, `Minted`), and direct verification/minting actions.
- **Public Map (`/map` & homepage widget):** Interactive canvas & 2D registry browser with real coordinates and live status counters.
- **Accurate Count Sync:** Verified tree stats count both approved and minted trees accurately across all map views and tables.

### 2. Verification Queue & Nature Hero Workflow
- **Unified Verification Table (`/dashboard/verification`):** Merged data table for submissions and validation queue with instant search, status badges, and inline actions for Nature Heroes (`Approve`) and Admins (`Mint NFT`).
- **Hero Verification Panel (`/dashboard/hero-verification`):** Admin review interface to inspect applicant motivations, region, and experience to promote users to `nature_hero` status.

### 3. Community Planting Campaigns
- **Dedicated Dashboard Campaigns (`/dashboard/campaigns`):** Full campaign management hub displaying total participants, capacity progress bars, and target metrics.
- **Admin & Nature Hero Creation Modal:** Admins and approved Nature Heroes can launch regional campaigns with participant limits and instructions.
- **Campaign Actions:** Users can join active campaigns directly; admins can delete or moderate obsolete campaigns.

### 4. Proof-of-Stewardship NFT Gallery (`/dashboard/nft`)
- Visual gallery displaying minted tree stewardship NFTs with IPFS metadata hashes, tree species, planting dates, and GPS coordinates.

### 5. Authentication & Profile Management
- **Universal Session Handling:** Supports Google OAuth (NextAuth), email/password login and registration with Convex, and wallet connection.
- **Username Formatting:** Automatically displays clean usernames on the landing page and header navigation instead of raw email addresses.
- **Profile Customization (`/dashboard/profile`):** Edit display name, bio, and avatar.

### 6. Light & Dark Theme System
- Built-in theme switcher supporting Dark mode (default brand identity) and Light mode.
- Accessible via one-click toggle in the header and dashboard sidebar.

---

## Directory Structure

```
├── app/
│   ├── layout.tsx                     # Root layout, fonts, ThemeProvider, Convex & NextAuth
│   ├── page.tsx                       # Homepage (Hero, Steps, Proof, Features, Testimonials)
│   ├── globals.css                    # CSS variables (:root for light, .dark for dark mode)
│   ├── auth/page.tsx                  # Email/password login and registration
│   ├── connect-wallet/page.tsx        # Multi-option wallet & email login
│   ├── map/page.tsx                   # Public map and 3D globe view
│   ├── tree-reg/page.tsx              # Multi-step tree planting submission form
│   ├── nature-heroes/                 # Nature Heroes landing & application flow
│   ├── campaigns/                     # Public campaign directory & creation
│   └── dashboard/                     # Authenticated Dashboard Shell
│       ├── page.tsx                   # Overview metrics & quick links
│       ├── map/page.tsx               # Dedicated Admin Global Map & Registry
│       ├── campaigns/page.tsx         # Dedicated Campaign management hub
│       ├── verification/page.tsx      # Unified verification & validation queue
│       ├── hero-verification/page.tsx # Admin Nature Hero applicant review
│       ├── users/page.tsx             # User management and role moderation
│       ├── nft/page.tsx               # Stewardship NFT gallery
│       ├── badges/page.tsx            # Achievements & stewardship badges
│       └── profile/page.tsx           # Profile editor
│
├── components/
│   ├── DashboardShell.tsx             # Dashboard layout, sidebar navigation, user badge
│   ├── AdminGlobalMap.tsx             # Leaflet GIS map with satellite switcher & registry
│   ├── Header.tsx / Footer.tsx        # Navigation with theme toggle & user status
│   ├── WalletButton.tsx               # User avatar & account dropdown
│   ├── ThemeToggle.tsx                # Sun/Moon theme switcher
│   ├── ThemeProvider.tsx              # next-themes client wrapper
│   ├── TreeMap.tsx / OSMTreeMap.tsx   # Interactive map components
│   └── DotGlobe.tsx                   # 3D dot-matrix globe
│
├── convex/                            # Real-time backend functions
│   ├── schema.ts                      # users, trees, natureHeroApplications, campaigns
│   ├── users.ts                       # Login, register, profile update, role checks
│   ├── trees.ts                       # Tree submission, approval, minting, status queries
│   ├── campaigns.ts                   # Campaign create, join, remove, list queries
│   └── natureHeroes.ts                # Application submission & review mutations
│
└── lib/
    ├── useAuth.ts                     # Reactive session & user hook
    ├── useTrees.ts                    # Hook querying live database trees
    └── mockAuth.ts                    # Session state pointer utilities
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/DavidManiIbrahim/CNC-DAO.git
cd CNC-DAO

# 2. Install dependencies
npm install

# 3. Start Convex backend (in separate terminal)
npx convex dev

# 4. Start Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Type Checking & Build

```bash
# Type check all TypeScript files
npx tsc --noEmit

# Production build
npm run build
```

---

## Deployment

The application is configured for continuous deployment on **Vercel** connected to the `main` branch. Production domain (`naturre.xyz`) points to Vercel via DNS.
