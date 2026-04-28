# MemberHub - Multi-Tenant Membership Management Platform

A modern SaaS platform for professional organizations to manage members, track EVP/CPD compliance, handle annual payments, and send targeted notifications.

## Features

- **Multi-Tenant Architecture** - Each organization has isolated data, admins, and branding
- **Member Management** - Full CRUD with profiles, categories, and status tracking
- **EVP/CPD Tracking** - Submit, approve/reject CPD records with compliance monitoring
- **Payment Management** - Annual fee tracking with automatic member status updates
- **Notifications** - In-app notifications with targeted audience (by category/status)
- **Push Notifications** - Web Push API support for real-time alerts
- **PWA** - Installable as a native app on iOS, Android, and Desktop
- **Mobile-First UI** - Designed for phones first, responsive on desktop
- **Role-Based Access** - 8 roles from Platform Super Admin to Student
- **Audit Log** - Track all changes with user, action, module, and timestamp
- **Organization Settings** - Branding (logo, colors), EVP rules, membership fees

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Auth, PostgreSQL, Row Level Security, Realtime)
- **PWA**: Service Worker, Web App Manifest, Web Push API
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### 1. Clone and Install

```bash
git clone https://github.com/Bujar2030/membership-platform.git
cd membership-platform
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the contents of `supabase-schema.sql`
3. Copy your project URL and anon key from Settings > API

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Create Your First Account

1. Go to `/auth/register`
2. Create an account - a default IKAF organization will be created
3. To make yourself admin, update your role in Supabase dashboard:
   ```sql
   UPDATE user_profiles SET role = 'organization_admin' WHERE email = 'your@email.com';
   ```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/               # Login, Register, Callback
│   ├── dashboard/          # Admin & Member dashboards
│   ├── members/            # Member list & detail pages
│   ├── evp/                # EVP/CPD tracking
│   ├── payments/           # Payment management
│   ├── notifications/      # Notification center
│   ├── settings/           # Organization settings
│   └── audit-log/          # Audit trail
├── components/
│   ├── layout/             # App layout, sidebar, mobile nav
│   ├── shared/             # Reusable components (StatCard, StatusBadge, etc.)
│   └── ui/                 # shadcn/ui components
├── hooks/                  # Custom React hooks (useAuth, useOrganization)
├── lib/                    # Utilities, Supabase clients, constants
└── types/                  # TypeScript type definitions
```

## Roles

| Role | Access |
|------|--------|
| Platform Super Admin | All organizations |
| Organization Owner | Full org access |
| Organization Admin | Full org access |
| Membership Officer | Members module |
| EVP Officer | EVP/CPD module |
| Finance Officer | Payments module |
| Member | Own dashboard |
| Student | Own dashboard (limited) |

## PWA Installation

- **iOS**: Open in Safari > Share > "Add to Home Screen"
- **Android**: Chrome will show an install prompt automatically
- **Desktop**: Click the install icon in the address bar

## License

MIT
