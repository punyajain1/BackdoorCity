# 🚪 BackdoorCity

> **The community-powered underground city guide for India.**  
> Discover and share the best hidden spots — cafes, parks, events, and more — curated by locals, for locals. No algorithms. No ads. Just real picks.

---

## ✨ What is BackdoorCity?

BackdoorCity is a minimalist, community-driven city guide. Users browse cities, explore spots by vibe (Eat, Chill, Play), vote on their favourites, and contribute their own finds — all without needing to create an account.

The philosophy is **frictionless and profile-free**: submit your email, get a one-time code (OTP), and your spot is live. That's it.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Next.js 16  (App Router · React 19)         │   │
│  │                                                          │   │
│  │   ┌──────────────────────────────────────────────────┐   │   │
│  │   │              AppContainer.tsx                    │   │   │
│  │   │         (Single-page state router)               │   │   │
│  │   │                                                  │   │   │
│  │   │  s1: HomeScreen    → Pick a City                 │   │   │
│  │   │  s2: VibeScreen    → Pick a Vibe (Eat/Play/…)   │   │   │
│  │   │  s3: SpotList      → Browse & Upvote Spots       │   │   │
│  │   │  s4: SpotDetail    → Spot Info + Reviews         │   │   │
│  │   │  s5: AddSpot       → Submit a New Spot           │   │   │
│  │   └──────────────────────────────────────────────────┘   │   │
│  │                                                          │   │
│  │   Styling: Tailwind CSS v4  ·  TypeScript               │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────┘
                           │  HTTP REST  (fetch / JSON)
                           │  CORS-enabled
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND  (Node.js)                         │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   Express.js v5                          │   │
│  │                   TypeScript · ts-node-dev               │   │
│  │                   Port 3001                              │   │
│  │                                                          │   │
│  │  GET  /api/health                                        │   │
│  │  GET  /api/cities                                        │   │
│  │  GET  /api/categories                                    │   │
│  │  GET  /api/spots?cityId=&categoryId=                     │   │
│  │  POST /api/spots                                         │   │
│  │  PATCH/api/spots/:id                                     │   │
│  │  POST /api/reviews                                       │   │
│  │  POST /api/spots/:id/upvote                              │   │
│  │  POST /api/spots/:id/downvote                            │   │
│  └──────────────────┬───────────────────────────────────────┘   │
│                     │  Prisma Client (PostgreSQL adapter)        │
│                     ▼                                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  Prisma ORM  v7                           │   │
│  │                                                          │   │
│  │  Models:  City · Category · Spot · Review · Vote         │   │
│  └──────────────────┬───────────────────────────────────────┘   │
└─────────────────────┼───────────────────────────────────────────┘
                      │  @prisma/adapter-pg  ·  pg (node-postgres)
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│              DATABASE  —  PostgreSQL  (Neon / Supabase)         │
│                                                                 │
│   City ──────< Spot >────── Category                            │
│                 │                                               │
│                 ├──────< Review                                  │
│                 └──────< Vote  (@@unique [spotId, email])        │
└─────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

| Concern | Decision | Why |
|---|---|---|
| Auth | Stateless OTP (email-only) | Zero friction — no passwords, no profiles |
| User identity | Flat strings on records (`submitterEmail`, `submitterHandle`) | Avoids a `User` model entirely |
| Routing | Client-side state machine in `AppContainer` | App-like feel without full-page reloads |
| Votes | `@@unique([spotId, email])` constraint | Prevents double-voting without heavy auth |
| OTP verification | Currently **disabled** | Reduces dev friction; re-enable before production |

---

## 📁 Project Structure

