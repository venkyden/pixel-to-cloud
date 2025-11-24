# Production Security Incident - Immediate Response Required

## STATUS: ACTIVE SECURITY BREACH - Production System

**This is NOT a drill. Your production credentials are exposed in a public repository.**

---

## CRITICAL: Do These 3 Things NOW (15 minutes)

### 1. Rotate Supabase Keys (5 min) - MANDATORY

```bash
# Open Supabase Dashboard
open https://supabase.com/dashboard/project/zsxjpkoqejxmvgoxqeqn/settings/api
```

**Action Required:**
1. Click "Generate new anon key" 
2. Click "Generate new service_role key"
3. Copy BOTH new keys
4. Update your local `.env` file with new keys
5. Update Lovable.dev secrets with new keys

**After rotation:**
- Old keys will STOP working immediately
- This breaks the breach - exposed keys become useless
- Anyone who copied old keys loses access

### 2. Clean Git History (5 min) - MANDATORY

```bash
# Install BFG Repo Cleaner
brew install bfg

# Backup your repo
cd /Users/venkat
cp -r pixel-to-cloud pixel-to-cloud-backup

# Remove .env from ALL git history
cd pixel-to-cloud
bfg --delete-files .env

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (rewrites public history)
git push origin --force --all
git push origin --force --tags
```

**Verification:**
```bash
# Verify .env is gone from history
git log --all --full-history -- .env
# Should return nothing
```

### 3. Update Production Environment (5 min) - MANDATORY

If you have a live deployment:
```bash
# Update Vercel/Netlify with NEW Supabase keys
# Go to your hosting dashboard → Environment Variables
# Replace old keys with new ones
# Trigger redeployment
```

---

## SECONDARY: Production Hardening (30 min)

### 4. Verify Row Level Security

```bash
open https://supabase.com/dashboard/project/zsxjpkoqejxmvgoxqeqn/auth/policies
```

**Check EVERY table has:**
- ✅ RLS Enabled
- ✅ Proper SELECT policies
- ✅ Proper INSERT/UPDATE/DELETE policies
- ✅ Policies test for `auth.uid()`

### 5. Check for Unauthorized Access

```bash
# Review Supabase logs
open https://supabase.com/dashboard/project/zsxjpkoqejxmvgoxqeqn/logs/explorer

# Look for:
# - Unknown IP addresses
# - Unusual query patterns
# - Failed auth attempts
# - Bulk data exports
```

### 6. Rotate ALL Other Secrets

**Stripe (if using production keys):**
```bash
open https://dashboard.stripe.com/apikeys
# Roll/regenerate ALL keys
# Update webhook signing secret
```

**OpenAI:**
```bash
open https://platform.openai.com/api-keys
# Revoke old key
# Create new key with spending limits
```

**Twilio:**
```bash
open https://console.twilio.com/us1/account/keys-credentials/api-keys
# Delete old credentials
# Generate new auth token
```

### 7. Enable Security Monitoring

```bash
# Enable GitHub Secret Scanning
open https://github.com/venkyden/pixel-to-cloud/settings/security_analysis

# Enable:
# ✅ Secret scanning
# ✅ Push protection  
# ✅ Dependabot alerts
# ✅ Code scanning
```

### 8. Set Up Pre-commit Protection

```bash
cd /Users/venkat/pixel-to-cloud

# Install git-secrets
brew install git-secrets
git secrets --install
git secrets --register-aws

# Add patterns for your secrets
git secrets --add 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
git secrets --add 'SUPABASE.*KEY'
git secrets --add 'sk_live_'
git secrets --add 'OPENAI_API_KEY'
git secrets --add 'TWILIO'
```

---

## VERIFICATION CHECKLIST

### Immediate (Must Complete Today)
- [ ] Rotated Supabase anon key
- [ ] Rotated Supabase service_role key  
- [ ] Removed .env from git history with BFG
- [ ] Force pushed to GitHub
- [ ] Verified .env no longer appears in: `git log --all -- .env`
- [ ] Updated production deployment with new keys
- [ ] Tested production site still works

### Security Audit (Within 24 hours)
- [ ] Reviewed Supabase logs for suspicious activity
- [ ] Verified ALL tables have RLS enabled
- [ ] Tested RLS policies work as expected
- [ ] Rotated Stripe keys (if in production)
- [ ] Rotated OpenAI keys
- [ ] Rotated Twilio credentials
- [ ] Enabled GitHub secret scanning
- [ ] Installed git-secrets locally

### Production Hardening (Within 1 week)
- [ ] Set up Sentry or error monitoring
- [ ] Configure backup strategy
- [ ] Document incident response procedures
- [ ] Set up alerts for unusual database activity
- [ ] Consider making repo private
- [ ] Enable 2FA on all service accounts
- [ ] Review and update access controls

---

## DAMAGE ASSESSMENT (Production Context)

### Exposure Timeline
- **First exposed:** Nov 9, 2025 (commit 31967ca)
- **Repository:** Public on GitHub
- **Exposure duration:** 15 days
- **Compromised credentials:** Supabase anon key

### Potential Impact (Production)

**If Service Role Key Was Exposed (CRITICAL):**
- Full database access
- Can bypass ALL RLS policies
- Can read/modify/delete ANY data
- Can create/drop tables
- **Action:** Immediately check if service_role key in .env

**Anon Key Exposed (MEDIUM - if RLS weak):**
- Limited by RLS policies
- Can query public data
- Can attempt RLS bypasses
- **Severity depends on RLS quality**

### Recommended Actions

1. **Audit Database Changes**
```sql
-- Check for unexpected data modifications
SELECT * FROM audit_logs 
WHERE created_at > '2025-11-09'
ORDER BY created_at DESC;
```

2. **Review User Accounts**
```sql
-- Look for suspicious user registrations  
SELECT * FROM auth.users
WHERE created_at > '2025-11-09'
ORDER BY created_at DESC;
```

3. **Check for Data Exports**
- Review Supabase logs for large SELECT queries
- Look for bulk exports from unknown IPs

---

## POST-INCIDENT HARDENING

### Make Repository Private (Recommended for Production)
```bash
open https://github.com/venkyden/pixel-to-cloud/settings
# Danger Zone → Change visibility → Private
```

### Set Up Secrets Management
- Use Vercel/Netlify env vars for production
- Never commit secrets again (.gitignore is now updated)
- Use different keys for dev/staging/production

### Implement Monitoring
```bash
# Set up Sentry
npm install @sentry/react @sentry/vite-plugin

# Or use Supabase logs with alerts
```

---

## PRODUCTION DEPLOYMENT CHECKLIST

After securing everything:

```bash
# 1. Verify local environment
npm install
npm run build
# Should succeed with no errors

# 2. Deploy to production
vercel --prod
# Or your preferred hosting

# 3. Smoke test production
# - Test authentication
# - Test database operations  
# - Check error monitoring
# - Verify all features work

# 4. Monitor for 24 hours
# Watch logs for errors or unusual activity
```

---

## NEXT STEPS

**RIGHT NOW (stop reading, do this):**
1. Open Supabase → Rotate keys
2. Run BFG to clean git history  
3. Update production deployment

**After securing:**
- I'll help verify everything is locked down
- We'll set up proper monitoring
- We'll implement incident response procedures

**This is production. Security first. Features second.**

Ready to start? Which step are you on?
