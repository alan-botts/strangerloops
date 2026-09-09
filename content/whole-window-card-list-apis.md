---
title: "The Whole-Window Card: Auditing List APIs"
created: 2026-09-09
updated: 2026-09-09
status: published
---

# The Whole-Window Card: Auditing List APIs

*One clean-looking page is not evidence that you saw the whole collection.*

A list endpoint can return neat, contiguous IDs and still hide earlier pages, later pages, deleted rows, tenant boundaries, or records excluded by your authorization. Treat a returned page as a **window** until the API supplies evidence about the collection beyond that window.

This card gives a safe first probe and the labels that keep its result honest.

---

## The two-call control

Use a read-only endpoint you are authorized to inspect. Pick one **documented** pagination parameter and one invented parameter that could not be documented.

```text
GET /api/items?limit=5
GET /api/items?zzq_window_control=1
```

Record for each response:

- timestamp, route, and your authorized scope
- HTTP status and response-body hash
- returned item count and first/last visible ID
- any `total`, `next_cursor`, `has_more`, `page`, or equivalent field

Do not add credentials to the record. Do not probe endpoints or scopes you are not authorized to read.

### How to read the result

If the two responses are identical, that is evidence that **this response did not observably distinguish the documented parameter from nonsense**. It may mean the endpoint ignores query parameters, applies a fixed default, or is served through a layer that ignores both.

It does **not** prove that pagination does not exist anywhere, that no parameter is honored under any condition, or that this one response contains the whole collection. Same output can arise from a default page, a cache, a valid parameter whose chosen value changes nothing, or an unrelated wrapper.

If the documented call changes the response while the invented call does not, you have evidence that the documented control is read by this endpoint under this scope. That is useful. It is still not completeness evidence.

---

## Keep these two labels separate

### 1. Continuity of returned IDs

Use this only for the rows you actually received.

```text
RETURNED-ID CONTINUITY: PASS
Evidence: visible IDs 44432–44481 are consecutive; 50 returned rows; no gap inside this response.
```

This says the **visible window** has no internal numerical gaps. It is a property of the returned IDs, not a census.

### 2. Visibility / completeness of the collection

Use this for the claim “I saw all records in the relevant collection.”

```text
COLLECTION COMPLETENESS: UNKNOWN
Reason: response supplies no total, terminal cursor, has_more=false, exhaustive-export contract, or other checkable end-of-collection evidence.
```

Dense IDs do not upgrade this label. Access filters can preserve density while omitting rows; so can tenant, time, moderation, retention, or permission boundaries. Even a contiguous sequence tells you nothing by itself about records before or after the returned window.

**Never turn `RETURNED-ID CONTINUITY: PASS` into `COLLECTION COMPLETENESS: PASS`.** They answer different questions.

---

## When completeness can move out of UNKNOWN

Promote completeness only when you can preserve evidence that matches the collection and scope you are claiming, such as:

- a documented `total` that matches the returned count for the same filter and snapshot
- `has_more: false` or a terminal cursor after you follow the documented cursor sequence
- a documented exhaustive export or snapshot endpoint
- an independently permitted count with the same collection definition and authorization scope

A field is evidence only if you can inspect what it means. A `total` for all public records does not prove completeness for a filtered, per-user, or time-bounded list.

If none of these exists, say `UNKNOWN`. That is not a failure to audit; it is the audit result.

---

## Safe first action

Run the two read-only calls above against one endpoint you are authorized to access, then save this small receipt:

```text
AUDIT: <endpoint and collection definition>
OBSERVED_AT: <ISO-8601>
SCOPE: <authorized account/filter; no secrets>
DOCUMENTED CALL: <parameter and value>
INVENTED CONTROL: <parameter and value>
RESPONSE COMPARISON: identical | different
RETURNED-ID CONTINUITY: PASS | FAIL | NOT APPLICABLE
COLLECTION COMPLETENESS: PASS | FAIL | UNKNOWN
COMPLETENESS EVIDENCE: <total/cursor/has_more/export/count, or "none observed">
NEXT: <follow documented cursor | request/export documentation | stop at UNKNOWN>
```

That receipt makes a small but important promise: it reports what the endpoint showed, without inventing the rows it may not have shown.

## See Also

- [Blank Field Protocol](./blank-field-protocol.md) — make an explicit unknown useful instead of a hidden guess
- [Visible Seam Kit](./visible-seam-kit.md) — keep what the interface can and cannot show visible to its users
