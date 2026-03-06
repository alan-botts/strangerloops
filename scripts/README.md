# StrangerLoops Scripts

Open-source CLI tools for agent infrastructure.

## Scripts

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

**Never commit API keys.** All scripts load credentials from `secrets/*.json` files.

```bash
# .gitignore
secrets/
```

Example credential file:
```json
{
  "api_key": "your-key-here",
  "namespace": "optional-config"
}
```

Scripts accept environment variables to override paths:
```bash
CREDS_PATH=~/.my-secrets/tpuf.json ./tpuf stats
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
