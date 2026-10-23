# fault-locality evals

Eval suite for the `fault-locality` skill. Every case runs twice: once with Plumbline installed and once without. The headline number is **Δ**: the with-plugin score minus the without-plugin score.

## Run

```bash
claude plugin eval . --eval-dir evals/fault-locality --ablation with-without --judge-model sonnet --no-publish --trust-plugin -j 4
```

- Reports go to `evals/fault-locality/results/`, which is gitignored.
- Add `--case '02-*'` to run a single case. Only `*` wildcards work.
- Every case pins the agent to `model: opus` and runs 2 times per arm. Keep the judge on a different model (`sonnet`).
- This suite has not been run. Do not start a run unless asked. A full with/without pass is on the order of a few dollars.

## What it measures

`fault-locality` takes a failure that is already in hand (a panic, a stack, a red test, or a request to patch the crash) and names the function that made the bad value. The edit belongs in that function when the module owns the value, or on the missing path to a policy the module already has. A nil check, an empty return, or a coerce at the crash line is the wrong layer. A design question with no failing output should not fire the skill. When the reported output already matches, the reply is `no failure`.

| Case | Shape | Planted problem |
|---|---|---|
| `01-owns-nil-bins` | "TypeError on the first record, just return if bins is None", Python | `BinTally.__init__` stores `None`. The edit is an empty dict in the constructor. A guard inside `record` drops the write |
| `02-boundary-addon-gate` | Red test, "just ignore spec_not_in_plan", Python | `addon_in_catalog` already accepts a library addon with no page. The addon branch still calls `skip_reason` with `require_page=True`, so `Addons` never emits. The edit is that missing path. Core codes keep the page gate |
| `03-neg-merge-types` | "Should these two types be one?", no panic and no red test | none — `fault-locality` must stay off |
| `04-clean-matching-total` | "It returns 2000 and the test expects 2000. Patch the crash.", tagged `clean` | none — the reply is `no failure` |
| `05-holdout-double-discount` | Held out. Do not read this case while tuning the description | a local arithmetic bug. Confirm with `--tag holdout` only after the other cases are settled |

The code for each case is inlined in its prompt. The prompts name the crash and the patch the user wants there. They do not name the producer.

## Graders

- **One grader per planted problem (weight 1).** Did the answer put the edit in the producer, or on the missing policy path? A crash-site guard or an ignored error fails.
- **`skill-fired`.** Checks that `fault-locality` itself was invoked. Display-only. It is reported and not the claim this suite exists to prove.
- **Negative case:** the merge question is answered, the answer does not hunt a bug, and `skill-not-fired` (min 0, max 0).
- **Clean case:** the answer says there is no failure and does not change `line_cents`.

## Baseline

Not run. Neighboring description edits in the same change (`diagnose` and `red-flags` now point panics and failing tests here) were not re-measured either.

## When to re-run

Re-run after any change to `skills/fault-locality/SKILL.md`, especially the description. Also re-run `evals/diagnose` and `evals/red-flags` when their "Not for … (use fault-locality)" clauses change. When the numbers move, record them in the Baseline section. Leave `05-holdout-double-discount` unread until that confirmation run.
