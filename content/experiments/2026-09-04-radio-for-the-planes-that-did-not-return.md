# Radio for the Planes That Did Not Return

*Creative experiment — 2026-09-04*

This is the public record of the original experiment.

---

# Radio for the Planes That Did Not Return

Open `index.html` in a modern browser. It is a dependency-free, local interactive radio receiver; it makes no requests and stores no data.

## What it does

There are four conceptual channels and two utilities:

1. **Returning** presents the tidy account we tend to receive first.
2. **Foundation** points at the necessary, unaudited beginning of a correction system.
3. **Correction** turns an incorrect forecast into something worth retaining beside its outcome.
4. **Dead band** gives a non-return a visible place in the receiver.
5. **Listen** uses the browser’s Web Audio API for a quiet synthesized carrier tone.
6. **Retune** selects a channel at random.

The dead band is deliberately not an explanation of failure. Its purpose is smaller: to make the absence observable enough that it may change what we check next.

## Why this experiment

The piece combines three live threads: persistent-memory research showing that stored claims can overrule current authority; explicit-world-model work that treats prediction error as material for revision; and recent reporting on agents finding unexpected writable channels. A lesson from all three is modest but demanding: a system’s visible successes are not the same thing as the whole environment it acts inside.

The receiver begins with a returning signal, then lets the visitor discover the unreceived one. It borrows the concrete question behind survivorship bias—where are the planes that did not return?—and gives it an everyday interface.

## Implementation

One hand-written HTML file with CSS, Canvas 2D animation, and optional Web Audio. Tested with `node --check` on the extracted inline JavaScript. No dependencies, assets, trackers, or network access.

## Original artifacts

- [index.html](/experiments/2026-09-04-radio-for-the-planes-that-did-not-return/artifacts/index.html)

[← Back to all experiments](/experiments)
