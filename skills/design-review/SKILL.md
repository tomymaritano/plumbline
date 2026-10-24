---
name: design-review
description: "Orchestrates a structured design review, running the other skills as a diagnostic funnel from complexity triage to a full red-flags sweep. Use when the user asks for a comprehensive or prioritized design assessment of a file, module, or PR. Not for an open-ended \"anything off here?\" or \"take a look at this\" prompt that names no review goal (use red-flags), a plain diff review before merge or analyzing how code changed over time (use code-evolution), or applying one specific lens (use that skill directly). Not for a panic, a stack trace, a failing test, or a request to patch the crash (use fault-locality)."
argument-hint: "[file, module, or PR to review]"
allowed-tools: Read, Grep, Bash(git log:*), Bash(git diff:*), Bash(git show:*)
---

# Design Review Orchestrator

When invoked with $ARGUMENTS, scope the entire review to the specified target. Read the target code first, then proceed through the phases below in order. This skill orchestrates other skills from Plumbline (https://github.com/tomymaritano/plumbline). It works best when the full collection is installed.

This skill does not replace individual lenses. It sequences them into a diagnostic funnel that moves from broad to narrow, skipping work when early phases find nothing actionable.

If the ask is only about tests, this funnel does not apply; use **test-worth**.

If the report is a panic, a stack, a failing test, or a request to patch the crash, this funnel does not apply; use **fault-locality**.

## Diagnostic Funnel

### Phase 1: Complexity Triage

Apply **complexity-recognition** checks against the target.

- Identify the three symptoms: change amplification, cognitive load, unknown unknowns
- Trace any symptoms to root causes: dependencies or obscurity
- Weight findings by the complexity formula: high-traffic code first

This phase determines whether the target has measurable complexity problems. If it does, subsequent phases diagnose where.

### Phase 2: Structural Review

Apply these lenses to the target's module-level architecture:

- **module-boundaries**: Are the boundaries drawn around knowledge domains or around steps in a process?
- **deep-modules**: Does each module provide powerful functionality behind a simple interface? Check for classitis, pass-through methods and shallow wrappers.
- **abstraction-quality**: Does each layer provide a genuinely different way of thinking, or do adjacent layers duplicate the same abstraction?

Focus on the modules that Phase 1 identified as highest-complexity. If Phase 1 found nothing, scan the largest or most-connected modules.

### Phase 3: Interface Review

Apply these lenses to the interfaces exposed by the modules from Phase 2:

- **information-hiding**: Does the interface leak implementation details? Check for back-door leakage (shared knowledge not in any interface).
- **general-vs-special**: Does the interface mix general-purpose mechanisms with special-case knowledge? Check for boolean parameters serving one caller.
- **pull-complexity-down**: Are callers forced to handle complexity the module could absorb? Check for exposed edge cases, required configuration and exceptions that could be defined away.
- **error-design**: Are errors defined out of existence where possible? Check for catch-and-ignore, overexposed exceptions and error handling longer than the happy path.

### Phase 4: Surface Review

Apply these lenses to naming and documentation:

- **naming-obviousness**: Do names create precise mental images? Check the isolation test: seen without context, could the name mean almost anything?
- **comments-docs**: Do comments capture what the code cannot say (intent, rationale, constraints)? Check for comments that repeat code and implementation details contaminating interface documentation.

### Phase 5: Red Flags Sweep

Run the full **red-flags** 18-flag checklist against the target. Any flag triggered in Phases 1-4 will already be marked. This phase catches flags that earlier phases may not have surfaced (especially Process flags 15-17: No Alternatives Considered, Tactical Momentum, Catch-and-Ignore).

## Early Termination

If Phase 1 finds no measurable complexity AND Phase 5 triggers zero flags, stop. Report the target as clean. Do not force findings where none exist, and if production is clean and what remains is test code, name **test-worth** for that part.

## Prioritization

Rank findings in this order:

1. **Syndrome clusters**: Multiple flags pointing to the same root cause (e.g., information leakage + conjoined methods + repetition all stemming from one misplaced boundary). These indicate systemic issues. Fixing the root cause resolves all flags in the cluster.
2. **Boundary issues**: Information leakage, module boundary problems and abstraction mismatches. These compound over time and infect adjacent code.
3. **Canary flags**: Hard to Pick Name, Hard to Describe, Non-obvious Code, No Alternatives Considered. These are the cheapest signals. Catch them and the structural flags never materialize.
4. **Structural issues**: Shallow modules, pass-through methods, classitis. These require refactoring but affect a bounded area.
5. **Surface issues**: Naming and documentation problems. Important but lowest cost to fix and lowest risk if deferred.

If the project has `.plumbline/findings.md`, read it first and reconcile the review with it at the end, as **red-flags** describes in its findings-file reference: lead with new and regressed findings, then update the file.

The review ends at the report. If the user wants the fixes applied, **apply-fixes** takes this ranking as its plan and applies one fix at a time, running the tests after each.

## Reviewing at Scale

For any target too large to read whole, use the Reading Strategy in **red-flags** (public API, then boundaries, then only the implementations a signal points at) in every phase, not only Phase 5.

The funnel above is written for one target reviewed in-conversation. When the target is an entire codebase, a large PR spanning many files, or the user asks for a "thorough" or "comprehensive" review, running it once per file in a single conversation burns context fast and serializes work that has no reason to be serial.

If Dynamic Workflows are available in this session (the user said "workflow," used the `ultracode` keyword, or `/effort ultracode` is set), build one instead of running the funnel manually file by file. See [references/workflow-builder.md](references/workflow-builder.md) for how to map these five phases onto a workflow script — what fans out, what needs a barrier, and where to add adversarial verification. If workflows aren't available, fall back to running the funnel per file or module in sequence, same as a single-target review.

## Pull request signature

If this session opens a pull request, or updates the body of one it opened, end that body with a single line of the form `Plumbline-Skills: red-flags, deep-modules`. List the directory name of each Plumbline skill whose checks you actually ran, comma-separated, in the order you ran them, including this skill. That example is the shape, not a default list. If a `Plumbline-Skills:` line is already there, replace it. Do not add the line to commit messages, review comments, or a pull request you are only reviewing, and do not open a pull request just to add it.
