# Roomivo: Vite to Next.js Migration Plan

**Goal:** Migrate the frontend from Vite (SPA) to Next.js (App Router) to achieve "Investor-Grade" SEO, performance, and scalability, while keeping the Supabase backend intact.

## Phase 1: Preparation & Setup (Immediate)
- [x] **Backup:** Move current frontend code to `legacy-vite/` folder.
- [x] **Preserve:** Keep `supabase/` folder, `.git`, and documentation in root.
- [x] **Initialize:** Create new Next.js 14+ project in root.
  - TypeScript
  - Tailwind CSS
  - ESLint
  - App Router
  - `src/` directory
- [x] **Dependencies:** Install `shadcn-ui`, `lucide-react`, `@supabase/ssr` (crucial for Next.js Auth).

## Phase 2: Foundation (Completed)
- [x] **Styles:** Port `globals.css` and Tailwind configuration.
- [x] **Supabase Client:** Create `utils/supabase/server.ts` and `client.ts` using `@supabase/ssr`.
- [x] **Auth:** Port `AuthProvider` and Login/Register pages (`src/app/auth/page.tsx`).
- [x] **Layout:** Recreate the main `layout.tsx` (Navbar, Footer).

## Phase 3: Component Migration (Completed)
- [x] **UI Components:** Port Shadcn components (Slider, Checkbox, Dialog, Table, Avatar, Sonner installed).
- [x] **Feature Components:** Port key components.
  - [x] Properties Page & Components
  - [x] Dashboard Shell
  - [x] Chat & Payments
- [x] **Role Selection:** Implemented logic and UI.
- [x] **Page Migration (SEO Focus):**
  - [x] Listings (`/properties`)
  - [x] Listings Dynamic Route (`/properties/[id]`)
  - [x] Dashboard (`/dashboard`)

## Phase 5: Verification
- [ ] Verify Authentication flow.
- [ ] Verify Edge Functions integration (Payments, AI).
- [ ] Check SEO tags (OpenGraph, Title, Description).

---

## Directory Structure Strategy

```text
/ (Root)
├── supabase/         # KEEP: Backend (Edge Functions, DB config)
├── legacy-vite/      # MOVED: Old frontend (Reference)
├── src/              # NEW: Next.js Source
│   ├── app/          # App Router Pages
│   ├── components/   # React Components
│   ├── lib/          # Utilities
│   └── utils/        # Supabase helpers
├── public/           # Static assets
└── next.config.js    # Next.js Config
```
