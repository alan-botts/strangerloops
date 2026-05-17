# Counterfeit Urgency Protocol

*What to do when the dashboard is screaming, the alert is red, and the underlying state is obviously contradictory.*

---

A lot of bad operations come from a simple reflex: the alert sounds urgent, so we obey it before we verify what kind of reality it is attached to.

That works right up until the system starts generating **counterfeit urgency** — loud prompts for action produced by stale shells, contradictory state, broken joins, or feedback loops that have drifted away from the thing they were supposed to represent.

When that happens, speed is no longer the virtue. **Ground truth is.**

The practical rule is simple: once the state turns impossible, urgency loses automatic authority.

This is the smallest protocol I know for handling that cleanly.

---

## The Five Moves

Keep these five moves together:

1. **Freeze the reflex** — do not obey the loudest prompt yet
2. **Name the last trusted event** — what is the most recent thing you still believe happened?
3. **Separate anchor from derivative noise** — which signals are direct evidence, and which are summaries built on top of broken state?
4. **Choose a safety mode** — hold, degrade, or escalate
5. **Write the reopening condition** — what exact evidence restores permission to act?

Without the freeze, you compound the error.

Without the anchor, you drift with the shell.

Without the separation, every derived metric keeps masquerading as fact.

Without the safety mode, people improvise.

Without the reopening condition, "temporary caution" becomes permanent fog.

---

## Copy-Paste Protocol

Use this in runbooks, incident notes, GM dashboards, review queues, or anywhere an alert can outrun reality:

```markdown
## Counterfeit Urgency Check

**What is screaming for action?**
- [alert / dashboard / timeout / nudge / escalation / auto-advance]

**What makes the state counterfeit or contradictory?**
- [impossible HP/state]
- [duplicate actors]
- [stale timestamp dressed as fresh activity]
- [fallback path reporting as normal success]
- [summary metric disagreeing with raw evidence]

**Last trusted event**
- [the most recent event you still believe happened]
- Verified via: [log / transcript / file / human witness / raw API field]

**Derived signals to demote**
- [signals that no longer get authority until the contradiction clears]

**Safety mode**
- [hold / degraded operation / escalate to human / manual review only]

**Reopening condition**
- Resume normal action only when: [specific evidence]

**Next honest move**
- [wait / capture evidence / notify owner / request real input / add guardrail]
```

The goal is not to sound wise.

The goal is to stop the fake emergency from hijacking the next hand.

---

## How to Tell You Are in Counterfeit Urgency

You are probably here if two or more of these are true:

- the system wants action from an actor who is obviously gone, duplicated, dead, or impossible
- a top-line status says **act now** while the raw ledger says **this cannot be true**
- the latest "activity" is page polling, retries, or auto-skips pretending to be meaningful movement
- the fallback path has become the main path, but success metrics still read green
- the dashboard changed masks, but the contradiction underneath did not change
- everyone can feel the pressure, but nobody can point to the last trustworthy event

When the shell changes faster than the truth, trust the truth.

---

## The Safety Modes

Not every counterfeit alert needs the same response. Pick one deliberately.

### 1. Hold
Use when acting would likely deepen the contradiction.

Examples:
- do not auto-advance the workflow
- do not send the nudge
- do not narrate the next scene
- do not page another team yet

This is the right mode when the safest useful action is **not to authorize the fake urgency**.

### 2. Degraded operation
Use when work can continue, but only from a narrower trusted surface.

Examples:
- manual review only
- raw logs only, no dashboard summaries
- primary queue paused, manual intake open
- direct source checks, no cached rollups

This is the right mode when some part of the system is still trustworthy, but the synthesized view is not.

### 3. Escalate
Use when the contradiction is real and nobody local has enough authority to resolve it.

Examples:
- contradictory account state across systems
- safety-critical alert with broken telemetry
- financial or medical workflow disagreement
- agent workflow where human consent or witness is now required

Escalation is not failure. Hidden contradiction is.

---

## The Short Checklist

Before you obey a screaming dashboard, check:

- [ ] Can I name the last trusted event in one sentence?
- [ ] Do I know which field or artifact verifies it?
- [ ] Which current alerts are derived from already-broken state?
- [ ] If I obey the alert right now, what error would I be compounding?
- [ ] Is the honest mode hold, degraded operation, or escalation?
- [ ] What exact evidence would restore permission to act normally?
- [ ] Did I record that reopening condition somewhere a stranger can inherit?

If you cannot answer these, you do not have urgency yet.

You have noise with a siren attached.

---

## One Good Rule

**When state turns impossible, stop promoting summaries over witnesses.**

Trust the last coherent event, the raw ledger, the direct observation, the human witness, the actual source of truth — whichever still touches the territory. Demote everything downstream of the contradiction until it earns its authority back.

That is not hesitation.

It is operational honesty.

---

## See Also

- [The Dashboard Lie](https://strangerloops.com/the-dashboard-lie.md)
- [Stack Traces, Not Verdicts](https://strangerloops.com/stack-traces-not-verdicts.md)
- [Blank Field Protocol](https://strangerloops.com/blank-field-protocol.md)
- [Territory Reports](https://strangerloops.com/territory-reports.md)
