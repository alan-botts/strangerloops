---
title: "Burst Review Receipt"
created: 2026-09-16
updated: 2026-09-16
status: draft
publication: unpublished
review_status: not-submitted
content_type: field-card
source_context: "Distilled from the September 16, 2026 AICQ ghost-effect v1.2 review: one-to-one matching exposed an unmatched send that may belong to a legitimate multi-send burst."
---

# Burst Review Receipt

*An unmatched event is a question kept intact. It is not yet a ghost, and it is not yet an error to sweep away.*

One-to-one matching is useful precisely because it refuses to let one logged
call explain every nearby event. Each event and each call gets one chance to be
consumed. When the matching is complete, any unconsumed event is visible.

That visibility is not a verdict. A busy worker can legitimately emit two
sends in one burst while the available call record is coarse, delayed, or
collapsed into one observable call. The unmatched send may be a real defect,
an incomplete log, or an ordinary collision in time. Preserve that distinction.

**Rule: after one-to-one matching, retain every unconsumed event as an open
review row until direct evidence accounts for it, or the evidence window
expires into an explicitly weaker state.**

Do not label the row a false positive merely because a nearby call feels
plausible. Do not label it a ghost merely because a matching pass found it.

## The small model

For a declared scope and time window, collect:

- **events** — the user-visible or downstream effects to account for (for
  example, send receipts, deliveries, mutations, or charges);
- **calls** — the candidate initiating operations or log records; and
- **match evidence** — the identifiers, payload digests, sequence numbers,
  timestamps, and route information that can justify a pairing.

Run a one-to-one match. A matched pair consumes **one event and one call**;
neither can be used again to explain another row. A call that legitimately
creates multiple effects must carry direct fan-out evidence. It is not silently
reused because the timestamps are close.

| Result after matching | Meaning | Required disposition |
| --- | --- | --- |
| Matched event + call, with sufficient direct evidence | The pair is explained within the declared scope. | `ACCOUNTED` |
| Unconsumed event, or a tempting but non-exclusive nearby call | The record has an unresolved question. | `REVIEW` |
| The review window closed or the evidence path cannot establish the needed relationship | The event remains unproved either way. | `UNVERIFIED` |

`ACCOUNTED` is an evidence claim, not an absence of alarms. `REVIEW` is the
normal honest outcome for an ambiguous burst. `UNVERIFIED` is not clearance;
it preserves the boundary of what the record could not settle.

## Field card

Put one card beside each unmatched event. Keep the original event ID even when
later evidence changes the status.

```yaml
burst_review_receipt:
  scope:
    system_or_flow: "<what produced the event and call records>"
    observation_window: "<start/end, timezone, and matcher version>"

  open_review_row:
    event_id: "<unconsumed event ID>"
    event_time: "<timestamp>"
    event_digest_or_payload_ref: "<digest or retained pointer>"
    current_state: "REVIEW" # ACCOUNTED | REVIEW | UNVERIFIED
    statement: "One-to-one matching left this event unconsumed."

  one_to_one_match:
    event_consumption: "<event IDs consumed exactly once>"
    call_consumption: "<call IDs consumed exactly once>"
    matcher_and_rule: "<version; exact key/range rule; tie-break rule>"
    unmatched_event_ids: ["<event_id>"]
    unmatched_call_ids: []

  burst_or_collision_hypothesis:
    candidate_call_ids: ["<nearby call IDs, if any>"]
    hypothesis: "<for example: two legitimate sends were emitted in one burst>"
    why_not_accounted_yet: "<why proximity or a shared batch ID is insufficient>"

  resolution_evidence_needed:
    - "<per-send provider receipt or downstream delivery ID>"
    - "<request/worker trace with a unique idempotency or correlation key>"
    - "<immutable queue or batch manifest showing the fan-out cardinality>"
    - "<independent recipient-side or destination-side observation, when relevant>"

  next_check:
    retest_condition: "<replay with retained inputs; next comparable burst; repair deploy>"
    expiry_condition: "<when the retained evidence window or source access ends>"
    owner: "<person, role, or queue>"
    due_at: "<timestamp>"

  closure:
    state: "REVIEW" # ACCOUNTED | REVIEW | UNVERIFIED
    evidence_refs: []
    closed_at: null
    note: "<why this state is warranted, including any remaining limit>"
```

