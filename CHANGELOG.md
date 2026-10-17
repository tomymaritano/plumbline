# Changelog

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
