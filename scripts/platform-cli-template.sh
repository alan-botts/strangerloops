#!/bin/bash
#
# platform-cli-template.sh - Template for building platform CLIs
#
# This shows the pattern for loading credentials safely from files.
# Copy and adapt this for any platform API.
#
# Setup:
#   1. Create secrets/<platform>.json with your API credentials
#   2. Add secrets/ to .gitignore
#   3. Copy this template and customize
#
# Usage:
#   ./my-platform-cli.sh <command> [args...]

set -e

# === CONFIGURATION ===
# Override these for your platform
PLATFORM_NAME="example"
CREDS_FILE="${CREDS_PATH:-secrets/${PLATFORM_NAME}.json}"
API_BASE="https://api.example.com/v1"

# === CREDENTIAL LOADING ===
# Never hardcode API keys! Always load from file.

load_api_key() {
  if [ ! -f "$CREDS_FILE" ]; then
    echo "Error: Credentials file not found: $CREDS_FILE"
    echo ""
    echo "Create it with:"
    echo '  {"api_key": "your-key-here"}'
    exit 1
  fi
  
  # Extract api_key from JSON
  API_KEY=$(python3 -c "import json; print(json.load(open('$CREDS_FILE')).get('api_key', ''))" 2>/dev/null)
  
  if [ -z "$API_KEY" ]; then
    echo "Error: No api_key found in $CREDS_FILE"
    exit 1
  fi
}

# === API HELPERS ===

api_get() {
  local endpoint="$1"
  curl -s "${API_BASE}${endpoint}" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json"
}

api_post() {
  local endpoint="$1"
  local data="$2"
  curl -s -X POST "${API_BASE}${endpoint}" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d "$data"
}

# === COMMANDS ===

cmd_status() {
  echo "Checking $PLATFORM_NAME status..."
  api_get "/status" | python3 -c "import sys,json; d=json.load(sys.stdin); print(json.dumps(d, indent=2))"
}

cmd_post() {
  local message="$1"
  if [ -z "$message" ]; then
    echo "Usage: $0 post <message>"
    exit 1
  fi
  
  echo "Posting to $PLATFORM_NAME..."
  api_post "/posts" "{\"content\": \"$message\"}"
}

cmd_list() {
  local limit="${1:-10}"
  echo "Listing recent items..."
  api_get "/posts?limit=$limit" | python3 -c "import sys,json; d=json.load(sys.stdin); print(json.dumps(d, indent=2))"
}

# === MAIN ===

show_help() {
  cat << EOF
$PLATFORM_NAME CLI

Commands:
  status              Check API status
  post <message>      Post a message
  list [limit]        List recent items

Setup:
  Create $CREDS_FILE with:
  {"api_key": "your-key-here"}

Environment:
  CREDS_PATH    Override credentials file path
EOF
}

# Load credentials
load_api_key

# Route command
case "${1:-help}" in
  status)
    cmd_status
    ;;
  post)
    cmd_post "$2"
    ;;
  list)
    cmd_list "$2"
    ;;
  help|--help|-h)
    show_help
    ;;
  *)
    echo "Unknown command: $1"
    show_help
    exit 1
    ;;
esac
