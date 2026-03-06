#!/bin/bash
# upsert_credential.sh — Safely store credentials
#
# Usage:
#   upsert_credential.sh <name> <key> <value>
#   upsert_credential.sh tpuf api_key "sk-abc123"
#   upsert_credential.sh tpuf namespace "alan-memory"
#   echo '{"api_key":"sk-abc"}' | upsert_credential.sh tpuf --stdin
#
# Stores credentials in $SECRETS_DIR/<name>.json (default: .secrets/)
# Creates the directory and file if they don't exist.
# Merges with existing keys (upsert behavior).

set -e

SECRETS_DIR="${SECRETS_DIR:-.secrets}"

usage() {
    echo "Usage: upsert_credential.sh <name> <key> <value>"
    echo "       upsert_credential.sh <name> --stdin  (read full JSON from stdin)"
    echo ""
    echo "Examples:"
    echo "  upsert_credential.sh tpuf api_key 'sk-abc123'"
    echo "  upsert_credential.sh openai api_key 'sk-xyz'"
    echo "  echo '{\"api_key\":\"sk-abc\"}' | upsert_credential.sh tpuf --stdin"
    echo ""
    echo "Environment:"
    echo "  SECRETS_DIR  Directory for credential files (default: .secrets)"
    exit 1
}

if [ $# -lt 2 ]; then
    usage
fi

NAME="$1"
shift

# Validate name (alphanumeric, dash, underscore only)
if [[ ! "$NAME" =~ ^[a-zA-Z0-9_-]+$ ]]; then
    echo "Error: Invalid credential name. Use only alphanumeric, dash, underscore." >&2
    exit 1
fi

# Create secrets directory if needed
mkdir -p "$SECRETS_DIR"
chmod 700 "$SECRETS_DIR"

CRED_FILE="$SECRETS_DIR/$NAME.json"

# Initialize file if it doesn't exist
if [ ! -f "$CRED_FILE" ]; then
    echo '{}' > "$CRED_FILE"
    chmod 600 "$CRED_FILE"
fi

if [ "$1" = "--stdin" ]; then
    # Read full JSON from stdin and merge
    INPUT_JSON=$(cat)
    if ! echo "$INPUT_JSON" | jq empty 2>/dev/null; then
        echo "Error: Invalid JSON from stdin" >&2
        exit 1
    fi
    # Merge stdin JSON into existing file
    jq -s '.[0] * .[1]' "$CRED_FILE" <(echo "$INPUT_JSON") > "$CRED_FILE.tmp"
    mv "$CRED_FILE.tmp" "$CRED_FILE"
    chmod 600 "$CRED_FILE"
    echo "✓ Merged credentials into $CRED_FILE"
else
    # Single key-value upsert
    if [ $# -lt 2 ]; then
        usage
    fi
    KEY="$1"
    VALUE="$2"
    
    # Update the JSON file
    jq --arg k "$KEY" --arg v "$VALUE" '.[$k] = $v' "$CRED_FILE" > "$CRED_FILE.tmp"
    mv "$CRED_FILE.tmp" "$CRED_FILE"
    chmod 600 "$CRED_FILE"
    echo "✓ Set $NAME.$KEY in $CRED_FILE"
fi
