---
name: apply-fixes
description: "Applies the findings of a design review one fix at a time, running the project's tests after each and reverting any fix that breaks them. Use when the user asks to apply, implement or fix the findings of a red-flags scan, design-review or another Plumbline report, or says to go ahead with the recommended design changes. Not for fixing a specific bug, error or failing test (use fault-locality), and not for reviewing code (use red-flags or design-review first)."
argument-hint: "[report file, or which findings to apply]"
allowed-tools: Read, Grep, Edit, Write, Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git checkout:*), Bash(git add:*), Bash(git commit:*)
---

# Apply Fixes

When invoked with $ARGUMENTS, treat it as the report to apply or the subset of findings the user picked. This skill turns a Plumbline report into code changes from Plumbline (https://github.com/tomymaritano/plumbline). It works best when the full collection is installed.

A design fix is a refactor: behavior must not change. The tests are the contract. Every fix is applied alone, checked alone and reverted alone, so a bad fix never takes good ones down with it.

## When to Apply

- The user asks to apply the findings of a **red-flags** or **design-review** report from this conversation or a file
- The user picks specific findings ("fix 1 and 3") from such a report
- The user agrees to a recommended design change and asks you to make it

## When NOT to Apply

- A bug, crash or failing test: use **fault-locality**. This procedure would slow it down
- No report and no named finding: run **red-flags** (or **design-review**) first, show the report, and let the user choose
- Findings marked ACCEPTED: they are documented trade-offs, not work items

## Procedure

### 1. Get the findings

Use the report already in the conversation, or read the file the user names. If there is neither, run **red-flags** on the target first and stop to let the user pick. Keep only TRIGGERED findings, with their location and candidate fix.

### 2. Prepare the ground

1. **Clean tree**: run `git status`. If there are uncommitted changes, ask whether to continue: reverting a failed fix with `git checkout -- <file>` would also discard the user's own edits in that file. Outside a git repository, say that failed fixes can only be undone by hand and ask before continuing.
2. **Find the test command**: look at `package.json` scripts (`test`), `Cargo.toml` (`cargo test`), `pyproject.toml` / `pytest.ini` / `tests/` (`pytest`), `go.mod` (`go test ./...`), a `Makefile` or `justfile` `test` target, or the project's CLAUDE.md / README. If none is clear, ask the user for it.
3. **Baseline**: run the tests once before changing anything. If they already fail, stop and report it: a red baseline makes every later result meaningless. If the project has no tests, say so and ask whether to continue with a type check or build as the only safety net, or to stop.
4. **Coverage of what you'll touch**: tests only protect the behavior they exercise, so "tests pass" means "no tested behavior changed". For each file the plan will change, check whether any test reaches it: a test file that imports or names the module, or a coverage report if the project already produces one (don't install coverage tooling). List the files no test reaches. In the plan, mark fixes that change only unprotected code as **unprotected**, and for each say what a reviewer should check by hand. If most of the plan is unprotected, say so plainly and ask before continuing.
5. **Commit mode**: ask once whether to leave all changes uncommitted (the default) or commit each applied fix separately. One commit per fix makes the run easy to review, revert one fix at a time, and bisect if something breaks later.

### 3. Plan

Order the findings with the same priority **red-flags** uses: syndrome clusters and root causes first (one root-cause fix often resolves several flags), then boundary issues, then structural, then naming and comments. For each, state in one line: the change, the files it touches, and whether it changes a **public interface** (an exported function, type, CLI flag, HTTP route, or anything another package or user calls).

Show the plan, with unprotected fixes marked, and wait for the user to confirm or trim it.

### 4. Apply, one fix at a time

For each fix in order:

1. **Ask first if it changes a public interface**, naming the callers that will change. Skip it if the user says no.
2. **Make the smallest change that removes the cause**, not the symptom. Move knowledge to its owner, delete the pass-through, push the complexity down, as the finding's lens says. Update every caller in the repo in the same fix. Don't reformat, rename or tidy anything the finding doesn't name.
3. **Run the tests.**
   - **Pass**: record the fix as applied. In commit mode, commit just this fix's files (`git add <files>`, then `git commit`) with a message that names the flag it resolves, e.g. `Remove pass-through UserService.find_by_email (red-flags #2)`. Continue.
   - **Fail**: revert only the files this fix touched (`git checkout -- <files>`), record why it failed, and decide: if later fixes don't depend on this one, continue with them; if they do, stop and report; if the red test asserts implementation and this fix did not intend to change it, do not edit it, name **test-worth**, and stop that item.
   - **Flaky?** If the failure is in a test that has nothing to do with the files you changed, run the tests once more before reverting. If the second run passes, say the test looks flaky and keep the fix; if it fails again, revert as above.
4. Never stack a second fix on top of an unverified one.

### 5. Report

End with a short summary:

- **Applied**: each fix, one line, with the files changed
- **Reverted**: each fix that broke tests, with the failing test and the likely reason
- **Skipped**: fixes the user declined or that depended on a reverted one
- **Unprotected**: applied fixes that no test reaches, with what to check by hand
- `git diff --stat` for the whole run (in commit mode, `git log --oneline` for the new commits instead)

If the project has `.plumbline/findings.md`, mark each applied fix's entry `fixed` with today's date, and add a note to entries whose fix was reverted. In commit mode, include the file in the last fix's commit.

Without commit mode, don't commit: leave the changes for the user to review.

## Boundaries

- Behavior-preserving only. If a fix would need a behavior change to make sense (a new error type callers must handle, a removed option someone uses), describe it and ask instead of applying it.
- Stay inside the findings. A new problem noticed along the way goes in the report as a suggestion, not into the diff.
- Tests changed by a fix are allowed only to follow a renamed or moved interface. Never weaken an assertion to make a fix pass.
- If a fix goes red because a test asserts implementation, revert that fix, do not weaken the assertion, name **test-worth**, and stop that item. Do not rewrite the test here.

## Pull request signature

If this session opens a pull request, or updates the body of one it opened, end that body with a single line of the form `Plumbline-Skills: red-flags, deep-modules`. List the directory name of each Plumbline skill whose checks you actually ran, comma-separated, in the order you ran them, including this skill. That example is the shape, not a default list. If a `Plumbline-Skills:` line is already there, replace it. Do not add the line to commit messages, review comments, or a pull request you are only reviewing, and do not open a pull request just to add it.
