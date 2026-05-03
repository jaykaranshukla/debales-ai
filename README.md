# Debales AI — Multi-tenant AI Assistant

> Full Stack Developer Internship Assignment — Debales AI

A production-style multi-tenant AI assistant platform with a **config-driven admin dashboard**, real AI integration via Groq, and strict layered architecture.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Database | MongoDB + Mongoose |
| Auth | NextAuth.js v4 (Credentials + JWT) |
| Validation | Zod |
| Server State | TanStack Query v5 |
| AI | Groq API (`llama-3.1-8b-instant`) with keyword-match fallback |

---

## Architecture

```
Access Layer       → Pure rule functions (zero DB, zero side effects)
    ↓
Services           → Business logic + all Mongoose/DB calls
    ↓
Route Handlers     → Thin: parse Zod → call service → return JSON
    ↓
TanStack Query     → Client-side hooks (useQuery / useMutation)
    ↓
React Components   → UI only, no direct DB or fetch calls
```

### Multi-tenant Model

```
Project  (tenant boundary — identified by slug)
  ├── Users              { memberships: [{ projectId, role }] }
  ├── ProductInstances   { projectId, productType, namespace }
  ├── Conversations      { projectId, productInstanceId, userId }
  │     └── Messages     { conversationId, role: user|assistant|step }
  ├── Integrations       { projectId, type: shopify|crm, enabled, mockData }
  └── DashboardConfig    { projectId, sections[], widgets[] }  ← drives admin UI
```

---

## Environment Variables

Copy `.env.example` → `.env.local` and fill in:

```env
# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/debales

# NextAuth — generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# Groq API — free at https://console.groq.com/keys
GROQ_API_KEY=gsk_your-key-here
```

---

## Setup & Run

### 1. Install dependencies

```bash
npm install
```

### 2. Add environment variables

```bash
cp .env.example .env.local
# Fill in MONGODB_URI, NEXTAUTH_SECRET, NEXTAUTH_URL, GROQ_API_KEY
```

### 3. Seed the database

```bash
npm run seed
```

Creates:
- 2 projects: `acme` and `techstart`
- 5 demo users with roles
- 2 product instances (one per project)
- 4 integrations (Shopify + CRM per project)
- 2 dashboard configs (one per project) — stored in `dashboardconfigs` collection

### 4. Start development server

```bash
npm run dev
# Open http://localhost:3000
```

---

## Demo Accounts

| Email | Password | Role | Project |
|-------|----------|------|---------|
| admin@acme.com | password123 | admin | Acme Corp |
| member@acme.com | password123 | member | Acme Corp |
| admin@techstart.com | password123 | admin | TechStart |
| member@techstart.com | password123 | member | TechStart |
| super@debales.ai | password123 | admin | Both projects |

---

## Config-Driven Admin Dashboard

### Which collection drives it

**Collection:** `dashboardconfigs`

This is the key requirement — the admin dashboard layout, sections, widget order, and widget types are all stored in this MongoDB collection. No code change is needed to update the dashboard UI.

### Document schema

```json
{
  "projectId": "<ObjectId>",
  "title": "Acme Corp — Admin Dashboard",
  "sections": [
    {
      "id": "overview",
      "title": "Overview",
      "order": 1,
      "widgets": [
        { "id": "w1", "type": "stats_card", "label": "Total Conversations", "dataKey": "totalConversations", "order": 1 },
        { "id": "w2", "type": "stats_card", "label": "Active Users", "dataKey": "activeUsers", "order": 2 },
        { "id": "w3", "type": "stats_card", "label": "Messages Today", "dataKey": "messagesToday", "order": 3 },
        { "id": "w4", "type": "stats_card", "label": "Total Messages", "dataKey": "totalMessages", "order": 4 }
      ]
    },
    {
      "id": "integrations",
      "title": "Integrations",
      "order": 2,
      "widgets": [
        { "id": "w5", "type": "integration_status", "label": "Shopify Integration", "order": 1 },
        { "id": "w6", "type": "integration_status", "label": "CRM Integration", "order": 2 }
      ]
    },
    {
      "id": "activity",
      "title": "Recent Activity",
      "order": 3,
      "widgets": [
        { "id": "w7", "type": "recent_conversations", "label": "Recent Conversations", "order": 1 }
      ]
    }
  ]
}
```

