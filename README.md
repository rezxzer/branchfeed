# BranchFeed

Interactive Branching Stories Platform - Create and explore interactive branching video stories with A/B choices.

## Live

Production: https://branchfeed.vercel.app

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Supabase PostgreSQL
- **Styling**: Tailwind CSS
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account and project

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

4. Fill in your Supabase credentials in `.env`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. Run the development server:
   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Screenshots

### Feed

A look at the main branching stories feed:

![BranchFeed feed screenshot](docs/screenshots/branchfeed-feed.png)

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
├── lib/              # Utilities and helpers
│   ├── supabase/    # Supabase client setup
│   └── auth.ts      # Authentication utilities
├── hooks/           # Custom React hooks
└── types/           # TypeScript type definitions
```

## Features

### For viewers

- 🎬 **Interactive branching stories**  
  Watch video stories where each step offers A/B choices and follow different narrative paths.

- 🧭 **Path-aware story player**  
  See where you are in the story, how many paths exist, and which branch you are currently exploring.

- 📰 **Modern feed experience**  
  Scroll through a card-based feed of stories with covers, titles, stats (paths, views, likes) and author info.

- 💬 **Comments & discussions**  
  Leave feedback on stories and read what other viewers think.

- 🔗 **Share stories**  
  Share stories or specific paths with a single click from the feed or story detail page.

- 🌙 **Dark, focused UI**  
  Clean, distraction-free dark theme designed for watching stories comfortably.

---

### For creators

- 🧱 **Branching story builder**  
  Create a root story and add multiple branches with different choices and outcomes.

- 📂 **Video upload & storage**  
  Upload story media to Supabase Storage and re-use it across branches.

- 👁️ **Live preview**  
  See how your branching structure and story cards will look before publishing.

- 📊 **Story stats**  
  Track basic engagement such as paths, views and likes for each story.

- 🌍 **Multilingual-ready**  
  Built with an i18n hook and language switcher so the UI can support multiple languages.

---

### Accounts & settings

- 🔐 **Supabase Auth**  
  Email/password authentication with protected routes for creating and managing your stories.

- 👤 **Profile page**  
  View your profile, see your published stories and basic stats.

- ⚙️ **Settings**  
  Update profile details and language preferences from a dedicated settings page.

---

### Under the hood

- ⚛️ **Next.js 15 (App Router) + TypeScript**  
  Fully typed React app with server components and modern routing.

- 🗄️ **Supabase PostgreSQL**  
  Hosted Postgres database for stories, branches, users and interactions.

- 📦 **Supabase Storage**  
  File storage for story media, wired into the create flow.

- 🎨 **Tailwind CSS design system**  
  Reusable components for cards, buttons, layouts and skeleton states.

- ☁️ **Vercel deployment**  
  CI/CD from GitHub → Vercel, with production build already live.

## Documentation

### Core Documentation
- **Project Overview**: `docs/PROJECT_OVERVIEW.md`
- **Priorities**: `docs/PROJECT_PRIORITIES.md`
- **Architecture**: `docs/ARCHITECTURE.md`
- **Setup Guide**: `docs/SETUP.md`
- **API Documentation**: `docs/API.md`
- **Database Schema**: `docs/DATABASE.md`

### Deployment
- **Production Deployment**: `docs/PRODUCTION_DEPLOYMENT.md` ⭐
- **Deployment Checklist**: `docs/DEPLOYMENT_CHECKLIST.md`
- **Performance Monitoring**: `docs/PERFORMANCE_MONITORING.md`

### Features
- **Features Documentation**: `docs/features/` directory
- **Operations**: `docs/OPERATIONS_PLAYBOOK.md`
- **Revenue Strategy**: `docs/REVENUE_PLAYBOOK.md`

## Development

- **Type checking**: `pnpm run typecheck`
- **Linting**: `pnpm run lint`
- **Build**: `pnpm run build`
- **Start production**: `pnpm start`
- **Testing**: 
  - Unit/Component: `pnpm test` or `pnpm test:watch`
  - E2E: `pnpm test:e2e` (requires Playwright setup)

## Deployment

### Prerequisites

1. **Supabase Project**: Create a Supabase project at [supabase.com](https://supabase.com)
2. **Database Setup**: Run migrations from `supabase/migrations/` in Supabase SQL Editor
3. **Storage Setup**: Create `stories` bucket in Supabase Storage (see `docs/STORAGE_SETUP_INSTRUCTIONS.md`)

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

See `docs/DEPLOYMENT.md` for detailed deployment guide.

## Status

✅ **MVP Complete** - Phase 1, 2, and 3 completed

- ✅ Phase 1: Foundation (Database, Auth, UI Components)
- ✅ Phase 2: Core Features (Branching Stories, Feed, Interactions)
- ✅ Phase 3: Polish (Error Handling, Loading States, Responsive Design, Testing)

See `docs/PROJECT_PRIORITIES.md` for detailed feature list and `docs/PROJECT_STATUS.md` for current status.

## About the Creator

Hi, I'm Rezi — a self-taught developer from Georgia learning modern web development and product design step by step.

BranchFeed is my first public production project. I'm using it to practice:

- shipping real features end-to-end,
- working with modern tools (Next.js, TypeScript, Supabase, Vercel),
- writing clear documentation and project structure.

Feedback, issues and suggestions are always welcome via GitHub Issues.

