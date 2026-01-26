#!/bin/bash
# Run Supabase migrations for Immi-OS audit tables
# Usage: ./scripts/run-migrations.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Immi-OS Database Migration ===${NC}"

# Check environment variables
if [ -z "$SUPABASE_DB_URL" ]; then
  echo -e "${RED}Error: SUPABASE_DB_URL not set${NC}"
  echo "Please set: export SUPABASE_DB_URL=postgresql://postgres:PASSWORD@192.168.1.98:5432/postgres"
  exit 1
fi

# Migration files
MIGRATIONS_DIR="$(dirname "$0")/../supabase/migrations"
MIGRATIONS=(
  "20260126000000_create_io_audit_tables.sql"
  "20260126100000_add_optimistic_lock.sql"
  "20260127000000_add_privacy_tables.sql"
)

echo -e "${YELLOW}Found ${#MIGRATIONS[@]} migration files${NC}"

# Check if psql is available
if ! command -v psql &> /dev/null; then
  echo -e "${RED}Error: psql not found${NC}"
  echo "Please install PostgreSQL client:"
  echo "  brew install postgresql@16"
  exit 1
fi

# Run each migration
for migration in "${MIGRATIONS[@]}"; do
  migration_file="$MIGRATIONS_DIR/$migration"
  
  if [ ! -f "$migration_file" ]; then
    echo -e "${RED}Error: Migration file not found: $migration_file${NC}"
    exit 1
  fi
  
  echo -e "${YELLOW}Running: $migration${NC}"
  
  if psql "$SUPABASE_DB_URL" -f "$migration_file" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ $migration completed${NC}"
  else
    echo -e "${RED}✗ $migration failed${NC}"
    echo "Trying to continue..."
  fi
done

echo -e "${GREEN}=== Migration Complete ===${NC}"

# Verify tables exist
echo -e "${YELLOW}Verifying tables...${NC}"
psql "$SUPABASE_DB_URL" -c "\dt io_audit_*" || echo -e "${RED}Warning: Could not verify tables${NC}"

echo -e "${GREEN}Done!${NC}"
