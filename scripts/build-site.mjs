// Builds the documentation site into _site/ from the skills themselves, so the
// site can't drift from what the plugin ships. No dependencies: the README's
// "What's Inside" tables give the groups and summaries, each SKILL.md is copied
// as-is and rendered in the browser.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"); // Windows drive paths
const OUT = join(ROOT, "_site");
const REPO = "https://github.com/tomymaritano/plumbline";

const readme = readFileSync(join(ROOT, "README.md"), "utf8");
const version = JSON.parse(readFileSync(join(ROOT, ".claude-plugin/plugin.json"), "utf8")).version;

// Groups and one-line summaries from README "What's Inside".
const inside = readme.slice(readme.indexOf("## What's Inside"), readme.indexOf("## Attribution"));
const groups = [];
for (const line of inside.split("\n")) {
  const h = line.match(/^### (.+)/);
  if (h) groups.push({ title: h[1].trim(), skills: [] });
  const row = line.match(/^\| `([a-z-]+)` \| (.+) \|$/);
  if (row && groups.length) groups.at(-1).skills.push({ name: row[1], summary: row[2] });
}

const skillDirs = readdirSync(join(ROOT, "skills"));
const listed = new Set(groups.flatMap((g) => g.skills.map((s) => s.name)));
const missing = skillDirs.filter((d) => !listed.has(d));
if (missing.length) throw new Error(`skills missing from README "What's Inside": ${missing.join(", ")}`);

const esc = (s) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

// One sentence a person would recognize, per skill. The README table stays the
// book-term index; the site leads with the situation. A new skill fails the
// build until it has a line here.
const questions = {
  "deep-modules": "Adding one thing takes too many steps.",
  "module-boundaries": "These pieces are always edited together.",
  "information-hiding": "One change ripples through the repo.",
  "pull-complexity-down": "Every new caller gets this API wrong.",
  "abstraction-quality": "This layer mirrors the one under it.",
  "general-vs-special": "Flags keep getting added for one caller.",
  "error-design": "The error handling is longer than the code.",
  "naming-obviousness": "No name you try actually fits.",
  "comments-docs": "The comments repeat the code, or the docs drifted.",
  "strategic-mindset": "It shipped in a hurry. Can you build on it?",
  "design-it-twice": "You're about to commit to a design.",
  "code-evolution": "You're looking at a diff before it merges.",
  "complexity-recognition": "It's painful and you can't say why.",
  "red-flags": "Is anything off in this file?",
  "design-review": "Review this module, worst issues first.",
  "fault-locality": "Where is this failure actually fixed?",
  "diagnose": "Which check should run?",
  "apply-fixes": "Apply the review, one fix at a time.",
  "test-worth": "Which tests earn their keep?",
};

const blurbs = {
  "Structure & Modules": "Where the code is cut, and what each piece hides.",
  "Abstraction & Generality": "What the interface claims to be.",
  "Clarity & Communication": "Names and comments.",
  "Process & Evolution": "How the design got here.",
  "Diagnostic": "Pick where to start, or apply a review you already have.",
  "Testing": "Not a design lens. A test stays only if it pays for itself. The rule and the procedures are the documents under the skill.",
};

const entries = [
  ["diagnose", "You can't say what kind of problem it is."],
  ["red-flags", "You have a file and no specific worry."],
  ["design-review", "You want a full pass, important issues first."],
  ["fault-locality", "You have a panic, a stack, or a red test."],
  ["test-worth", "The question is which tests to write or keep."],
  ["apply-fixes", "A review already named what to change."],
];

const rail = `<div class="rail" aria-hidden="true"><div class="instrument"><div class="cord"></div><svg class="bob" viewBox="0 0 40 84" focusable="false"><line x1="20" y1="0" x2="20" y2="8.2" stroke="var(--cord)" stroke-width="2"/><circle cx="20" cy="5" r="3.2" fill="none" stroke="var(--bob)" stroke-width="1.6"/><rect x="18.6" y="8" width="2.8" height="6.4" fill="var(--bob)"/><path fill="var(--bob)" d="M15.5 14.4H24.5C29 14.4 32.2 20 32.2 30 32.2 44 28.4 58 23 70.5 21.6 75.2 20.6 79.4 20 83 19.4 79.4 18.4 75.2 17 70.5 11.6 58 7.8 44 7.8 30 7.8 20 11 14.4 15.5 14.4Z"/><circle cx="20" cy="31" r="1.45" fill="var(--cord)"/></svg></div></div>`;

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync(join(ROOT, "skills"), join(OUT, "skills"), { recursive: true });
cpSync(join(ROOT, "docs"), join(OUT, "docs"), { recursive: true });
cpSync(join(ROOT, "scripts/site"), OUT, { recursive: true });

for (const name of listed) {
  if (!questions[name]) throw new Error(`site question missing for skill: ${name}`);
}
for (const name of Object.keys(questions)) {
  if (!listed.has(name)) throw new Error(`site question for unknown skill: ${name}`);
}
for (const [name] of entries) {
  if (!listed.has(name)) throw new Error(`start-here skill missing from README: ${name}`);
}

// Reading order for a skill whose references are one document split across files.
// Any other reference file is still listed; a name in this list that is gone fails the build.
const refOrder = {
  "test-worth": ["pillars.md", "smells.md", "size.md", "behaviors.md", "canon-tdd.md", "legacy.md"],
};

function referencesFor(name) {
  const dir = join(ROOT, "skills", name, "references");
  if (!existsSync(dir)) return [];
  const files = readdirSync(dir).filter((f) => /^[a-z0-9-]+\.md$/.test(f));
  const order = refOrder[name] || [];
  const missing = order.filter((f) => !files.includes(f));
  if (missing.length) throw new Error(`listed reference missing for ${name}: ${missing.join(", ")}`);
  const rest = files.filter((f) => !order.includes(f)).sort();
  return [...order, ...rest].map((file) => {
    const text = readFileSync(join(dir, file), "utf8");
    const title = text.match(/^# (.+)$/m);
    if (!title) throw new Error(`reference has no title: ${name}/references/${file}`);
    return { file, title: title[1].trim() };
  });
}

const entryHtml = entries
  .map(
    ([name, situation]) => `
        <a href="skill.html?name=${name}">
          <span class="situation">${esc(situation)}</span>
          <span class="name">${name}</span>
        </a>`,
  )
  .join("");

const cards = groups
  .map((g) => {
    const blurb = blurbs[g.title];
    return `
    <section class="group">
      <h3>${esc(g.title)}</h3>
      ${blurb ? `<p class="blurb">${esc(blurb)}</p>` : ""}
      <div class="grid">${g.skills
        .map((s) => {
          const refs = referencesFor(s.name);
          const list = refs.length
            ? `<ul class="refs">${refs
                .map(
                  (r) =>
                    `<li><a href="skill.html?name=${s.name}&file=references/${r.file}">${esc(r.title)}</a></li>`,
                )
                .join("")}</ul>`
            : "";
          return `
        <div class="skill">
          <a class="card" href="skill.html?name=${s.name}">
            <span class="q">${esc(questions[s.name])}</span>
            <span class="name">${s.name}</span>
          </a>
          ${list}
        </div>`;
        })
        .join("")}
      </div>
    </section>`;
  })
  .join("");

const fill = (html) =>
  html
    .replaceAll("{{VERSION}}", version)
    .replaceAll("{{REPO}}", REPO)
    .replaceAll("{{RAIL}}", rail)
    .replaceAll("{{ENTRIES}}", entryHtml)
    .replaceAll("{{SKILLS}}", cards);

const index = fill(readFileSync(join(ROOT, "scripts/site/index.template.html"), "utf8"));
writeFileSync(join(OUT, "index.html"), index);
rmSync(join(OUT, "index.template.html"));

const skillPage = fill(readFileSync(join(OUT, "skill.html"), "utf8"));
writeFileSync(join(OUT, "skill.html"), skillPage);
const docPage = fill(readFileSync(join(OUT, "doc.html"), "utf8"));
writeFileSync(join(OUT, "doc.html"), docPage);
writeFileSync(join(OUT, ".nojekyll"), "");

console.log(`site: ${listed.size} skills in ${groups.length} groups, v${version} -> ${OUT}`);