### Widget types

| type | Renders |
|------|---------|
| `stats_card` | Metric card — reads live value from `dataKey` |
| `integration_status` | Integration toggle card (Shopify / CRM) |
| `recent_conversations` | List of recent conversations |

### How to verify config-driven behavior (for evaluator)

1. Login as `admin@acme.com` → go to `http://localhost:3000/projects/acme/admin`
2. Open MongoDB Compass or Atlas → find `dashboardconfigs` collection → open Acme document
3. Make any of these changes and **refresh the page** — no code deployment needed:
   - Change `sections[0].title` → section heading updates
   - Change a widget's `order` value → cards reorder
   - Delete a widget object from `widgets[]` → that card disappears
   - Add a new section → new section appears
   - Change `title` field → page heading updates

---

## API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/[...nextauth]` | — | NextAuth sign-in / sign-out |
| GET | `/api/projects` | any user | List projects for logged-in user |
| GET | `/api/conversations?projectSlug=` | member | List conversations scoped to project |
| POST | `/api/conversations?projectSlug=` | member | Create new conversation |
| GET | `/api/conversations/[id]` | member/owner | Get conversation + messages |
| DELETE | `/api/conversations/[id]` | owner | Delete conversation |
| POST | `/api/conversations/[id]/messages` | member | Send message → triggers AI |
| GET | `/api/admin/[slug]/dashboard` | admin only | Dashboard config + live stats |
| GET | `/api/admin/[slug]/integrations` | admin only | List project integrations |
| PUT | `/api/admin/[slug]/integrations` | admin only | Toggle integration on/off |

All routes validate inputs with **Zod** and enforce access rules via the **Access layer** before calling services.

---

## Integration Simulation

Two mock integrations stored in MongoDB per project, toggleable from admin dashboard:

**Shopify-style integration** — mock products, orders, revenue data  
**CRM-style integration** — mock leads, customers, pipeline data

### How it works in chat

When a user sends a message:
1. Service loads enabled integrations for that project from MongoDB
2. Emits step messages → `Analyzing your request...` → `Fetching Shopify data...` → `Generating response...`
3. Builds AI system prompt injecting enabled integration data as context
4. Calls Groq API → returns real AI response
5. Falls back to keyword-matched mock responses if Groq is unavailable

Toggle an integration OFF → AI no longer receives that data in its prompt → answers change accordingly.

---

## What Is Mocked vs Real

| Item | Status |
|------|--------|
| Authentication | NextAuth credentials with seeded users (simplified as allowed) |
| AI responses | **Real** — Groq API (`llama-3.1-8b-instant`), keyword fallback if API down |
| Shopify data | Mock JSON stored in MongoDB `integrations` collection |
| CRM data | Mock JSON stored in MongoDB `integrations` collection |
| Email / notifications | Not implemented |
| Payment / billing | Not implemented |

---

## Authorization

Server-side authorization is enforced on every request:

- **Project access** — users can only access projects they are members of
- **Admin dashboard** — only users with `role: admin` in that project can access `/projects/[slug]/admin` and `/api/admin/[slug]/*`
- **Conversation access** — users can only read/send messages in their own conversations (admins can read all)
- Non-admins hitting admin routes get `403 Forbidden` or redirect to `/projects/[slug]`

---

## Deployment (Vercel)

```bash
vercel --prod
```

Add these env vars in Vercel dashboard:
- `MONGODB_URI`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (set to your Vercel domain)
- `GROQ_API_KEY`

---

## Assumptions

1. Auth is simplified using seeded users + NextAuth credentials as permitted by assignment
2. Shopify and CRM integrations use static mock data stored in MongoDB — no real external API calls
3. Product instances are seeded — no UI to create them (out of scope per assignment)
4. The config-driven requirement applies **only to the admin dashboard** as specified
5. Conversations are scoped per project; users cannot access other projects' conversations
