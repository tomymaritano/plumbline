<img width="1280" height="640" alt="Hero social preview@1x" src="https://github.com/user-attachments/assets/5348c0f8-6efc-4389-a4c0-d1d81f6e55d1" />


<h1 align="center">Plumbline</h1>

AI agents can write working code, but they don't stop to consider effective design unless asked. Plumbline is a set of skills inspired by John Ousterhout's [*A Philosophy of Software Design*](https://web.stanford.edu/~ouster/cgi-bin/aposd.php). Like a builder's plumb line, each skill gives your agent a simple, concrete test for whether the design is still standing straight, during implementation and review.

## How It Works

Skills activate automatically and push your agent to ask questions like:

- *Does this interface hide real complexity, or just pass things through?*
- *Can this method be understood without reading another one in a different file?*
- *Is error handling pushing work onto callers that the module could handle itself?*

You can also invoke them directly. Use `/plumbline:red-flags` to trigger a design smell scan, `/plumbline:apply-fixes` to apply its findings with the tests as a safety net, `/plumbline:deep-modules` to check interface depth and `/plumbline:design-it-twice` to compare alternatives before committing. (On platforms that install the skills without the plugin namespace, such as skills.sh, drop the `plumbline:` prefix.)

## Installation

Give your agent Plumbline: [Claude Code](#claude-code), [skills.sh](#skillssh), [Codex](#codex), [Cursor](#cursor), [OpenCode](#opencode), [Antigravity](#antigravity), [Factory Droid](#factory-droid), [Grok Build](#grok-build), [GitHub Copilot CLI](#github-copilot-cli), [Kimi Code](#kimi-code), [Pi](#pi).

**Note:** Installation differs by platform. If you use more than one, install Plumbline separately for each.

### Claude Code

```bash
/plugin marketplace add tomymaritano/plumbline
/plugin install plumbline@plumbline-plugins
```

### [skills.sh](https://skills.sh/tomymaritano/plumbline)

```bash
npx skills add tomymaritano/plumbline --skill '*'
```

### Codex

Requires Codex CLI ≥ 0.142.0 (`codex --version`). The Codex App and CLI share the same config, so this also makes Plumbline visible in the App's Plugins panel.

```bash
codex plugin marketplace add tomymaritano/plumbline
codex plugin add plumbline@plumbline
```

Older Codex versions only get the 17 skills, via a manual symlink — see [.codex/INSTALL.md](.codex/INSTALL.md) for that fallback and full troubleshooting.

### Cursor

Cursor doesn't yet have a one-line "install from a GitHub URL" flow for unlisted plugins, so clone (or symlink) the repo into Cursor's local plugins folder and restart:

```bash
git clone https://github.com/tomymaritano/plumbline.git ~/.cursor/plugins/local/plumbline
```

Then check the **Customize** panel in the sidebar to confirm Plumbline and its 17 skills are listed.

### OpenCode

Add Plumbline to the `plugin` array in your `opencode.json` (global or project-level):

```json
{
  "plugin": ["plumbline@git+https://github.com/tomymaritano/plumbline.git"]
}
```

Restart OpenCode — no symlinks or manual skill paths needed. See [.opencode/INSTALL.md](.opencode/INSTALL.md) for version pinning, troubleshooting, and migrating off the old symlink-based install.

### Antigravity

```bash
agy plugin install https://github.com/tomymaritano/plumbline
```

### Factory Droid

Droid translates Claude Code plugin format automatically — no Plumbline-specific files needed.

```bash
droid plugin marketplace add https://github.com/tomymaritano/plumbline
droid plugin install plumbline@plumbline-plugins
```

### Grok Build

```bash
grok plugin marketplace add tomymaritano/plumbline
grok plugin install plumbline
```

Or install straight from the repo with `grok plugin install tomymaritano/plumbline`. Add `--trust` to skip the confirmation prompt, then run `/plugin` to check that Plumbline and its 17 skills are listed.

### GitHub Copilot CLI

```bash
copilot plugin marketplace add tomymaritano/plumbline
copilot plugin install plumbline@plumbline-plugins
```

### Kimi Code

In Kimi Code's plugin manager (`/plugins`), choose **Custom**, or run directly:

```text
/plugins install https://github.com/tomymaritano/plumbline
```

Kimi Code will show a third-party trust prompt since this isn't an officially curated source — confirm to proceed.

### Pi

```bash
pi install git:github.com/tomymaritano/plumbline
```

Pi auto-discovers the `skills/` directory with no extra config.

## Review on stop (opt-in)

Plumbline can check the code your agent writes, not only the code you ask it to review. When it's on and a turn writes a lot of code (80+ lines by default) or creates a new code file, Plumbline asks Claude once, before it finishes, to run `red-flags` on those files and report only what triggered. Small edits, docs and config files never trigger it, and it never applies fixes on its own.

It's off by default. In Claude Code, turn it on from `/config` (the **Review on stop** row under Plumbline) or `/plugin` → Plumbline → configure, and adjust **Review threshold (lines)** there too. It runs on Claude Code only; other agents install the skills without the hook.

## What's Inside

### Structure & Modules

| Skill | Covers |
| --- | --- |
| `deep-modules` | Module depth, shallow modules, classitis, pass-through methods, interface vs implementation |
| `module-boundaries` | Merge vs split, conjoined methods, method splitting, dependency minimization |
| `information-hiding` | Information leakage, temporal decomposition, partial hiding, false encapsulation, git co-change evidence |
| `pull-complexity-down` | Caller burden, configuration parameters, the core asymmetry |

### Abstraction & Generality

| Skill | Covers |
| --- | --- |
| `abstraction-quality` | Genuine vs false abstractions, layer boundaries, decorators |
| `general-vs-special` | Interface generality, special-general mixture, edge-case elimination |
| `error-design` | Define errors out of existence, exception masking, aggregation, just crash |

### Clarity & Communication

| Skill | Covers |
| --- | --- |
| `naming-obviousness` | Isolation test, scope-length principle, consistency, avoid extra words |
| `comments-docs` | Comment types, comments-first workflow, cross-module documentation |

### Process & Evolution

| Skill | Covers |
| --- | --- |
| `strategic-mindset` | Strategic vs tactical, investment rule, tactical tornado |
| `design-it-twice` | Generate alternatives, compare on criteria, synthesize |
| `code-evolution` | "Designed this way" standard, repetition, technical debt; reviews a branch or PR straight from `git diff` |
| `complexity-recognition` | Change amplification, cognitive load, unknown unknowns |

### Diagnostic

| Skill | Covers |
| --- | --- |
| `red-flags` | 18-flag design smell scan covering structure, boundaries (including adapters that re-implement the core's vocabulary), documentation, naming, and process. Separates real problems from documented trade-offs, has a reading strategy for large multi-package targets, and ships Python, TypeScript, Rust and Go guides |
| `design-review` | Structured review funnel from complexity triage through structural, interface, and surface checks |
| `diagnose` | Routes a vague symptom or complaint to the most relevant skill via a decision tree |
| `apply-fixes` | Applies a report's findings one fix at a time, running the tests after each and reverting any fix that breaks them; asks before changing a public interface |

## Attribution

These skills are adapted in part from the teachings of
[John Ousterhout](https://web.stanford.edu/~ouster/cgi-bin/home.php),
professor of computer science at Stanford University, and his book
[*A Philosophy of Software Design*](https://web.stanford.edu/~ouster/cgi-bin/aposd.php). This project is not affiliated with, endorsed by, or sponsored by John Ousterhout, Stanford University, or the publishers of *A Philosophy of Software Design*.

**If you find these skills useful, you should really buy and read the book.** The skills in this repo are by no means a substitute for reading it. It is the definitive treatment of these ideas and an enjoyable read for any dev.  Available from [Amazon](https://www.amazon.com/dp/173210221X) (no affiliate link). Also available in [German](https://www.oreilly.com/library/view/prinzipien-des-softwaredesigns/9781098130053/) (O'Reilly, 2021) and [Chinese](https://item.jd.com/14328323.html) (Posts and Telecommunications Press, 2024).

The skills and code in this project are independently authored original works by the project's contributors. Brief quotations from the book are sometimes used with full attribution for purposes of commentary, criticism, and education. All trademarks and copyrights are the property of their respective owners.

## Contributing

Contributions are welcome beyond the inspiration material, but should reinforce the core philosophy of thinking strategically about software design.

To contribute:

1. Fork the repository
2. Create a branch
3. Follow the [`writing-skills`](https://github.com/obra/superpowers/blob/main/skills/writing-skills/SKILL.md) skill from [Superpowers](https://github.com/obra/superpowers) for creating and testing skills
4. Add your skill in `skills/<skill-name>/SKILL.md` with optional `references/` files
5. Commit your changes and submit a PR

## Updating

- **Claude Code:** `/plugin update plumbline`
- **skills.sh:** `npx skills update tomymaritano/plumbline`
- **Codex:** `codex plugin marketplace upgrade plumbline && codex plugin add plumbline@plumbline`
- **Cursor:** `cd ~/.cursor/plugins/local/plumbline && git pull`, then restart
- **OpenCode:** doesn't auto-refresh on restart unless you pinned a tag — see [.opencode/INSTALL.md](.opencode/INSTALL.md#updating)
- **Antigravity:** re-run `agy plugin install https://github.com/tomymaritano/plumbline`
- **Factory Droid:** `droid plugin marketplace update plumbline-plugins && droid plugin update plumbline@plumbline-plugins`
- **Grok Build:** `grok plugin update plumbline`
- **GitHub Copilot CLI:** `copilot plugin update plumbline`
- **Kimi Code:** re-run the install command from the Custom tab
- **Pi:** `pi update --extensions` (re-run install with a new ref if you pinned one)

See [CHANGELOG.md](CHANGELOG.md) or the [GitHub releases](https://github.com/tomymaritano/plumbline/releases) for what changed in each version.

## License

[MIT License](LICENSE)
