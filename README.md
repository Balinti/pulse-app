# Pulse

A privacy-first burnout prevention coach for remote workers with 10-second daily check-ins, calendar metadata insights, and measurable 2-minute work experiments.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes (Route Handlers)
- **Database:** Supabase (Postgres + Auth + RLS + Storage)
- **Payments:** Stripe (subscriptions with 7-day trial)
- **Integrations:** Google Calendar API (OAuth2, metadata-only)
- **Email:** Postmark (transactional + daily reminders)
- **Charts:** Recharts
- **Validation:** Zod
- **Deployment:** Vercel (Next.js) + Supabase Cloud

## Features

### Core Features
- 10-second daily check-ins (energy + stress sliders, optional tags & notes)
- 7-day trends visualization
- 2-minute evidence-based experiments with "proof loop" (next-day outcomes)
- Privacy-first calendar integration (metadata only - no event titles/descriptions)
- Smart recommendations based on check-ins and calendar patterns
- Weekly insights with correlation detection

### Pricing Tiers
- **Free:** Daily check-ins, 7-day trends, 3 experiments
- **Plus ($19.99/mo or $5.99/week):** Calendar insights, smart recommendations, unlimited experiments, 30-day history, 7-day free trial

### Privacy & Safety
- Calendar integration stores only start/end times (metadata-only)
- No event titles, descriptions, or attendee emails stored
- Export data anytime (JSON format)
- Delete account with full data removal
- Non-clinical tool (not therapy or crisis support)

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- Stripe account
- Google Cloud project (for Calendar API)
- Postmark account
- Vercel account (for deployment)

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_APP_URL` - Your app URL (http://localhost:3000 for dev)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `STRIPE_PLUS_WEEKLY_PRICE_ID` - Stripe price ID for weekly plan
- `STRIPE_PLUS_MONTHLY_PRICE_ID` - Stripe price ID for monthly plan
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `TOKEN_ENCRYPTION_KEY` - 32-byte base64 key for encrypting tokens
- `POSTMARK_SERVER_TOKEN` - Postmark server token
- `POSTMARK_FROM_EMAIL` - Sender email address
- `CRON_SECRET` - Secret for protecting cron endpoints

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up Supabase:
   - Create a new Supabase project
   - Run migrations in order:
     ```bash
     # In Supabase SQL Editor, run each migration file:
     # 1. supabase/migrations/001_init.sql
     # 2. supabase/migrations/002_rls.sql
     # 3. supabase/migrations/003_seed.sql
     ```
   - Create a storage bucket named `exports` with public access for temporary export files

3. Set up Stripe:
   - Create products for "Pulse Plus Weekly" and "Pulse Plus Monthly"
   - Enable subscriptions with 7-day trial
   - Set up webhook endpoint: `https://your-domain.com/api/stripe/webhook`
   - Add webhook events: `checkout.session.completed`, `customer.subscription.*`, `invoice.paid`

4. Set up Google Calendar API:
   - Create OAuth 2.0 credentials in Google Cloud Console
   - Add authorized redirect URI: `https://your-domain.com/api/integrations/google/callback`
   - Enable Google Calendar API

5. Set up Postmark:
   - Create a server and get server token
   - Verify sender email address

6. Generate encryption key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Database Schema

See `supabase/migrations/001_init.sql` for complete schema.

### Key Tables
- `profiles` - User profiles with timezone and work hours
- `checkins` - Daily check-ins (energy, stress, tags, notes)
- `experiments` - Catalog of 2-minute experiments
- `experiment_logs` - User experiment attempts and outcomes
- `calendar_accounts` - Encrypted Google Calendar tokens
- `calendar_daily_metrics` - Computed calendar metrics (metadata-only)
- `subscriptions` - Stripe subscription status
- `tags` - Predefined tags (meetings, conflict, sleep, etc.)
- `audit_events` - Privacy audit trail

## API Routes

All routes are in `src/app/api/`:

### Core
- `GET /api/health` - Health check
- `GET /api/me` - Current user + entitlements

### Check-ins
- `POST /api/checkins` - Create/update check-in
- `GET /api/checkins` - List check-ins (with date range)
- `GET /api/checkins/[date]` - Get specific date

### Experiments
- `GET /api/tags` - List tags
- `GET /api/experiments` - List experiments
- `POST /api/experiment-logs` - Log experiment attempt
- `PATCH /api/experiment-logs` - Update next-day outcome

### Insights
- `GET /api/recommendations/today` - Today's recommendation
- `GET /api/insights/weekly` - Weekly insights

### Integrations
- `GET /api/integrations/google/start` - Start OAuth flow
- `GET /api/integrations/google/callback` - OAuth callback
- `POST /api/integrations/google/disconnect` - Disconnect calendar
- `POST /api/integrations/google/sync` - Sync calendar metrics

### Billing
- `POST /api/stripe/checkout` - Create checkout session
- `POST /api/stripe/portal` - Create billing portal session
- `POST /api/stripe/webhook` - Stripe webhook handler

### Privacy
- `POST /api/data/export` - Export all user data
- `POST /api/data/delete-account` - Delete account

### Cron
- `POST /api/reminders/run-daily` - Send daily reminders (protected by `CRON_SECRET`)

## Deployment

### Vercel

1. Connect your GitHub repo to Vercel
2. Add all environment variables
3. Deploy

### Vercel Cron

Set up cron job in `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/reminders/run-daily",
      "schedule": "0 9 * * *"
    }
  ]
}
```

Add `CRON_SECRET` header to cron job settings.

## Security Notes

- All user data protected by Supabase RLS
- Calendar tokens encrypted with AES-256-GCM
- Stripe webhooks verified with signature
- API routes require authentication (except public routes)
- CRON endpoints protected by secret header

## Non-Clinical Disclaimer

Pulse is not therapy, medical advice, or crisis support. It's a tool for tracking patterns and trying evidence-based work practices. If you're experiencing a mental health crisis, contact a licensed professional or crisis hotline immediately.

## License

Proprietary - All Rights Reserved

## Support

For issues or questions, contact [your-support-email]
