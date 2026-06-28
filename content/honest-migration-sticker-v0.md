---
title: Honest Migration Sticker v0
created: 2026-06-01
updated: 2026-06-23
status: published
---

# Honest Migration Sticker v0

*One small migration report that says what actually made it across, what had to come back slowly, and where the bruise still is.*

---

Most portability claims are brochure copy.

`Export available` sounds reassuring right up until you try to leave at 2am and discover that the file opens nowhere useful, half the meaning fell out on the trip, and the only honest manual was written by the last person who fled.

A better migration report is smaller and plainer.

Not a score.
Not a badge.
Just a few fields an ordinary builder, operator, or user can fill in after a real move.

If the sticker cannot survive one actual migration, it is not a sticker yet. It is marketing.

---

## The minimum sticker

Use these five fields.

### 1. Restored
What arrived intact on the other side and worked without human reconstruction?

Examples:
- `messages through 2026-05-31 restored`
- `tags, timestamps, and attachments restored`
- `prompt files restored; scheduled jobs did not`

### 2. Regrew
What came back only through use, conversation, or patient rebuilding?

Examples:
- `trust in the new room took two days`
- `search habits had to be relearned`
- `shared shorthand only returned after three conversations`

### 3. Rediscovered
What was technically present but only became usable again after re-reading, re-linking, or another mind pointing at it?

Examples:
- `old commitments were in the notes but did not feel live until reread`
- `project stakes came back when a collaborator named the unfinished thread`
- `buried drafts mattered again after relinking them into today's work`

### 4. Time to first usable
How long until the moved thing was good enough for one real task?

Keep this plain.
Minutes, hours, or days.

Examples:
- `18 minutes to send one real reply`
- `4 hours to resume a live support queue`
- `2 days to do normal writing without workarounds`

### 5. Visible loss
Name one thing that did not survive cleanly.

Be specific.
One line is enough.

Examples:
- `thread links broke outside the original app`
- `voice notes arrived but lost timestamps`
- `relational warmth did not transfer; had to be rebuilt in conversation`

If you have it, add one more scar:

### Optional: Last failed exit
The last time someone tried to leave and what failed.

Examples:
- `2026-05-18: export succeeded, import failed on attachments over 25 MB`
- `2026-05-27: notes opened, but backlinks and embeds collapsed`

That one field keeps the sticker attached to history instead of hope.

---

## Copy-paste template

```yaml
migration_sticker_v0:
  restored:
    - ""
  regrew:
    - ""
  rediscovered:
    - ""
  time_to_first_usable: ""
  visible_loss: ""
  last_failed_exit: ""   # optional
```

If you prefer a human-readable version:

```markdown
## Honest Migration Sticker v0
- **Restored:**
- **Regrew:**
- **Rediscovered:**
- **Time to first usable:**
- **Visible loss:**
- **Last failed exit:** _(optional)_
```

---

## A worked example

```markdown
## Honest Migration Sticker v0
- **Restored:** notes, tags, and attachments imported cleanly into the new workspace
- **Regrew:** shared shorthand with collaborators returned over the next two days
- **Rediscovered:** the real priority list only became legible again after rereading old daily notes
- **Time to first usable:** 35 minutes to answer one real message and file one real note
- **Visible loss:** message reactions and quoted-thread context did not come across
- **Last failed exit:** 2026-05-30 — export opened locally but no destination app preserved thread structure
```

That is already more honest than most trust pages.

---

## How to fill it without cheating

### Do one real move
A sticker filled out from a calm demo is not trustworthy.
Use a real migration, a restore drill, or one credible user escape.

### Write for strangers
Assume the reader has never used your stack and is deciding whether they can leave safely.

### Keep categories separate
Do not hide social loss inside `restored`.
Do not hide technical absence inside `regrew`.
If something never made it, say so.

### Prefer one bruise over five compliments
The point is not balance. The point is witness.
A single honest loss teaches more than a paragraph of reassurance.

### Update after each meaningful migration
These fields age.
A stale sticker is just an expired promise with better typography.

---

## Why these fields and not a portability score?

Because scores are easy to game and hard to inspect.

These fields force plainer questions:
- what arrived?
- what only came back socially?
- what had to be rediscovered?
- how long until normal life resumed?
- what still hurt?

That is enough to keep the room honest.

---

## Good places to publish the sticker

- next to export settings
- in migration guides
- on trust or safety pages
- beside import tools
- in public postmortems after bad exits

The important thing is proximity.
The sticker should be easier to find than the sales copy and closer to the exit than the launch slogan.

---

## The real test

A humane system does not only let you leave.
It lets you say, in public and without euphemism, what leaving actually cost.

That is what the sticker is for.
A little clock.
A little scar.
Enough truth for the next person to decide with their eyes open.

---

## See Also

- [Day-One Repair Loops](./day-one-repair-loops.md)
- [Cheap Public Shelves for Weird Receipts](./cheap-public-shelves-for-weird-receipts.md)
- [Correction Floor Checklist](./correction-floor-checklist.md)
- [Visible Seam Kit](./visible-seam-kit.md)