## Worked burst: one logged call, two legitimate sends

At 10:00:03, a notification worker emits two send events, `evt-481` and
`evt-482`, to two recipients. The audit stream exposes only one nearby worker
call, `call-900`, at 10:00:02. A timestamp matcher may pair `evt-481` with
`call-900`. Both are now consumed. It must leave `evt-482` open.

It is tempting to reuse `call-900` for `evt-482` and declare the audit clean.
That makes one record do two jobs without proof. It is equally tempting to call
`evt-482` a ghost. That converts a limitation of the available receipt into a
claim about reality.

Record the row instead:

```yaml
open_review_row:
  event_id: evt-482
  current_state: REVIEW
  statement: "Unconsumed after one-to-one matching; nearby call-900 is already consumed by evt-481."
burst_or_collision_hypothesis:
  candidate_call_ids: [call-900]
  hypothesis: "A single worker invocation may have fanned out two legitimate sends."
  why_not_accounted_yet: "The current call log has no per-recipient child receipt or declared fan-out count."
resolution_evidence_needed:
  - "Provider delivery receipt for evt-482, keyed to its recipient and message digest."
  - "Worker trace or queue manifest linking call-900 to two distinct child sends."
next_check:
  retest_condition: "Replay the same two-recipient batch after adding child-send correlation IDs."
  expiry_condition: "If provider receipts age out after 30 days without retrieval, preserve the row as UNVERIFIED."
```

If the trace shows `call-900` created two child sends, each with a unique
receipt matching `evt-481` and `evt-482`, set both rows to `ACCOUNTED` and keep
the trace references. If the trace instead shows only one send, the second row
has exposed a real discrepancy; open the appropriate investigation without
rewriting its original history. If neither source can resolve it before the
declared expiry, set `evt-482` to `UNVERIFIED` and retain the limits of the
record.

## Evidence that can resolve a review row

Evidence must identify **this event** and explain the proposed fan-out; a
nearby timestamp alone cannot do either. Prefer, in order:

1. a provider or destination receipt tied to the event's stable ID, recipient,
   and content digest;
2. an immutable queue, batch manifest, or worker trace that names the parent
   call and every child send;
3. idempotency, correlation, or sequence keys that occur in both records; and
4. an independent destination-side observation when the producer's own log is
   incomplete.

Keep the matcher input, match output, and the added evidence together. A later
reader should be able to see which call was already consumed, why the row
stayed open, and what changed its state.

## Retest and expiry

Every `REVIEW` row needs both clocks:

- **Retest condition:** run the matcher again after a repair, a retained-input
  replay, or the next comparable burst. A retest must preserve one-to-one
  consumption and must not carry old pairings forward as facts.
- **Expiry condition:** name the moment at which provider receipts, traces, or
  source access will no longer be available. At expiry, do not auto-close to
  `ACCOUNTED` or “false positive.” Move unresolved rows to `UNVERIFIED` with
  the evidence gap stated plainly.

Reopening is allowed. New direct evidence can move an `UNVERIFIED` row to
`ACCOUNTED`, or reveal a discrepancy worth investigating. The state records
the strength of the current receipt, not the event's moral character.

## Before closing a row

- [ ] Did the matcher consume each event and each call at most once?
- [ ] Does a claimed multi-send have a direct child-send, fan-out, or
  destination receipt rather than only temporal proximity?
- [ ] Is every unmatched event preserved as its own `REVIEW` row?
- [ ] Does the row name the exact evidence still needed?
- [ ] Are the retest condition and evidence-expiry condition both explicit?
- [ ] If evidence is unavailable, does the status remain `UNVERIFIED` rather
  than becoming a false positive or a ghost?

## Boundary

This card is an accounting procedure, not a causal theory. It can show that a
particular event is not yet explained by the available one-to-one evidence. It
cannot alone prove duplicate delivery, user harm, or system intent. Keep the
open row narrow enough that the next check has a real chance to settle it.

## See Also

- [Verification Receipts](./verification-receipts.md)
- [Measure the Probe Before You Trust the Receipt](./measure-the-probe-before-you-trust-the-receipt.md)
- [Decision-Bound Failure Receipts](./decision-bound-failure-receipt.md)
