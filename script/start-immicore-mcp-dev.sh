#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"

if [ -f "$ENV_FILE" ]; then
  set -a
  source "$ENV_FILE"
  set +a
fi

HOST_URL="${HOST_URL:-http://localhost:3104/api/v1}"
SEARCH_SERVICE_TOKEN="${SEARCH_SERVICE_TOKEN:-}"

if [ -z "$SEARCH_SERVICE_TOKEN" ]; then
  echo "SEARCH_SERVICE_TOKEN is required in .env"
  exit 1
fi

export HOST_URL
export SEARCH_SERVICE_TOKEN

LOG_DIR="/tmp/immicore-mcp"
mkdir -p "$LOG_DIR"

nohup npx -y @immicore/caselaw@latest --http --port 3105 > "$LOG_DIR/caselaw.log" 2>&1 &
nohup npx -y @immicore/email-kg@latest --http --port 3106 > "$LOG_DIR/email-kg.log" 2>&1 &
nohup npx -y @immicore/operation-manual@latest --http --port 3107 > "$LOG_DIR/operation-manual.log" 2>&1 &
nohup npx -y @immicore/noc@latest --http --port 3108 > "$LOG_DIR/noc.log" 2>&1 &
nohup npx -y @immicore/help-centre@latest --http --port 3109 > "$LOG_DIR/help-centre.log" 2>&1 &
nohup npx -y @immicore/immi-tools@latest --http --port 3009 > "$LOG_DIR/immi-tools.log" 2>&1 &

sleep 2

for port in 3105 3106 3107 3108 3109 3009; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${port}/health")
  echo "mcp:${port} => ${code}"
done
