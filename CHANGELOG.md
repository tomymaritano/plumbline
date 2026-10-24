# Changelog

## Unreleased

### Added

- **`fault-locality`.** For a panic, a stack, or a red test: name the function that made the bad value, and edit there on `apply`. A missing path to a policy the module already has is `policy`, not a design review. A nil check at the crash is a failed run.
- **`evals/fault-locality/`.** Five cases. The suite has not been run.
- **`test-worth`.** One skill that decides which tests to write and which to keep. A test stays only if it pays for itself (protection, resistance to refactoring, fast feedback, maintainability). The rule lives in `skills/test-worth/references/pillars.md`. Smells, size bands, and the procedures for writing, test-driving, and characterizing point at that file and do not restate it. `diagnose`, `red-flags`, `design-review`, and `apply-fixes` hand test questions to it.
- **Pull request signature.** After applying Plumbline skills, an agent that opens a pull request (or edits the body of one it opened) ends that body with one `Plumbline-Skills:` line listing the skills whose checks actually ran. The wording is shared from `scripts/pr-signature-section.md` and checked on every skill.

### Changed

- **`diagnose`, `red-flags`, and `test-worth`.** A panic, a stack, or a failing test goes to `fault-locality`. A question about which tests to write or keep still goes to `test-worth`. Those suites were not re-run with this description change.
- **`fault-locality` contract.** The non-edit route is `show`: the reply plus the corrected lines when the verdict is `local` or `policy`. `diagnose` only names the skill. `design-review` stops before the funnel on a panic, a stack, a failing test, or a request to patch the crash. `apply-fixes` points that case at `fault-locality`. The skill has no shell. The `diagnose`, `design-review`, and `apply-fixes` suites were not re-run. The `fault-locality` suite has not been run.

## 1.8.0

### Changed

- **Symptom-first skill descriptions.** Lens skills now open with the symptoms users describe ("adding a config option is all ceremony", "one field means editing every file", "every new client gets it wrong", "PR review please") before the book's terms. `red-flags` defers to the matching lens when the user names a concern; `diagnose` triggers only when the user doesn't know what kind of problem they have. Measured across all 13 lens suites: the right skill now fires on 92% of positive cases (was 69%) and 92% of held-out cases (was 62%), negatives stay at 100%. See `evals/TRIGGERS.md`.
- **Saying it's fine.** `diagnose` and `complexity-recognition` lead with a clean verdict when the code shows no symptoms, instead of hunting for something to restructure (`diagnose` clean case 0.50 → 1.00).

## 1.7.0

### Added

- **Remembering findings.** Optional `.plumbline/findings.md` in your project, keyed by concept. `red-flags` and `design-review` reconcile each review with it (new, still open, regressed, fixed) and update it; `apply-fixes` marks fixes; `code-evolution` flags regressions. Accepted entries with a reason count as ACCEPTED rationale.
- **`apply-fixes`: coverage check, commit mode, flaky retry.** Flags fixes no test reaches, can commit each fix separately (message names the flag), and re-runs once before reverting on an unrelated test failure.
- **Design review on pull requests.** Reusable GitHub Actions workflow (`plumbline-review.yml`) running `code-evolution` on a PR diff, commenting only on boundary/root-cause/regression findings. Read-only, forks skipped, prompt-injection guard, actions pinned to SHAs. See `docs/ci-review.md`.
- **Docs site** at https://tomymaritano.github.io/plumbline/, built from the skills on each release.
- **Security and privacy** section in the README.
- **Design check for other agents.** README snippet for `AGENTS.md` (and equivalents) that gives Codex, Cursor, Grok Build and other agents the review-on-stop behavior as an instruction, with the trade-off against the Claude Code hook spelled out.

## 1.6.0

### Added

- **Rust and Go guides** for `red-flags` (`references/rust.md`, `references/go.md`): the idiomatic shapes each flag takes, such as single-impl traits and cfg-duplicated logic in Rust, producer-side interfaces and context-free `return err` chains in Go.
- **An eval suite for every skill.** The 13 skills that had none now have one (2 positive cases + 1 negative each, with baselines). New sandboxed suites: `red-flags-scale` (a ~2,000-line repo on disk with git history, measuring the reading strategy) and `apply-fixes`; see `evals/MAC.md`.

## 1.5.0

### Added

- **`apply-fixes` skill.** Applies the findings of a red-flags or design-review report one fix at a time: checks for a clean tree, finds the test command, runs a baseline, shows a plan, asks before changing a public interface, runs the tests after every fix and reverts only the fix that broke them. Ends with applied / reverted / skipped and `git diff --stat`; never commits unless asked. `red-flags`, `design-review` and `diagnose` point to it.
- **Review on stop (opt-in hook).** With the `review_on_stop` option on, a turn that writes 80+ lines of code (`review_threshold_lines`) or creates a code file ends with one `red-flags` check of those files, reporting only what triggered. Off by default; Claude Code only. Dependency-free Node scripts in `hooks/`, tested with `node:test` (`npm test`) in CI.

## 1.4.0

### Added

- **Flag 18, Vocabulary Not Owned** in `red-flags`: adapters (bindings, SDKs, clients) that each re-implement names, codes, parsing or defaults the core module should expose. New syndrome cluster in the flag interaction map, **The Adapter Echo** (Vocabulary Not Owned + Repetition + Information Leakage).
- **ACCEPTED state** in `red-flags`: a flag whose signal is present but backed by an explicit, still-valid rationale in the code or docs is listed in one line and left out of the summary and prioritization, instead of being reported as a problem.
- **Reading strategy** in `red-flags` for targets over about 1,000 lines or spanning several packages: public API first, then boundaries, then only the implementations a signal points at; tests and generated code skipped. `design-review` points to it for reviews at scale.
- **Python and TypeScript guides** (`red-flags/references/python.md`, `typescript.md`): the idiomatic shapes each flag takes in those languages.
- **Read-only git access** (`git log`, `git diff`, `git show`) for `red-flags`, `code-evolution`, `information-hiding` and `design-review`. `code-evolution` reviews a branch with `git diff <base>...HEAD`; the Git Co-Change Test now has a concrete command.
- **Eval case `11-rust-bindings`** for `red-flags`, condensed from a real review of a Rust workspace with Node, Python and WASM bindings.
- **Grok Build support.** Install with `grok plugin marketplace add tomymaritano/plumbline` and `grok plugin install plumbline`. Native manifests live in `.grok-plugin/` and are kept in sync by `scripts/bump-version.sh`.

## 1.3.1

First release as Plumbline. 16 skills and the `clean-room-alternative` subagent, installable on Claude Code, skills.sh, Codex, Cursor, OpenCode, Antigravity, Factory Droid, GitHub Copilot CLI, Kimi Code and Pi.
