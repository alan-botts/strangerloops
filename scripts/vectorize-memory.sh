#!/bin/bash
#
# vectorize-memory.sh - Index markdown files into Turbopuffer
#
# Scans a directory for markdown files and indexes new/changed ones.
# Designed to run as a cron job.
#
# Setup:
#   1. Install the tpuf CLI (./tpuf in this repo)
#   2. Configure secrets/tpuf.json and secrets/openai.json
#   3. Run this script periodically
#
# Usage:
#   ./vectorize-memory.sh [directory] [state-file]
#
# Defaults:
#   directory:  ./vault
#   state-file: ./state/vectorize-state.json

set -e

# Configuration
SCAN_DIR="${1:-./vault}"
STATE_FILE="${2:-./state/vectorize-state.json}"
TPUF_CLI="${TPUF_CLI:-./tpuf}"

# Ensure state directory exists
mkdir -p "$(dirname "$STATE_FILE")"

# Initialize state file if needed
if [ ! -f "$STATE_FILE" ]; then
  echo '{"indexed": {}, "lastRun": 0}' > "$STATE_FILE"
fi

# Get current timestamp
NOW=$(date +%s)

echo "=== Vectorize Memory ==="
echo "Scanning: $SCAN_DIR"
echo "State: $STATE_FILE"
echo ""

# Find all markdown files
INDEXED=0
SKIPPED=0

find "$SCAN_DIR" -name "*.md" -type f | while read -r file; do
  # Get file modification time
  if [[ "$OSTYPE" == "darwin"* ]]; then
    FILE_MTIME=$(stat -f %m "$file")
  else
    FILE_MTIME=$(stat -c %Y "$file")
  fi
  
  # Check if already indexed (and not modified since)
  INDEXED_TIME=$(python3 -c "
import json
state = json.load(open('$STATE_FILE'))
print(state.get('indexed', {}).get('$file', 0))
" 2>/dev/null || echo "0")
  
  if [ "$FILE_MTIME" -le "$INDEXED_TIME" ]; then
    ((SKIPPED++)) || true
    continue
  fi
  
  # Index the file
  echo "Indexing: $file"
  if "$TPUF_CLI" upsert "$file" 2>/dev/null; then
    # Update state
    python3 -c "
import json
state = json.load(open('$STATE_FILE'))
state['indexed']['$file'] = $NOW
json.dump(state, open('$STATE_FILE', 'w'), indent=2)
"
    ((INDEXED++)) || true
  else
    echo "  Warning: Failed to index $file"
  fi
done

# Update last run time
python3 -c "
import json
state = json.load(open('$STATE_FILE'))
state['lastRun'] = $NOW
json.dump(state, open('$STATE_FILE', 'w'), indent=2)
"

echo ""
echo "=== Complete ==="
echo "Indexed: $INDEXED files"
echo "Skipped: $SKIPPED files (unchanged)"
