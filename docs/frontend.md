# Frontend Application Documentation

> Next.js 16 (App Router) + React 19 + Tailwind CSS v4 — the BackdoorCity web client.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.x |
| UI Library | React | 19.x |
| Language | TypeScript | v5 |
| Styling | Tailwind CSS | v4 |
| Lint | ESLint + eslint-config-next | 16.x |

---

## Architecture

The frontend deliberately avoids traditional file-based page routing for its core user experience. Instead, the entire navigation flow lives inside a **single-page state machine** (`AppContainer.tsx`), giving users an app-like feel with snappy client-side transitions.

### Navigation State Machine

```
           ┌──────────────────────────────────────────┐
           │            AppContainer.tsx               │
           │        (ScreenState finite FSM)           │
           └───────────────────┬──────────────────────┘
                               │
          ┌────────────────────┼────────────────────────┐
          ▼                    ▼                         ▼
    s1: HomeScreen      s2: VibeScreen           s5: AddSpotScreen
    (Pick a City)    (Pick Eat/Play/Chill)       (Submit a Spot)
                               │
               ┌───────────────┘
               ▼
       s3: SpotListScreen
       (Browse & Upvote)
               │
               ▼
       s4: SpotDetailScreen
       (Spot info + Reviews)
```

| State | Screen | Purpose |
|-------|--------|---------|
| `s1` | `HomeScreen` | Entry point; display and select a city |
| `s2` | `VibeScreen` | Choose a vibe category (Eat, Chill, Play…) |
| `s3` | `SpotListScreen` | Browse spots in the chosen city + vibe; upvote |
| `s4` | `SpotDetailScreen` | Full spot details, tags, map link, reviews |
| `s5` | `AddSpotScreen` | Form to submit a new spot |

---

## File Structure

```
web/src/
├── app/
│   ├── layout.tsx          # Root HTML layout + metadata
│   ├── page.tsx            # Renders <AppContainer />
│   └── globals.css         # Tailwind @theme design tokens
│
├── components/
│   ├── screens/
│   │   ├── AppContainer.tsx       # State router + all data fetching
│   │   ├── HomeScreen.tsx         # City picker
│   │   ├── VibeScreen.tsx         # Category/vibe picker
│   │   ├── SpotListScreen.tsx     # Spot list + upvote/downvote
│   │   ├── SpotDetailScreen.tsx   # Spot detail + inline edit + reviews
│   │   └── AddSpotScreen.tsx      # Spot submission form
│   │
│   └── ui/
│       └── Shared.tsx             # Shared UI primitives
│
└── lib/
    └── (utilities)
```

---

## Shared UI Primitives (`Shared.tsx`)

A centralised set of components ensures visual consistency across all screens.

| Component | Purpose |
|-----------|---------|
| `PageLayout` | Centers content, enforces `max-w-[680px]`, base padding |
| `Breadcrumb` | Back-navigation through the state stack |
| `PageHeader` | Large heading — consistent typography and spacing |
| `SectionLabel` | Secondary label above content groups |
| `Chip` | Tag pill — used on `SpotDetailScreen` for `#tags` |

---

## Data Flow

```
AppContainer
     │
     ├── GET /api/cities        → HomeScreen (city list)
     ├── GET /api/categories    → VibeScreen (category list)
     ├── GET /api/spots         → SpotListScreen (filtered spots)
     │
     ├── POST /api/spots        ← AddSpotScreen (submit)
     ├── PATCH /api/spots/:id   ← SpotDetailScreen (inline edit)
     ├── POST /api/reviews      ← SpotDetailScreen (add review)
     ├── POST /api/spots/:id/upvote   ← SpotListScreen
     └── POST /api/spots/:id/downvote ← SpotListScreen
```

All data is fetched directly from the Express backend using the browser `fetch` API. TypeScript interfaces mirror the backend Prisma models.

---

## Design System

The app follows a **minimalist Notion-inspired aesthetic** — monochrome, clean, and content-first.

### Colour Tokens (defined in `globals.css` via Tailwind `@theme`)

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg-primary` | `#ffffff` | Page background |
| Primary text | `#111111` | Headings, bold labels |
| Secondary text | `#444444` | Body copy |
| Tertiary text | `#888888` | Metadata, timestamps |
| Borders | `#e5e5e5` | Dividers, card outlines |

### Layout

- Max content width: **680px** (readable line length)
- Centered with horizontal padding
- Single-column on all screen sizes

### Typography

- System font stack for fast rendering
- Strong heading hierarchy using Tailwind's `text-xl`, `text-2xl` with `font-bold`

---

## Authentication Strategy

The frontend is completely profile-free. When a user submits a spot or review:

1. They enter their **email address** in the form
2. *(When OTP is enabled)* — a code is sent to that email
3. On verification, the payload is sent to the backend

**OTP verification is currently DISABLED** to eliminate development friction. Direct submissions are allowed. Re-enable before production by wiring up the OTP endpoint in `AddSpotScreen` and `SpotDetailScreen`.

No JWT tokens, no session storage, no `/profile` page needed.

---

## Key Screens

### `AppContainer.tsx`

The single source of truth for:
- Active `ScreenState`
- All API data (`cities`, `categories`, `spots`)
- Navigation handlers (`goToVibe`, `goToSpotList`, `goBack`, etc.)
- Upvote/downvote handlers passed as props to child screens

### `SpotDetailScreen.tsx`

- Displays full spot metadata, tags, map link, submitter handle
- Inline edit mode: click to edit fields without navigating away
- Add review form: email + review text → `POST /api/reviews`
- Upvote / downvote controls

### `AddSpotScreen.tsx`

- Collects: name, area, category, location URL, time, price, description, email, handle
- On submit → `POST /api/spots`
- Returns to `SpotListScreen` on success

---

## Development

```bash
# Start Next.js dev server
npm run dev
# → http://localhost:3000

# Type-check
npx tsc --noEmit

# Lint
npm run lint

# Production build
npm run build && npm start
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend base URL (e.g. `http://localhost:3001`) |
