# Backend API Documentation

> Express.js + Prisma + PostgreSQL REST API for BackdoorCity.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js | ≥ 18 |
| Framework | Express.js | v5 |
| Language | TypeScript | v6 |
| Dev server | ts-node-dev | v2 |
| ORM | Prisma Client | v7 |
| DB adapter | @prisma/adapter-pg | v7 |
| Database | PostgreSQL | any (Neon/Supabase/local) |

---

## Fundamental Architectural Philosophy: Stateless Auth

The system is strictly **frictionless and profile-free**.

Unlike a classic NextAuth + Next.js stack, there is **no `User` model**. No registration, no forgotten passwords, no profile pages.

To ensure authenticity while removing friction, the backend uses a **stateless OTP (One Time Password)** flow for submissions. When someone adds a `Spot` or `Review`, they supply an email. The API (when OTP is re-enabled) sends a one-time code. Only upon verification is the payload written to PostgreSQL.

### Identity Storage

Rather than referencing a `User.id`, identity is stored as flat strings directly on records:

| Field | Type | Notes |
|-------|------|-------|
| `submitterEmail` | `String` | Required — validated via OTP |
| `submitterHandle` | `String?` | Optional — `@handle` on IG/X |

> ⚠️ **OTP verification is currently DISABLED** to reduce development friction. Re-enable the commented blocks in `src/index.ts` before going to production.

---

## Database Schema (Prisma)

Five core models: `City`, `Category`, `Spot`, `Review`, `Vote`.

### Entity Relationship Diagram

```
City ──────< Spot >────── Category
              │
              ├──────< Review
              └──────< Vote  (@@unique [spotId, email])
```

---

### 1. City

Cities are the top-level browsing unit (e.g. Delhi NCR, Mumbai, Bangalore).

| Field | Type | Attributes | Description |
|:------|:-----|:-----------|:------------|
| `id` | `String` | `@id @default(uuid())` | Primary key |
| `name` | `String` | | Display name |
| `icon` | `String?` | | Emoji icon |
| `createdAt` | `DateTime` | `@default(now())` | |
| `updatedAt` | `DateTime` | `@updatedAt` | |

---

### 2. Category

Vibe buckets used to classify spots (Eat, Chill, Play, etc.).

| Field | Type | Attributes | Description |
|:------|:-----|:-----------|:------------|
| `id` | `String` | `@id @default(uuid())` | Primary key |
| `name` | `String` | | Display name |
| `icon` | `String` | | Emoji icon (required) |
| `createdAt` | `DateTime` | `@default(now())` | |
| `updatedAt` | `DateTime` | `@updatedAt` | |

---

### 3. Spot *(Core Entity)*

A community-added location — restaurant, café, park, event venue, etc.

| Field | Type | Attributes | Description |
|:------|:-----|:-----------|:------------|
| `id` | `String` | `@id @default(uuid())` | Primary key |
| `name` | `String` | | Display name |
| `area` | `String` | | Neighbourhood / area grouping |
| `locationUrl` | `String?` | | Google Maps link |
| `cityId` | `String` | `@relation(City)` | Parent city |
| `categoryId` | `String` | `@relation(Category)` | Parent category |
| `time` | `String?` | | Best time to visit |
| `price` | `String?` | | General cost description |
| `description` | `String?` | | Detailed insights |
| `submitterEmail` | `String` | | Creator email (OTP-validated) |
| `submitterHandle` | `String?` | | Optional IG/X handle |
| `tags` | `String[]` | | Free-form tags e.g. `#vegan` |
| `verified` | `Boolean` | `@default(false)` | Community verification flag |
| `createdAt` | `DateTime` | `@default(now())` | |
| `updatedAt` | `DateTime` | `@updatedAt` | |

---

### 4. Review

User-generated comments about a `Spot`.

| Field | Type | Attributes | Description |
|:------|:-----|:-----------|:------------|
| `id` | `String` | `@id @default(uuid())` | Primary key |
| `text` | `String` | | Review body |
| `spotId` | `String` | `@relation(Spot)` | Parent spot |
| `submitterEmail` | `String` | | Creator email |
| `submitterHandle` | `String?` | | Optional IG/X handle |
| `createdAt` | `DateTime` | `@default(now())` | |
| `updatedAt` | `DateTime` | `@updatedAt` | |

---

### 5. Vote

Anonymous upvote tracker with built-in duplicate prevention.

| Field | Type | Attributes | Description |
|:------|:-----|:-----------|:------------|
| `id` | `String` | `@id @default(uuid())` | Primary key |
| `spotId` | `String` | `@relation(Spot)` | Target spot |
| `email` | `String` | | Voter email |
| `createdAt` | `DateTime` | `@default(now())` | |

**Key constraint:** `@@unique([spotId, email])` — one vote per spot per email, enforced at the database level.

---

## REST Endpoints

Base URL: `http://localhost:3001`

### Health Check

```
GET /api/health
```
Response: `{ "status": "ok", "message": "Backend is running" }`

---

### Cities

```
GET /api/cities
```
Returns all cities with their spot count.

```json
[
  { "id": "...", "name": "Delhi NCR", "icon": "🏙️", "_count": { "spots": 12 } }
]
```

---

### Categories

```
GET /api/categories
```
Returns all vibe categories.

---

### Spots

```
GET /api/spots?cityId=<id>&categoryId=<id>
```
Both query params are optional. Returns spots with nested `reviews`, `category`, `city`, and aggregated `votes` count.

```
POST /api/spots
```
Body: `{ name, area, locationUrl, cityId, categoryId, time, price, description, submitterEmail, submitterHandle }`

```
PATCH /api/spots/:spotId
```
Partial update. Only provided fields are updated. Returns the full updated spot.

---

### Reviews

```
POST /api/reviews
```
Body: `{ text, spotId, submitterEmail, submitterHandle }`  
`text`, `spotId`, and `submitterEmail` are required.

---

### Votes

```
POST /api/spots/:spotId/upvote
```
Creates an anonymous vote (uses a generated anon email).

```
POST /api/spots/:spotId/downvote
```
Removes the most recent vote on the spot.

---

## Execution Lifecycle

```
Request → Express Router → Prisma ORM → @prisma/adapter-pg → pg Pool → PostgreSQL
```

1. Requests hit `/api/...` endpoints in `src/index.ts`
2. Prisma executes queries via the `pg` pool adapter (no Prisma Query Engine binary needed)
3. Results are formatted (e.g., `_count.votes` → `votes`) before responding

---

## Development

```bash
# Start dev server with hot-reload
npm run dev

# Generate Prisma client after schema changes
npx prisma generate

# Create and apply a migration
npx prisma migrate dev --name <migration-name>

# Seed the database
npx prisma db seed

# Open Prisma Studio (GUI)
npx prisma studio
```