# Referee Finance Tracker

A personal finance web application designed for sports referees to track game assignments, payments received, and expenses. Built with React, Vite, Tailwind CSS, and Supabase. Deployed easily to Cloudflare Pages from GitHub.

Since you don't choose when you get paid (and you're the one getting paid), this app helps you log expected fees, track pending payments, record when money arrives, and manage related expenses like travel and equipment.

## Features

- **Authentication**: Secure login/signup with Supabase Auth
- **Dashboard**: Overview of total earnings, pending payments, expenses, net income, and monthly charts
- **Assignments**: Log games with date, sport, league, location, expected fee, and payment status (pending/paid/cancelled)
- **Expenses**: Track costs by category (Travel, Equipment, etc.)
- **Data Isolation**: Row Level Security ensures only you see your data
- **Responsive UI**: Clean, modern interface

## Tech Stack

- Frontend: React 19 + TypeScript + Vite + Tailwind CSS
- Backend: Supabase (PostgreSQL + Auth + RLS)
- Charts: Recharts
- Icons: Lucide React
- Deployment: Cloudflare Pages (from GitHub)

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free project.
2. In the SQL Editor, run the contents of `supabase/schema.sql` to create the tables and RLS policies.
3. Go to **Settings > API** and copy:
   - Project URL
   - `anon` public key

### 2. Local Development

1. Clone this repo.
2. Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the dev server:
   ```bash
   npm run dev
   ```

### 3. Deploy to Cloudflare Pages

1. This code is already on GitHub.
2. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com) > **Workers & Pages**.
3. Create a new project > **Connect to Git** > select this repo.
4. Build settings:
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Build output directory: `dist`
5. Environment variables (in the project settings):
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
6. Deploy. Your site will be live on a `*.pages.dev` URL (and you can add a custom domain).

## Usage

1. Sign up / Sign in with your email.
2. Add assignments (games) with expected fees.
3. When you get paid, edit the assignment to mark it as paid and enter the amount/date.
4. Log expenses as they occur.
5. Check the Dashboard for summaries and trends.

## Customization

- Add more expense categories in `src/components/Expenses.tsx`.
- Extend the schema for additional fields (e.g., mileage, tax estimates).
- Add more reports or filters as needed.

## Notes

- This is a personal tool. All data is private to your account via RLS.
- Free tiers of Supabase and Cloudflare Pages are sufficient for individual use.
- For production, consider enabling email confirmations in Supabase Auth settings.

## License

MIT - Feel free to use and modify for your referee finances.
