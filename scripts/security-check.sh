#!/bin/bash
# Production Security Remediation Script
# Run this after rotating Supabase credentials

set -e

echo "🔒 Production Security Remediation"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Verify .env is in .gitignore
echo -e "${YELLOW}Step 1: Verifying .env is in .gitignore...${NC}"
if git check-ignore .env > /dev/null 2>&1; then
    echo -e "${GREEN}✓ .env is properly ignored${NC}"
else
    echo -e "${RED}✗ WARNING: .env is NOT in .gitignore${NC}"
    echo "Adding .env to .gitignore..."
    echo ".env" >> .gitignore
fi
echo ""

# Step 2: Check if .env exists in git history
echo -e "${YELLOW}Step 2: Checking if .env exists in git history...${NC}"
if git log --all --full-history -- .env | grep -q "commit"; then
    echo -e "${RED}✗ CRITICAL: .env found in git history!${NC}"
    echo ""
    echo "You MUST clean git history. Run:"
    echo ""
    echo -e "${YELLOW}  brew install bfg${NC}"
    echo -e "${YELLOW}  bfg --delete-files .env${NC}"
    echo -e "${YELLOW}  git reflog expire --expire=now --all${NC}"
    echo -e "${YELLOW}  git gc --prune=now --aggressive${NC}"
    echo -e "${YELLOW}  git push origin --force --all${NC}"
    echo ""
    exit 1
else
    echo -e "${GREEN}✓ .env NOT found in git history${NC}"
fi
echo ""

# Step 3: Verify .env file exists locally
echo -e "${YELLOW}Step 3: Checking for local .env file...${NC}"
if [ -f .env ]; then
    echo -e "${GREEN}✓ .env file exists${NC}"
    
    # Check for Supabase keys
    if grep -q "VITE_SUPABASE" .env; then
        echo -e "${GREEN}✓ Supabase configuration found${NC}"
    else
        echo -e "${RED}✗ WARNING: No Supabase keys in .env${NC}"
    fi
else
    echo -e "${RED}✗ ERROR: .env file not found${NC}"
    echo "Create .env from .env.example"
    exit 1
fi
echo ""

# Step 4: Check if secrets are in code
echo -e "${YELLOW}Step 4: Scanning for hardcoded secrets in code...${NC}"
if grep -r "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" src/ 2>/dev/null; then
    echo -e "${RED}✗ CRITICAL: Hardcoded Supabase token found in source code!${NC}"
    exit 1
else
    echo -e "${GREEN}✓ No hardcoded secrets found${NC}"
fi
echo ""

# Step 5: Verify production build works
echo -e "${YELLOW}Step 5: Testing production build...${NC}"
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Production build succeeds${NC}"
else
    echo -e "${RED}✗ ERROR: Production build failed${NC}"
    echo "Run 'npm run build' to see errors"
    exit 1
fi
echo ""

# Step 6: Check for git-secrets installation
echo -e "${YELLOW}Step 6: Checking for git-secrets...${NC}"
if command -v git-secrets &> /dev/null; then
    echo -e "${GREEN}✓ git-secrets is installed${NC}"
    
    # Check if initialized
    if git secrets --list &> /dev/null; then
        echo -e "${GREEN}✓ git-secrets is configured${NC}"
    else
        echo -e "${YELLOW}⚠ git-secrets not initialized. Run:${NC}"
        echo "  git secrets --install"
        echo "  git secrets --add 'SUPABASE.*KEY'"
    fi
else
    echo -e "${YELLOW}⚠ git-secrets not installed. Recommended:${NC}"
    echo "  brew install git-secrets"
fi
echo ""

# Summary
echo "=================================="
echo -e "${GREEN}Security Check Complete${NC}"
echo ""
echo "Next steps:"
echo "1. Rotate Supabase keys in dashboard"
echo "2. Update .env with new keys"
echo "3. Run this script again to verify"
echo "4. Deploy to production with new keys"
echo ""
echo "For detailed instructions, see SECURITY_RESPONSE.md"
