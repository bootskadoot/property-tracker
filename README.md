# Property Portfolio Tracker

Australian FIRE property portfolio tracker built with React, Vite, TypeScript, and Supabase.

## Quick Start

### 1. Set Up Supabase Database

1. Go to your Supabase project: https://supabase.com/dashboard/project/sfuvhrtgqsyxjeunolgv
2. Click on **SQL Editor** in the left sidebar
3. Click **+ New query**
4. Copy the entire contents of `database-setup.sql`
5. Paste into the SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. Wait for "Success. No rows returned" message

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

Open http://localhost:5173 (or the port shown in terminal)

### 4. Test the App

1. Click **Sign up** to create a new account
2. Complete the onboarding wizard:
   - Set your FIRE income goal (e.g., $100,000)
   - Choose your timeline (e.g., 10 years)
   - Set risk tolerance (1-10 slider)
   - Select investment strategy
3. You'll be redirected to the dashboard

## Project Structure

```
src/
├── components/      # Reusable UI components
│   ├── AuthForm.tsx
│   └── LoadingSpinner.tsx
├── pages/          # Route pages
│   ├── Login.tsx
│   ├── Signup.tsx
│   ├── Onboarding.tsx
│   └── Dashboard.tsx
├── contexts/       # React contexts
│   └── AuthContext.tsx
├── hooks/          # Custom React hooks
│   └── useAuth.ts
├── lib/            # Utilities
│   └── supabase.ts
├── types/          # TypeScript types
│   └── database.ts
└── constants/      # Constants (will add Australian states, etc.)
```

## Features Implemented

### Phase 0: Foundation ✅
- React + Vite + TypeScript project
- Tailwind CSS with Australian color scheme (deep blue + green)
- Supabase integration
- Complete database schema

### Phase 1: Authentication & Onboarding ✅
- Sign up / Login with email & password
- Multi-step onboarding wizard
- FIRE goal tracking (income target, timeline, risk tolerance, strategy)
- Protected routes with auto-redirect
- User profile management

## Coming Next

- **Phase 2**: Property Management
  - Add properties with address, purchase details, loan info
  - Property list view with key metrics
  - Property detail pages with value history

- **Phase 3**: Cashflow Tracking
  - Monthly income/expense tracking
  - Cashflow charts and summaries

- **Phase 4**: Advanced Features (Pro Tier)
  - Portfolio analytics
  - Advanced charts
  - Property comparison
  - CSV export

- **Phase 5**: FIRE Goal Tracking (Pro Tier)
  - Progress dashboard
  - FIRE calculator
  - Timeline projections

## Database Schema

- **users** - User profiles with FIRE goals and subscription tier
- **properties** - Property details (address, purchase info, loans)
- **value_history** - Historical property valuations
- **cashflow** - Monthly income and expenses per property

## Environment Variables

Copy `.env.example` to `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Routing**: React Router v6
- **Charts**: Recharts (for Phase 2+)
- **Date Formatting**: date-fns (for DD/MM/YYYY Australian format)

## Security Features

- Row Level Security (RLS) on all tables
- Free tier limited to 2 properties (enforced at database level)
- User data isolation
- Automatic user profile creation on signup

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure you've created a `.env` file (not `.env.example`)
- Check that the values are correct

### Database errors
- Run the `database-setup.sql` script in Supabase SQL Editor
- Make sure all tables and policies were created successfully

### Build errors
- Delete `node_modules` and run `npm install` again
- Check that all dependencies are installed

## License

MIT
