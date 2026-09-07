# EduVerse

**Learn Today, Lead Tomorrow.**

A modern, mobile-first online learning and course-selling platform built for the Bangladeshi education market.

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **UI**: Custom components + Lucide icons
- **Backend / Auth / DB**: Supabase (Auth + PostgreSQL + Row Level Security)
- **Deployment**: Vercel-ready

## Features

- Role-based access (Admin / Instructor / Student)
- Course hierarchy: Category → Course → Subject → Chapter → Lesson
- Access Token system (one-time unlock codes)
- YouTube video embedding (unlisted videos)
- Google Drive lecture sheets
- Comments & Reactions
- Enrollment & Order system (mock payment ready for SSLCOMMERZ)
- Full Admin Dashboard
- Mobile-first responsive design with bottom navigation

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/jihadkhan9039-ctrl/EduVerse.git
cd EduVerse
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration file:
   ```
   supabase/migrations/001_initial_schema.sql
   ```
3. Enable Email Auth in Authentication → Providers
4. (Optional) Configure Storage for avatars/thumbnails

### 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase keys:

```bash
cp .env.example .env.local
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                  # App Router pages
│   ├── (auth)/           # Login, Signup, etc.
│   ├── (main)/           # Student-facing pages
│   ├── admin/            # Admin dashboard
│   └── api/              # API routes
├── components/
│   ├── ui/               # Reusable UI primitives
│   ├── course/           # Course related components
│   ├── lesson/           # Lesson player, comments, reactions
│   └── admin/            # Admin specific components
├── lib/                  # Utilities, Supabase clients
├── hooks/                # Custom React hooks
└── types/                # TypeScript types
supabase/
└── migrations/           # SQL schema + RLS policies
```

## Roles

| Role       | Capabilities                                      |
|------------|---------------------------------------------------|
| Admin      | Full access to everything                         |
| Instructor | Manage assigned courses, reply to comments        |
| Student    | Access enrolled courses only                      |

## Access Token Flow

1. Admin generates a token for a specific course
2. Student opens locked course → "Enter Access Token"
3. Token is validated server-side
4. Enrollment is created, token is marked used
5. Course unlocks permanently for that user

## Payment

Currently runs in **mock mode**. The architecture is ready for SSLCOMMERZ (or any other gateway). Set `PAYMENT_GATEWAY=sslcommerz` and provide credentials when ready.

## Deployment (Vercel)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

## License

Private / All rights reserved.
