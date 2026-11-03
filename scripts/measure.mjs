// Reproducible quality measures: compares git tag v1-initial with the current working tree.
// Run:  node scripts/measure.mjs        (needs git; no other dependencies)
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const BEFORE = "v1-initial";
const git = (...a) => { try { return execFileSync("git", a, { encoding: "utf8", maxBuffer: 1 << 26 }); } catch (e) { return e.stdout ?? ""; } };
const NOTEST = [":!*.test.ts", ":!*.test.tsx"];

// --- 1. duplicated-logic locations (non-test source only) -------------------
const checks = [
  { name: "Max-duration rule (literal 120 used in code)", before: String.raw`[=<>]=? *120\b`, after: String.raw`[=<>]=? *120\b` },
  { name: "Day-bound rule (literal 1440 used in code)", before: String.raw`[=<>]=? *1440\b`, after: String.raw`[=<>]=? *1440\b` },
  { name: "'Bookings of a room' filter (roomId ===)", before: String.raw`roomId *===`, after: String.raw`roomId *===` },
  { name: "'Invalidate previous result' rule", before: String.raw`setHasChecked\(false\)`, after: String.raw`function clearResult` },
  { name: "Form-control style copy-pasted (input classes)", before: "focus:ring-2 focus:ring-teal-400 focus:border-teal-400", after: "focus:ring-2 focus:ring-teal-400 focus:border-teal-400" },
];
const hits = (ref, pat) => {
  const args = ref ? ["grep", "-nE", pat, ref, "--", "src", ...NOTEST] : ["grep", "--untracked", "-nE", pat, "--", "src", ...NOTEST];
  return git(...args).split("\n").filter(Boolean).map((l) => l.replace(`${BEFORE}:`, ""));
};
let removed = 0;
console.log("## Duplicated logic locations (git grep, non-test files)\n");
console.log("| Rule | Before (v1-initial) | After (working tree) | Removed |\n|---|---|---|---|");
for (const c of checks) {
  const b = hits(BEFORE, c.before), a = hits(null, c.after);
  const rem = Math.max(0, b.length - a.length); removed += rem;
  console.log(`| ${c.name} | ${b.length} | ${a.length} | ${rem} |`);
  console.log(`\n<!-- before: ${b.map((x) => x.split(":").slice(0, 2).join(":")).join(", ")} | after: ${a.map((x) => x.split(":").slice(0, 2).join(":")).join(", ")} -->`);
}
console.log(`\nTotal redundant copies removed: ${removed}\n`);

// --- 2. structure: modules, lines, largest file ------------------------------
const isSrc = (f) => /\.(ts|tsx)$/.test(f) && !/\.test\.tsx?$/.test(f) && !f.endsWith(".d.ts");
const count = (s) => s.replace(/\r/g, "").replace(/\n$/, "").split("\n").length;
const beforeFiles = git("ls-tree", "-r", "--name-only", BEFORE, "src").split("\n").filter((f) => f && isSrc(f));
const before = beforeFiles.map((f) => [f, count(git("show", `${BEFORE}:${f}`))]);
const walk = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p.replace(/\\/g, "/")]; });
const after = walk("src").filter(isSrc).map((f) => [f, count(readFileSync(f, "utf8"))]);
const summary = (rows) => { const big = rows.reduce((m, r) => (r[1] > m[1] ? r : m), ["", 0]); const dirs = new Set(rows.map((r) => r[0].split("/").slice(0, -1).join("/"))); return { files: rows.length, loc: rows.reduce((s, r) => s + r[1], 0), big, folders: dirs.size }; };
const sb = summary(before), sa = summary(after);
console.log("## Structure (non-test .ts/.tsx source files)\n");
console.log("| Measure | Before | After |\n|---|---|---|");
console.log(`| Source files | ${sb.files} | ${sa.files} |`);
console.log(`| Source folders | ${sb.folders} | ${sa.folders} |`);
console.log(`| Source lines | ${sb.loc} | ${sa.loc} |`);
console.log(`| Largest file | ${sb.big[0]} (${sb.big[1]}) | ${sa.big[0]} (${sa.big[1]}) |`);
console.log("\nBefore files:\n" + before.map((r) => `  ${r[1]}\t${r[0]}`).join("\n"));
console.log("\nAfter files:\n" + after.map((r) => `  ${r[1]}\t${r[0]}`).join("\n"));
const tests = (ref) => (ref ? git("ls-tree", "-r", "--name-only", ref, "src") : walk("src").join("\n")).split("\n").filter((f) => /\.test\.tsx?$/.test(f));
console.log(`\nTest files: before ${tests(BEFORE).length}, after ${tests(null).length}`);
