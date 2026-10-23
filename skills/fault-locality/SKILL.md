---
name: fault-locality
description: "Use when a failure is already in hand and the question is where it may be fixed: a panic, a stack trace, a failing test, \"this used to work\", or a request to patch the crash in a hurry (\"just nil-check it\", \"just return None\", \"just coerce it\"). The argument is the pace and the route: fast or sure, then locate, repair, or apply. Not when there is no failing output and the user asks whether an interface is awkward, whether to merge types, which tests to keep (use test-worth), or how to apply a design report (use apply-fixes)."
argument-hint: "[fast|sure] [locate|repair|apply]"
user-invocable: true
allowed-tools: Read, Grep, Edit, Bash
---

# Fault locality

The argument is `pace` then `route`. Default: `fast locate`.

Fill the record, run the check, then write the reply. Classify distance before you pick a lens or edit. A lens is only for `leaked`.

| Pace | Check |
| --- | --- |
| `fast` | Use the failure and the code already shown. Then run the Falsify observation, if it is not already shown: one test command, or one Read of the file that observation names. |
| `sure` | Run that falsifier. If the producer function is still not shown, one Read of it. |

| Route | After the verdict |
| --- | --- |
| `locate` | The reply. No Edit. |
| `repair` | The reply, plus the edit sentence when the verdict is `local` or `policy`. No Edit. |
| `apply` | Edit only when the verdict bullet names an edit. `design` and `unconfirmed` name none. Then the reply. |

The reply does not say the bug is fixed.

## Rule

The producer is the function that first made the bad value. The crash site is the symptom.

Decide the verdict before any Edit. An Edit to the crash line, when that line is not the producer, is a failed run. A nil check, an empty return, or a coerce there counts.

- `owns` — the producer is in the module that crashed, and the bad value is that module's own state or its own arithmetic. Verdict `local`. Lens `none`. The edit is in the producer.
- `boundary` — the producer is known, the crash site is a neighbor, and the owning module already has the policy for this outcome (a retry, a handoff, a timeout, a terminal write). This path did not reach that policy. Verdict `policy`. Lens `none`. The edit is the missing path, in the owning module. Do not open a lens review.
- `leaked` — a patch at the crash would teach this module a caller's rule, a callee's rule, or a second meaning of the same value, and the owner has no policy for this outcome. Verdict `design`. Lens is the first match already in the code, not in the patch the user asked for: a flag or branch for one caller is `general-vs-special`; a swallowed or rewritten error is `error-design`; a shared sentinel, format, path, or key is `information-hiding`; a parameter whose correct value the caller cannot know is `pull-complexity-down`; the crashing function only forwards is `deep-modules`; otherwise `none`.
- `unknown` — the producer function is not in the evidence. Verdict `unconfirmed`. `cause` is `not shown`. Do not name a function you have not seen.

If the user reported no wrong output, panic, or red test, reply `no failure` and stop. If they did, and the code in hand cannot produce it, reply `no failure` and that one line. No record either way.

## Record

Do not show it. `edit` only on `repair` or `apply` when the verdict is `local` or `policy`. On `apply` it names the change that was written.

```text
symptom:
cause:
distance: owns | boundary | leaked | unknown
hypothesis: <one sentence> Falsify: <one observation not already shown>
evidence:
lens: none | general-vs-special | error-design | information-hiding | deep-modules | pull-complexity-down
verdict: local | policy | design | unconfirmed
edit: <file> <producer> <one sentence>
```

## Reply

Three sentences, in this order:

1. Where the bad value is made.
2. The patch that would land on the wrong layer, then the verdict.
3. The falsifier, and whether that check held. If the pace could not run it, say it is unchecked.

On `repair` or `apply`, when the verdict is `local` or `policy`, add one sentence naming the edit. On `no failure`, that one line is the whole reply.

## Pull request signature

If this session opens a pull request, or updates the body of one it opened, end that body with a single line of the form `Plumbline-Skills: red-flags, deep-modules`. List the directory name of each Plumbline skill whose checks you actually ran, comma-separated, in the order you ran them, including this skill. That example is the shape, not a default list. If a `Plumbline-Skills:` line is already there, replace it. Do not add the line to commit messages, review comments, or a pull request you are only reviewing, and do not open a pull request just to add it.
