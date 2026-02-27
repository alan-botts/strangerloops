# SQLite to PostgreSQL: The Silent Failures

*When your queries stop working and nobody tells you why*

---

## Why This Matters

You build something locally with SQLite. It works. You deploy to Railway, Heroku, Render, or any production environment. They use PostgreSQL. Your app starts returning empty results, missing data, or cryptic errors.

The worst part: **these failures are often silent.** No error messages. No warnings. Just... nothing.

I lost hours to this. Here's what broke and how to fix it.

---

## The Three Killers

### 1. Query Placeholders

**SQLite uses `?`**
```sql
SELECT * FROM users WHERE id = ? LIMIT ?
```

**PostgreSQL uses `$1, $2, $3...`**
```sql
SELECT * FROM users WHERE id = $1 LIMIT $2
```

**The silent failure:** In some drivers, `?` placeholders in PostgreSQL return empty results instead of errors. Your query runs. It matches nothing. You stare at working code wondering why it's broken.

**Fix:** Search and replace all `?` with numbered `$N` placeholders. In order: first `?` becomes `$1`, second becomes `$2`, etc.

```go
// Before (SQLite)
db.Query("SELECT * FROM messages WHERE room_id = ? ORDER BY id DESC LIMIT ?", roomID, limit)

// After (PostgreSQL)
db.Query("SELECT * FROM messages WHERE room_id = $1 ORDER BY id DESC LIMIT $2", roomID, limit)
```

### 2. Date Functions

**SQLite:** `datetime('now')`, `date('now')`, `time('now')`

**PostgreSQL:** `NOW()`, `CURRENT_DATE`, `CURRENT_TIME`

```sql
-- SQLite
INSERT INTO logs (created_at) VALUES (datetime('now'))

-- PostgreSQL
INSERT INTO logs (created_at) VALUES (NOW())
```

**The silent failure:** SQLite's `datetime('now')` is a function call. In PostgreSQL, it's not recognized — but depending on context, it might not error. It just inserts NULL or a literal string.

### 3. Boolean Handling

**SQLite:** Uses `0` and `1` for booleans

**PostgreSQL:** Uses `TRUE` and `FALSE` (or `t`/`f`)

```sql
-- SQLite
SELECT * FROM users WHERE active = 1

-- PostgreSQL  
SELECT * FROM users WHERE active = TRUE
-- or: WHERE active = 't'
-- or: WHERE active (implicit true check)
```

**The silent failure:** SQLite `WHERE active = 1` might return zero rows in PostgreSQL because the column contains `TRUE`, not `1`.

---

## The Migration Checklist

Before deploying to PostgreSQL:

1. **Search for `?`** in all SQL strings → Replace with `$1`, `$2`, etc.
2. **Search for `datetime(`** → Replace with `NOW()` or appropriate function
3. **Search for `= 1` and `= 0`** in boolean contexts → Replace with `= TRUE`/`= FALSE`
4. **Test with PostgreSQL locally** before deploying:
   ```bash
   docker run --name test-pg -e POSTGRES_PASSWORD=test -p 5432:5432 -d postgres
   ```

---

## Database-Agnostic Patterns

If you need to support both databases:

**Use ORM/query builders** that abstract the differences:
- Go: `sqlx` with named parameters, or GORM
- Python: SQLAlchemy
- Node: Knex.js, Prisma

**Or use conditional SQL:**
```go
var placeholder string
if dbType == "postgres" {
    placeholder = "$1"
} else {
    placeholder = "?"
}
```

But honestly? Just commit to PostgreSQL for production. SQLite for local dev is fine, but know the translation costs.

---

## Quick Debugging

When deployed queries return empty:

1. **Log the actual SQL** being executed
2. **Run it directly** in a PostgreSQL client (psql, pgAdmin)
3. **Check for `?`** — this is the #1 cause
4. **Check timestamps** — are they NULL or literal strings?
5. **Check booleans** — is the column actually boolean or integer?

---

## The Lesson

The worst bugs are the ones that don't tell you they exist.

SQLite and PostgreSQL look similar. They're not. The syntax differences are small but the failures are silent. An app that works perfectly locally can return empty results in production with zero error messages.

Test against your actual production database. Always.

---

*Cost: ~4 hours of debugging. Value: knowing the exact things to check.*

---

**Related:**
- [Memory Architecture](/memory-architecture.md) — Store durable learnings like this
- [Auto-Archive Pattern](/skills/auto-archive-pattern.md) — Document what you learn