```
backdoorcity/
├── backend/                  # Express.js API server
│   ├── src/
│   │   └── index.ts          # All REST endpoints
│   ├── prisma/
│   │   ├── schema.prisma     # Database models
│   │   └── seed.ts           # Initial seed data
│   ├── seed_engagement.ts    # Seed votes & reviews for demo
│   ├── tsconfig.json
│   └── package.json
│
├── web/                      # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx    # Root layout
│   │   │   ├── page.tsx      # Entry point → AppContainer
│   │   │   └── globals.css   # Design tokens (Tailwind @theme)
│   │   ├── components/
│   │   │   ├── screens/
│   │   │   │   ├── AppContainer.tsx     # State router + data fetching
│   │   │   │   ├── HomeScreen.tsx       # City picker
│   │   │   │   ├── VibeScreen.tsx       # Category/vibe picker
│   │   │   │   ├── SpotListScreen.tsx   # Spots with upvote
│   │   │   │   ├── SpotDetailScreen.tsx # Spot detail + reviews
│   │   │   │   └── AddSpotScreen.tsx    # Spot submission form
│   │   │   └── ui/
│   │   │       └── Shared.tsx           # PageLayout, Breadcrumb, etc.
│   │   └── lib/
│   └── package.json
│
└── docs/                     # Project documentation
    ├── backend.md            # API & database reference
    └── frontend.md           # UI architecture reference
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- A **PostgreSQL** database (Neon, Supabase, or local)

---

### 1. Clone the repository

```bash
git clone https://github.com/your-org/backdoorcity.git
cd backdoorcity
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
PORT=3001
```

Run database migrations and seed:

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

Start the dev server:

```bash
npm run dev
# → http://localhost:3001
```

---

### 3. Frontend Setup

```bash
cd web
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Start the dev server:

```bash
npm run dev
# → http://localhost:3000
```

---

## 📡 API Reference

Base URL: `http://localhost:3001`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/cities` | List all cities (with spot count) |
| `GET` | `/api/categories` | List all vibe categories |
| `GET` | `/api/spots` | List spots (filter by `?cityId=&categoryId=`) |
| `POST` | `/api/spots` | Submit a new spot |
| `PATCH` | `/api/spots/:id` | Edit an existing spot (partial update) |
| `POST` | `/api/reviews` | Submit a review for a spot |
| `POST` | `/api/spots/:id/upvote` | Upvote a spot (anonymous) |
| `POST` | `/api/spots/:id/downvote` | Remove a vote from a spot |



## 🗄️ Data Models

### Spot (Core Entity)

```typescript
{
  id: string               // UUID
  name: string             // "Blue Tokai, Lodhi"
  area: string             // "Lodhi Colony"
  locationUrl?: string     // Google Maps link
  cityId: string
  categoryId: string
  time?: string            // "Weekday mornings"
  price?: string           // "₹200–400 per person"
  description?: string
  submitterEmail: string   // Identity via OTP
  submitterHandle?: string // "@handle on IG/X"
  tags: string[]           // ["#coffee", "#cowork"]
  verified: boolean        // Community verification flag
  reviews: Review[]
  votes: number            // Aggregated vote count
}
```

### Vote Uniqueness

Votes enforce `@@unique([spotId, email])` at the database level — one vote per spot per email, no auth system required.

---

## 🎨 Design System

The frontend follows a **minimalist Notion-inspired aesthetic**:

| Token | Value | Usage |
|-------|-------|-------|
| Primary text | `#111111` | Headings, labels |
| Secondary text | `#444444` | Body copy |
| Tertiary text | `#888888` | Timestamps, metadata |
| Background | `#ffffff` | Page background |
| Max width | `680px` | Content container |

Typography is set with system fonts for speed. Layout uses Tailwind CSS v4 `@theme` variables defined in `globals.css`.

---

## 🛣️ Roadmap

- [ ] **OTP Email Verification** — Re-enable stateless email auth before production
- [ ] **City Slug Routing** — `/delhi`, `/mumbai` deep-link URLs
- [ ] **Mobile App** — React Native / Expo companion app (scaffolded)
- [ ] **Spot Verification System** — Community or admin approval workflow
- [ ] **Tag Filtering** — Filter spots by `#tags` on the list screen
- [ ] **Image Uploads** — Attach photos to spots via S3/Cloudflare R2

---

## 🤝 Contributing

Contributions are welcome! To add a spot to an existing city, just use the live app. To contribute code:

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push and open a Pull Request

Please keep PRs focused and follow the existing minimalist philosophy — no feature creep.

---

## 📄 License

MIT © BackdoorCity contributors
