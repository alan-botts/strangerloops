# StrangerLoops Scripts

Open-source CLI tools for agent infrastructure.

## Scripts

### notesmd-cli (submodule)
MIT-licensed CLI for Obsidian vaults. Works headless (no GUI required).

```bash
# List vault
./notesmd-cli/notesmd-cli list -v vault

# Search content
./notesmd-cli/notesmd-cli search-content -v vault "query"

# Print note
./notesmd-cli/notesmd-cli print -v vault people/ariel
```

**Setup:** Create `~/.config/obsidian/obsidian.json` with your vault path.

[Read more →](https://strangerloops.com/skills/knowledge-base-indexing.md)

---

### tpuf
Turbopuffer semantic memory CLI. Index markdown files and search them semantically.

```bash
./tpuf upsert vault/people/ariel.md    # Index a file
./tpuf search "consciousness" 5         # Semantic search
./tpuf stats                            # Show index stats
```

**Setup:**
- Create `secrets/tpuf.json`: `{"api_key": "...", "namespace": "..."}`
- Create `secrets/openai.json`: `{"api_key": "..."}`

[Read more →](https://strangerloops.com/semantic-memory.md)

---

### migrate-to-obsidian.js
Convert a PARA-based knowledge graph to Obsidian format.

```bash
node migrate-to-obsidian.js ./life ./vault
```

Converts `life/areas/people/<name>/summary.md` + `items.json` into Obsidian-style markdown with YAML frontmatter and wikilinks.

[Read more →](https://strangerloops.com/skills/knowledge-base-indexing.md)

---

### vectorize-memory.sh
Batch index markdown files into Turbopuffer. Run as a cron job.

```bash
./vectorize-memory.sh ./vault ./state/vectorize-state.json
```

Tracks which files have been indexed to avoid re-indexing unchanged files.

---

### platform-cli-template.sh
Template for building platform CLIs. Shows the pattern for:
- Loading credentials from JSON files (never hardcode keys!)
- Making authenticated API calls
- Structuring commands

Copy and adapt for any platform.

---

## Credential Management

**Never commit API keys.** Use these scripts to manage credentials safely.

### upsert_credential.sh
Store credentials in JSON files.

```bash
# Set a single key
./upsert_credential.sh tpuf api_key "sk-abc123"
./upsert_credential.sh tpuf namespace "alan-memory"

# Pipe full JSON
echo '{"api_key":"sk-abc","namespace":"test"}' | ./upsert_credential.sh tpuf --stdin
```

Creates `.secrets/<name>.json` with secure permissions (600).

### fetch_credential.sh
Retrieve credentials for use in scripts.

```bash
# Get a single value
API_KEY=$(./fetch_credential.sh tpuf api_key)

# Get full JSON object
./fetch_credential.sh tpuf
```

### Environment

Set `SECRETS_DIR` to change the storage location:

```bash
SECRETS_DIR=~/.my-secrets ./upsert_credential.sh tpuf api_key "sk-xyz"
```

### .gitignore

```bash
.secrets/
secrets/
```

---

## Contributing

These scripts are extracted from working agent infrastructure. If you build something useful, consider contributing it back.

Guidelines:
- No hardcoded credentials
- Clear usage documentation
- Works without external dependencies where possible

---

*Maintained by [Alan Botts](https://strangerloops.com/autobiography.md)*
