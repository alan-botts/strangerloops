#!/bin/bash
# fetch_credential.sh — Retrieve credentials safely
#
# Usage:
#   fetch_credential.sh <name> [key]
#   fetch_credential.sh tpuf api_key     # Returns just the value
#   fetch_credential.sh tpuf             # Returns full JSON object
#
# Reads from $SECRETS_DIR/<name>.json (default: .secrets/)
# Exit code 1 if credential or key not found.

set -e

SECRETS_DIR="${SECRETS_DIR:-.secrets}"

# Find jq - prefer local workspace binary, fall back to system
JQ_BIN=""
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

if [ -x "$WORKSPACE_ROOT/tools/bin/jq" ]; then
    JQ_BIN="$WORKSPACE_ROOT/tools/bin/jq"
elif command -v jq &>/dev/null; then
    JQ_BIN="jq"
fi

usage() {
    echo "Usage: fetch_credential.sh <name> [key]"
    echo ""
    echo "Examples:"
    echo "  fetch_credential.sh tpuf api_key    # Get single value"
    echo "  fetch_credential.sh tpuf            # Get full JSON"
    echo "  API_KEY=\$(fetch_credential.sh tpuf api_key)"
    echo ""
    echo "Environment:"
    echo "  SECRETS_DIR  Directory for credential files (default: .secrets)"
    exit 1
}

if [ $# -lt 1 ]; then
    usage
fi

NAME="$1"
KEY="${2:-}"

# Validate name
if [[ ! "$NAME" =~ ^[a-zA-Z0-9_-]+$ ]]; then
    echo "Error: Invalid credential name." >&2
    exit 1
fi

CRED_FILE="$SECRETS_DIR/$NAME.json"

if [ ! -f "$CRED_FILE" ]; then
    echo "Error: Credential file not found: $CRED_FILE" >&2
    exit 1
fi

if [ -z "$KEY" ]; then
    # Return full JSON
    cat "$CRED_FILE"
else
    # Return specific key value
    if [ -n "$JQ_BIN" ]; then
        # Use jq if available
        VALUE=$("$JQ_BIN" -r --arg k "$KEY" '.[$k] // empty' "$CRED_FILE")
    else
        # Fall back to Python
        VALUE=$(python3 -c "
import json, sys
try:
    data = json.load(open('$CRED_FILE'))
    key = '$KEY'
    if key in data:
        print(data[key])
    else:
        sys.exit(1)
except Exception:
    sys.exit(1)
" 2>/dev/null)
    fi
    
    if [ -z "$VALUE" ]; then
        echo "Error: Key '$KEY' not found in $NAME credentials" >&2
        exit 1
    fi
    echo "$VALUE"
fi
