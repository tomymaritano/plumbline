---
name: test-worth
description: "Use when the user asks which tests to write or keep, asks to add or review tests, says a test breaks whenever the implementation changes, or asks whether a mock, a private-method test, or a characterization test is worth it (\"what should I test?\", \"this test is brittle\", \"are these tests locking us in?\"). Judges every test by one acceptance rule: it stays only if it pays for itself. Not for fixing a failing test or a bug the user already identified (use fault-locality), not for applying a design report (use apply-fixes), and not for a design smell in production code (use red-flags or the matching lens)."
argument-hint: "[file, test, or behavior to judge]"
allowed-tools: Read, Grep, Edit, Write, Bash(git status:*), Bash(git diff:*)
---

# Test Worth

When invoked with $ARGUMENTS, treat it as the test, file, or behavior to judge. Read that code first. This skill judges tests from Plumbline (https://github.com/tomymaritano/plumbline). It works best when the full collection is installed.

The acceptance rule, the smell catalog, and the size bands each live in one file. This skill routes. It does not restate them. A verdict is a reading of the tests and the code they reach. Do not install a runner, a coverage uploader, a mutation tool, or a browser driver, and do not read a coverage report in order to judge.

## Which files to read

Read these three before any verdict, including a verdict on a test you are about to write:

- [references/pillars.md](references/pillars.md) — the only acceptance rule, the record template, and the verdicts
- [references/smells.md](references/smells.md) — the only smell catalog
- [references/size.md](references/size.md) — the only size bands

Read one more file, and only on the route that names it:

- **Write** → [references/behaviors.md](references/behaviors.md)
- **Drive** → [references/canon-tdd.md](references/canon-tdd.md)
- **Characterize** → [references/legacy.md](references/legacy.md)

## Routes

Pick one. Judge is the default. Characterize wins over Write when the target has no tests and the user is about to change it or asks to pin current behavior; Write is only for choosing or adding tests when the user is not characterizing before a change.

### Judge

The user wants to know whether existing tests earn their place. Emit one record per test, in the template `pillars.md` defines, then a tally of the verdicts. Do not edit files. If every verdict is `keep`, say so and stop.

### Write

The user asked which tests to write, or to add tests for behavior that already exists, and is not characterizing before a change. Follow `behaviors.md`. Score every draft with a record before writing anything. A `don't-write` stays in the answer as a rejection. Show the records and ask. On yes, create or edit test files only, then run the project's test command once. A new failure means the test is wrong or it found a bug: stop and show it. Do not edit production code. Building that behavior test-first is a new explicit Drive request.

### Drive

The user explicitly asked to build new behavior test-first. Follow `canon-tdd.md`. Ask before the first production edit. Run the project's test command for the failing run and again after the production change. Do not mix a design restructuring into the step that makes the test pass. A design problem noticed here is named and left to the matching lens or to **apply-fixes**.

### Characterize

The target has no tests and the user is about to change it, or the user asks to pin current behavior. Follow `legacy.md`. Ask, write the test, and run the project's test command once to confirm it passes against current behavior. Do not change production code in this step.

## The project's test command

Use the command **apply-fixes** already looks up: a `test` script in `package.json`, `cargo test`, `pytest` (when `pyproject.toml`, `pytest.ini`, or `tests/` is present), `go test ./...`, a `test` target in a Makefile or justfile, or the command documented in the project's CLAUDE.md or README. If none is clear, ask. Do not add that command to this skill's frontmatter. If the host blocks the command because it is not allowlisted, ask the user to run it and paste the output.

Judge does not run the command. A verdict does not depend on a green suite.

## What this skill does not do

- It does not fix a failing test or a bug the user already identified. That goes to **fault-locality**.
- It does not redesign production code so a test can reach it. When the only way to observe the behavior is to publish private state, the verdict is `don't-write` and the note names **deep-modules** or **information-hiding**. It does not propose the split.
- It does not write `.plumbline/findings.md`. That file is the design-flag log.
- It does not commit unless the user asks.
- It does not weaken an assertion. Changing what a test claims is a new record, shown to the user, not a silent edit.

## Pull request signature

If this session opens a pull request, or updates the body of one it opened, end that body with a single line of the form `Plumbline-Skills: red-flags, deep-modules`. List the directory name of each Plumbline skill whose checks you actually ran, comma-separated, in the order you ran them, including this skill. That example is the shape, not a default list. If a `Plumbline-Skills:` line is already there, replace it. Do not add the line to commit messages, review comments, or a pull request you are only reviewing, and do not open a pull request just to add it.
