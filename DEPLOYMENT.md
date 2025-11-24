# Production Deployment Guide

## Prerequisites
- Node.js 18+ installed
- Supabase account and project
- Stripe account (for payments)
- Domain name (for production)

## Environment Setup

1. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Configure environment variables:**
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Anonymous/public Supabase key
   - `VITE_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key

## Database Setup

1. **Run Supabase migrations:**
   ```bash
   supabase db push
   ```

2. **Enable Row Level Security (RLS):**
   All tables should have RLS enabled. Review policies in Supabase dashboard.

## Deploy Edge Functions

Deploy all Supabase Edge Functions:
```bash
supabase functions deploy ai-chat
supabase functions deploy ai-document-qa
supabase functions deploy ai-property-search
supabase functions deploy create-checkout
supabase functions deploy customer-portal
supabase functions deploy send-notification-email
supabase functions deploy send-sms
```

Set function secrets:
```bash
supabase secrets set OPENAI_API_KEY=your_key
supabase secrets set STRIPE_SECRET_KEY=your_key
supabase secrets set TWILIO_AUTH_TOKEN=your_token
```

## Build & Deploy Frontend

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build for production:**
   ```bash
   npm run build
   ```

3. **Deploy to hosting (e.g., Vercel, Netlify):**
   ```bash
   # Example for Vercel
   vercel --prod
   ```

## Stripe Configuration

1. **Set up webhook endpoint:**
   - URL: `https://your-supabase-project.functions.supabase.co/stripe-webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`

2. **Configure products and prices** in Stripe dashboard matching tiers in `SubscriptionContext.tsx`

## Post-Deployment Checklist

- [ ] Test user registration and login
- [ ] Verify email notifications  
- [ ] Test Stripe checkout flow
- [ ] Check file uploads to Supabase Storage
- [ ] Validate SMS notifications (if enabled)
- [ ] Monitor error logs
- [ ] Set up analytics (optional)

## Environment Variables Reference

### Required
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe public key

### Edge Function Secrets
- `STRIPE_SECRET_KEY` - Stripe secret key
- `OPENAI_API_KEY` - OpenAI API key (for AI features)
- `TWILIO_ACCOUNT_SID` - Twilio SID (for SMS)
- `TWILIO_AUTH_TOKEN` - Twilio token (for SMS)
- `TWILIO_PHONE_NUMBER` - Twilio phone (for SMS)

## Security Notes

1. **Never commit .env files** to version control
2. Ensure RLS policies are properly configured
3. Use HTTPS in production
4. Configure CORS appropriately
5. Enable rate limiting on Edge Functions

## Troubleshooting

### Build fails
- Check Node version (requires 18+)
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`

### Supabase connection issues  
- Verify environment variables
- Check Supabase project status
- Review RLS policies

### Stripe not working
- Verify webhook URL is correct
- Check webhook signing secret  
- Test with Stripe test mode first

## Support

For issues, check:
- Supabase logs in dashboard
- Browser console for frontend errors
- Edge Function logs in Supabase
