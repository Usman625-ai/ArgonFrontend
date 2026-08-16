# Argon — Frontend

React/TypeScript storefront and dashboards for **Argon**, a multi-vendor e-commerce platform.

**Live site:** [argon-sable.vercel.app](https://argon-sable.vercel.app)
**Backend:** [Argon Backend](https://github.com/Usman625-ai/ArgonBackend) · `https://shopversee-rye3.onrender.com`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript, built with Vite |
| Routing | React Router (client-side, nested layouts per role) |
| State | Redux Toolkit (`auth`, `cart`, `ui` slices) |
| Forms & validation | React Hook Form + Zod, via `@hookform/resolvers` |
| HTTP | Axios, single configured instance with interceptors |
| Styling | Tailwind CSS — custom "luxury" design system (Fraunces serif for display type, Inter for UI, warm bronze/ivory/charcoal palette) |
| Animation | Framer Motion |
| Icons | Lucide React |
| Charts | Recharts (admin/seller dashboards) |
| Notifications | Sonner (toast) |
| Dates | date-fns |
| Deployment | Vercel (static SPA) |

---

## Architecture

```
src/
├── pages/
│   ├── auth/      Landing, Login, Register, Forgot/Reset Password
│   ├── shop/       Home, Products, Product Detail, Cart, Checkout, Orders,
│   │                Wishlist, Profile, Notifications, Seller Storefront,
│   │                Reviewer Profile
│   ├── seller/    Dashboard, Products, Orders, Revenue, Reports, Settings, Profile
│   └── admin/     Dashboard, Products, Orders, Sellers, Customers, Categories,
│                    Coupons, Reports, Settings, Profile
├── components/
│   ├── layout/    Role-specific shells/navigation (shop / seller / admin)
│   ├── shop/       Reusable storefront pieces (ProductCard, Pagination, EmptyState, ...)
│   ├── shared/     Cross-cutting UI (SlowLoadingOverlay, ServerStatusGate, ErrorBoundary)
│   └── ui/         Base design-system primitives (Button, Card, Badge, SmartImage, ...)
├── store/         Redux Toolkit slices + typed hooks
├── lib/           api.ts (axios), utils.ts, loadingBus.ts, serverStatusBus.ts
└── types/         Shared TypeScript interfaces mirroring backend DTOs
```

All pages are lazy-loaded (`React.lazy` + route-level code splitting) to keep the initial bundle small — each dashboard/page ships as its own chunk.

---

## Core Features

### Storefront (public + customer)
- Product browsing with category tree, brand/price filters, search
- Product detail: image gallery, quantity selector, specifications, reviews (with clickable reviewer avatars), **"Sold by" card** linking to the seller's public storefront
- Cart with optimistic UI updates and debounced server sync (so quantity changes feel instant, not blocked on a round trip)
- Checkout, order history, order tracking (email links deep-link straight into the order detail page)
- Wishlist, saved addresses, profile management
- **Seller storefront page** (`/shop/seller/:id`): shop banner/logo, name, description, member-since date, product count, orders delivered, aggregate rating, paginated product grid
- **Reviewer profile page** (`/shop/reviewer/:id`): avatar, name, member-since, every review they've left across products — reached by clicking any reviewer's name/avatar on a product page

### Seller dashboard
- Product CRUD with image upload (Cloudinary), stock management
- Order fulfillment with status transitions
- Revenue charts and sales reports (Recharts)
- Shop profile (logo, banner, description) and account settings

### Admin dashboard
- Seller approval/rejection queue
- Product moderation (lock/unlock across all sellers)
- Order oversight, coupon management, category management, site settings
- Platform-wide stats (orders, revenue, top sellers/products)

---

## Resilience & UX Infrastructure

These aren't visible "features" but they're core to how the app behaves under real-world conditions (free-tier hosting, mobile connections, cold starts):

### Server status detection (`lib/serverStatusBus.ts` + `components/shared/ServerStatusGate.tsx`)
Axios' response interceptor distinguishes a **normal 4xx/5xx** (the backend answered) from a **true connectivity failure** (no response at all — network error, timeout, backend asleep/unreachable). On a real outage:
- The stored session (`accessToken`/`refreshToken`/`user`) is cleared immediately, rather than leaving a stale "logged in" UI pointed at a backend that isn't there
- A full-screen, on-brand takeover (`ServerStatusGate`) replaces the current page, with distinct copy for "you're offline" vs. "server unreachable"
- It silently polls `/actuator/health` every 5 seconds in the background and auto-redirects to the landing page the moment the backend responds again — no manual refresh needed

### Slow-loading overlay
A separate, lighter-weight overlay (`SlowLoadingOverlay`) surfaces when a request is taking unusually long (e.g. Render cold-starting from sleep) but hasn't outright failed yet — so a multi-second cold start doesn't look like a frozen page.

### SPA routing on Vercel (`vercel.json`)
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```
Without this, any deep link — a product page, a track-order email link, a direct URL paste — 404s on Vercel, because React Router's routes only exist client-side; Vercel needs to be told to always serve `index.html` and let the client-side router take over.

---

## API Client (`lib/api.ts`)

- Single Axios instance, `baseURL` from `VITE_API_URL`
- `timeout: 30000` — generous enough to cover a Render cold start, bounded enough that a genuinely dead backend doesn't hang the UI forever
- Response interceptor handles:
    - Loading-state tracking (`loadingBus`) for global request indicators
    - Automatic access-token refresh on `401`, with single-flight de-duplication (concurrent 401s don't trigger parallel refresh calls)
    - Connectivity-failure detection → `serverStatusBus` (see above)

---

## Getting Started

### Prerequisites
- Node.js 18+

### Environment variables
```bash
VITE_API_URL=https://shopversee-rye3.onrender.com   # no trailing slash
```

### Install & run
```bash
npm install
npm run dev
```

### Build
```bash
npm run build
```
Outputs to `dist/`. Deploy `dist/` to Vercel (or any static host — just make sure SPA rewrites are configured, as in `vercel.json`).

### Type-check
```bash
npx tsc --noEmit
```

---

## Deployment Notes

- Hosted on **Vercel** as a static SPA.
- `vercel.json` rewrite rule is required for client-side routing to work on direct/deep links — see [SPA routing](#spa-routing-on-vercel-verceljson) above.
- `VITE_API_URL` must point to the backend with **no trailing slash** — a trailing slash produces double-slash URLs (`.../seller//register`) in constructed links (e.g. email links), which some routing layers treat as invalid and 404.
