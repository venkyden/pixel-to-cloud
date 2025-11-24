#!/bin/bash
# Clean Git History - Remove .env from all commits
# WARNING: This rewrites git history and requires force push

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${RED}=================================="
echo "  GIT HISTORY CLEANUP"
echo "  WARNING: This is destructive!"
echo -e "==================================${NC}"
echo ""

# Safety check
echo -e "${YELLOW}This will:${NC}"
echo "1. Remove .env from ALL git commits"
echo "2. Rewrite git history"
echo "3. Require force push to origin"
echo ""
echo -e "${RED}IMPORTANT: Coordinate with your team before running!${NC}"
echo ""
read -p "Have you created a backup? (yes/no): " backup
if [ "$backup" != "yes" ]; then
    echo "Create backup first:"
    echo "  cd .."
    echo "  cp -r pixel-to-cloud pixel-to-cloud-backup"
    exit 1
fi
echo ""

# Check if BFG is installed
if ! command -v bfg &> /dev/null; then
    echo -e "${RED}BFG Repo-Cleaner not installed${NC}"
    echo ""
    echo "Install with:"
    echo "  brew install bfg"
    echo ""
    exit 1
fi

echo -e "${GREEN}Starting cleanup...${NC}"
echo ""

# Step 1: Remove .env with BFG
echo "Step 1: Removing .env from history..."
bfg --delete-files .env

# Step 2: Clean up refs
echo "Step 2: Cleaning up git refs..."
git reflog expire --expire=now --all

# Step 3: Garbage collection
echo "Step 3: Running garbage collection..."
git gc --prune=now --aggressive

echo ""
echo -e "${GREEN}✓ Local cleanup complete${NC}"
echo ""

# Verify
echo "Verifying .env is removed from history..."
if git log --all --full-history -- .env | grep -q "commit"; then
    echo -e "${RED}✗ ERROR: .env still in history${NC}"
    exit 1
else
    echo -e "${GREEN}✓ .env successfully removed from history${NC}"
fi
echo ""

# Force push instructions
echo -e "${YELLOW}=================================="
echo "  NEXT STEP: Force Push"
echo -e "==================================${NC}"
echo ""
echo "To complete cleanup, you MUST force push:"
echo ""
echo -e "${RED}  git push origin --force --all${NC}"
echo -e "${RED}  git push origin --force --tags${NC}"
echo ""
echo -e "${YELLOW}⚠ This will rewrite public repository history${NC}"
echo ""
read -p "Push now? (yes/no): " push
if [ "$push" = "yes" ]; then
    echo "Pushing..."
    git push origin --force --all
    git push origin --force --tags
    echo ""
    echo -e "${GREEN}✓ Repository cleaned and pushed${NC}"
    echo ""
    echo "CRITICAL: Rotate all credentials NOW!"
    echo "Old credentials in git history are still exposed until rotated."
else
    echo ""
    echo "Remember to force push when ready!"
fi
