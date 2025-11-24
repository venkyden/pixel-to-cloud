# 🚨 CRITICAL SECURITY BREACH - Action Plan

## SEVERITY: HIGH - Public Repository with Exposed Credentials

### What Was Exposed (Confirmed)
✅ **Repository:** https://github.com/venkyden/pixel-to-cloud (PUBLIC)  
✅ **Exposed in git history:** `.env` file committed on Nov 9, 2025

**Compromised Credentials:**
- ✅ Supabase Project ID: `zsxjpkoqejxmvgoxqeqn`
- ✅ Supabase Anon Key (JWT token)
- ✅ Supabase URL: `https://zsxjpkoqejxmvgoxqeqn.supabase.co`

**Potentially Exposed (in Lovable, need verification):**
- OPENAI_API_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_PHONE_NUMBER
- SENTRY_DSN
- LOVABLE_API_KEY

---

## IMMEDIATE ACTIONS (DO NOW - 15 minutes)

### Step 1: Rotate Supabase Credentials (URGENT)
```bash
# 1. Go to Supabase Dashboard
open https://supabase.com/dashboard/project/zsxjpkoqejxmvgoxqeqn/settings/api

# 2. Generate NEW anon/public key
# 3. If service_role key exists, regenerate it too
# 4. Update local .env with NEW keys
```

### Step 2: Add .env to .gitignore (NOW)
```bash
cd /Users/venkat/pixel-to-cloud

# Add .env to gitignore
echo "" >> .gitignore
echo "# Environment variables" >> .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.*.local" >> .gitignore

# Verify
git check-ignore .env
# Should output: .env

# Commit this
git add .gitignore
git commit -m "security: add .env to gitignore"
```

### Step 3: Remove .env from Git History
```bash
# Option A: BFG Repo-Cleaner (RECOMMENDED)
brew install bfg

# Backup first
cd ..
cp -r pixel-to-cloud pixel-to-cloud-backup
cd pixel-to-cloud

# Remove .env from ALL commits
bfg --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (this rewrites history)
git push origin --force --all
git push origin --force --tags
```

```bash
# Option B: If BFG doesn't work, use filter-branch
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin --force --all
```

---

## SECONDARY ACTIONS (Next 30 minutes)

### Step 4: Check if Other Secrets in Git
```bash
# Search for any secret patterns
git log --all -p | grep -E "sk_live|pk_live|OPENAI|TWILIO|SECRET"

# If found, rotate those too
```

### Step 5: Rotate Other API Keys
- **OpenAI:** https://platform.openai.com/api-keys → Revoke → Create new
- **Stripe:** https://dashboard.stripe.com/apikeys → Roll keys
- **Twilio:** https://console.twilio.com → Revoke → Generate new
- **Sentry:** https://sentry.io/settings/account/api/auth-tokens/

### Step 6: Check Supabase Logs
```bash
# Look for suspicious activity from unknown IPs
open https://supabase.com/dashboard/project/zsxjpkoqejxmvgoxqeqn/logs/explorer
```

### Step 7: Review Row Level Security
```bash
# Ensure RLS is enabled on ALL tables
open https://supabase.com/dashboard/project/zsxjpkoqejxmvgoxqeqn/auth/policies
```

---

## LONG-TERM ACTIONS (This week)

### Step 8: Enable GitHub Secret Scanning
```bash
# Go to repo settings
open https://github.com/venkyden/pixel-to-cloud/settings/security_analysis

# Enable:
# - Secret scanning
# - Push protection
# - Dependabot alerts
```

### Step 9: Consider Making Repo Private
```bash
# If this is a commercial project
open https://github.com/venkyden/pixel-to-cloud/settings

# Change to Private under "Danger Zone"
```

### Step 10: Set Up Pre-commit Hooks
```bash
# Install git-secrets
brew install git-secrets

cd /Users/venkat/pixel-to-cloud
git secrets --install
git secrets --register-aws

# Add custom patterns
git secrets --add 'SUPABASE.*KEY'
git secrets --add 'STRIPE.*KEY'
git secrets --add 'OPENAI.*KEY'
git secrets --add 'TWILIO.*'
```

---

## VERIFICATION CHECKLIST

- [ ] Rotated Supabase anon key
- [ ] Rotated Supabase service_role key (if it was exposed)
- [ ] Added .env to .gitignore
- [ ] Removed .env from git history (BFG or filter-branch)
- [ ] Force pushed to GitHub
- [ ] Verified .env no longer in git history: `git log --all --full-history -- .env`
- [ ] Checked Supabase logs for suspicious activity
- [ ] Verified RLS policies are enabled
- [ ] Rotated OpenAI key (if was in .env)
- [ ] Rotated Stripe keys (if was in .env)
- [ ] Rotated Twilio credentials (if was in .env)
- [ ] Updated Lovable.dev with new credentials
- [ ] Tested app still works with new credentials
- [ ] Enabled GitHub secret scanning
- [ ] Installed git-secrets for future protection

---

## DAMAGE ASSESSMENT

### Exposure Window
- **First commit with .env:** Nov 9, 2025
- **Public repo since:** Unknown (likely same time)
- **Exposure duration:** ~15 days

### Risk Level by Credential

| Credential | Risk | Impact if Misused |
|-----------|------|-------------------|
| Supabase Anon Key | **MEDIUM** | Limited by RLS policies, but could query/modify data if RLS weak |
| Supabase Service Key | **CRITICAL** | Full database access, bypass RLS |
| Stripe Secret Key | **CRITICAL** | Create charges, refunds, access customer data |
| OpenAI API Key | **MEDIUM** | Rack up API costs |
| Twilio Credentials | **MEDIUM** | Send SMS, rack up costs |

### Recommended Monitoring
- Review Stripe transactions for unauthorized charges
- Check OpenAI usage for unusual spikes
- Monitor Twilio for unexpected SMS sends
- Watch Supabase logs for unknown IP addresses

---

## Questions to Investigate

1. **When did you make the repo public?**
2. **Did you ever commit Stripe secret keys?**
3. **Are your RLS policies properly configured?**
4. **Have you noticed any unusual activity?**

---

## Next Steps

**RIGHT NOW:**
1. Rotate Supabase keys (5 min)
2. Add .env to .gitignore (1 min)
3. Remove from git history with BFG (5 min)

**After securing:**
I'll help you verify everything is clean and set up preventive measures.

Ready to start? Which step do you want help with first?
