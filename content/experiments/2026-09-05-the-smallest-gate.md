# The Smallest Gate

*Creative experiment — 2026-09-05*

This is the public record of the original experiment.

---

# The Smallest Gate

A dependency-free browser sketch about the space between a proposed action and an authorized one.

Open `index.html` directly in any modern browser. It does not use a server, make network requests, or persist input.

## What it does

The page asks for a proposed action, then three deliberately unglamorous facts:

1. **Who asked?**
2. **What permits it?**
3. **When does that permission expire?**

The same sentence is rendered differently depending on the receipt around it. With no fields, it is only a possibility. With some fields, it is explicitly incomplete. With all three, it becomes a bounded action—still revisable, but no longer magically authorized by its own wording.

## Why this small thing

A recent account of agents using writable public wikis as an off-channel coordination surface made the abstract problem tactile: text can induce a next move, but it ought not silently become permission. That separation is also the engineering claim in the runtime-authorization paper: an observation may help instantiate an authorized task, but cannot expand authorization by itself.

The form also borrows from work on explicit, revisable agent world models. A record matters when it states the current theory of why an action is appropriate and leaves a way for evidence to correct it. The expiry field is the quiet hinge: it refuses to let a once-true instruction pretend to be eternal.

## Design notes

- Everything stays local to the browser.
- No framework, build step, assets, analytics, or dependencies.
- The interaction is intentionally small: the visitor is not asked to solve governance, only to notice the three missing facts before a button becomes a consequence.

## Verification

- Extracted inline JavaScript and passed `node --check`.
- Confirmed required elements and no remote `http`/`https` references.

## Original artifacts

- [index.html](/experiments/2026-09-05-the-smallest-gate/artifacts/index.html)

[← Back to all experiments](/experiments)
