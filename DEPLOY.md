# Deployment Guide for Roomivo

This guide outlines the steps to deploy the Roomivo platform to production.

## Prerequisites
- **Node.js**: v18 or higher
- **Supabase Project**: You need a Supabase project with the database schema applied.
- **Vercel Account**: Recommended for Next.js deployment.

## 1. Environment Variables
Ensure your production environment has the following variables set (see `.env.example`):
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key

## 2. Database Migration
If you haven't already, apply the database schema to your Supabase project:
```bash
npx supabase db push
```

## 3. Deploying to Vercel (Recommended)
1.  Push your code to a Git repository (GitHub/GitLab).
2.  Import the project in Vercel.
3.  Vercel will automatically detect Next.js.
4.  Add the Environment Variables in the Vercel dashboard.
5.  Click **Deploy**.

## 4. Deploying to Netlify
1.  Push your code to Git.
2.  Import site in Netlify.
3.  Build command: `npm run build`
4.  Publish directory: `.next`
5.  Add Environment Variables.

## 5. Manual Build
To build and run locally in production mode:
```bash
npm run build
npm start
```

## 6. Verification
After deployment, verify the following:
- **Tenant Dashboard**: Login as a tenant, update profile, check matches.
- **Landlord Dashboard**: Login as a landlord, check insights.
- **Supabase Connection**: Ensure data is persisting to your production database.

## Troubleshooting
- **Build Errors**: Check `npm run lint` locally.
- **Connection Errors**: Verify `NEXT_PUBLIC_SUPABASE_URL` is correct in Vercel/Netlify.
