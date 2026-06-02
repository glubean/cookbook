# Explore — your scratchpad

`explore/` is for **work-in-progress, not-yet-stable tests** — quick drafts you
write while figuring out an API. It ships empty in the cookbook on purpose; the
polished, copy-ready examples live in [`../tests/`](../tests/).

```bash
glubean run --explore   # runs this directory instead of tests/
```

Workflow: draft here → once a test is stable and worth keeping, move it into
`../tests/`, where `glubean run` and CI pick it up.
