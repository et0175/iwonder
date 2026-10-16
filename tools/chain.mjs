#!/usr/bin/env node
/**
 * Checks every reading order in content/03 - chains/.
 *
 * A chain is a walk through the concept graph. Two rules:
 *
 *   1. A concept may not appear before its prerequisites. Anything else is a
 *      story that cannot be told yet.
 *   2. A step marked `kind: delight` must be cuttable. Nothing on the spine may
 *      depend on it — delights are there for joy, not for load-bearing, so the
 *      book still stands if every one of them is removed.
 *   3. A chain may name `follows:` — the chapter(s) read before it. Their
 *      concepts count as already met, which is what lets a second chapter rest
 *      on the first instead of teaching everything again. A concept met twice
 *      is a warning, not an error: it may be a deliberate callback.
 *   4. A step marked `kind: seeded` establishes a conclusion without its
 *      mechanism — by evidence or by consequence rather than by explanation.
 *      Prerequisites are not required, because nothing is being explained. It
 *      must say what it `defers:`, and that debt is tracked: a deferred
 *      concept that never turns up in any chain is borrowed and not repaid.
 *
 * A set with no delight at all is a warning: that is a textbook chapter.
 *
 *   node tools/chain.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { CONTENT, listTopics, loadBook, loadTopic, splitFrontmatter, stripOrder } from "./lib/load.mjs";

const dir = fs.readdirSync(CONTENT, { withFileTypes: true })
  .find((d) => d.isDirectory() && stripOrder(d.name) === "chains");
if (!dir) { console.log("No chains folder yet."); process.exit(0); }
const CHAINS = path.join(CONTENT, dir.name);

const all = {};
for (const t of listTopics()) for (const c of loadTopic(t).concepts) all[c.id] = c;

let errors = 0, warnings = 0;
const told = [];   // chapters in book order, for the tally at the end
const deferred = new Map();   // concept id → the chain that owes it
const covered = new Set();    // every concept any chain actually explains

const unwiki = (s) => String(s).replace(/^\[\[|\]\]$/g, "").trim();
const books = fs.readdirSync(CHAINS).filter((f) => f.endsWith(".md") && !f.startsWith("_")).sort().map((f) => {
  const where = path.join(CHAINS, f);
  const [fm] = splitFrontmatter(fs.readFileSync(where, "utf8"), where);
  return {
    f, fm,
    id: fm.id ?? stripOrder(path.basename(f, ".md")),
    steps: (fm.sets ?? []).flatMap((s) => (s.steps ?? []).map((st) => ({ kind: "spine", ...st, set: s.title }))),
    follows: [].concat(fm.follows ?? []).map(unwiki),
  };
});
const bookById = new Map(books.map((b) => [b.id, b]));
// The book's own order: a chapter rests on every chapter before it in the list.
const BOOK = loadBook();
const at = new Map((BOOK?.chapters ?? []).map((id, i) => [id, i]));
for (const id of BOOK?.chapters ?? []) if (!bookById.has(id)) {
  errors++;
  console.log(`\u2717 the book lists "${id}", which is not a chain`);
}
const sourcesOf = (b) => [...new Set([
  ...b.follows,
  ...(at.has(b.id) ? BOOK.chapters.slice(0, at.get(b.id)) : []),
])];
const priorMemo = new Map();
const delightMemo = new Map();
// Cuttable steps in every chapter before this one. A later chapter may not
// lean on them either — rule 2 does not stop at the chapter boundary.
const priorDelightsOf = (b) => {
  if (delightMemo.has(b.id)) return delightMemo.get(b.id);
  delightMemo.set(b.id, new Set());
  const out = new Set();
  for (const id of sourcesOf(b)) {
    const prev = bookById.get(id);
    if (!prev) continue;
    for (const p of priorDelightsOf(prev)) out.add(p);
    for (const st of prev.steps) if (st.kind === "delight") out.add(st.concept);
  }
  delightMemo.set(b.id, out);
  return out;
};
// Everything a reader has met before this chapter opens.
const priorOf = (b) => {
  if (priorMemo.has(b.id)) return priorMemo.get(b.id);
  priorMemo.set(b.id, new Set()); // stands in while we recurse, so a cycle cannot hang
  const out = new Set();
  for (const id of sourcesOf(b)) {
    const prev = bookById.get(id);
    if (!prev) {
      errors++;
      console.log(`\n\u2717 ${b.fm.title ?? b.id}: follows "${id}", which is not a chain`);
      continue;
    }
    for (const p of priorOf(prev)) out.add(p);
    for (const st of prev.steps) out.add(st.concept);
  }
  priorMemo.set(b.id, out);
  return out;
};

for (const b of books) {
  const { f, fm, steps } = b;
  const prior = priorOf(b);
  const delights = new Set(steps.filter((s) => s.kind === "delight").map((s) => s.concept));
  const chapterNo = at.has(b.id) ? at.get(b.id) + 1 : null;
  console.log(`\n${chapterNo ? `chapter ${chapterNo}/${BOOK.chapters.length} · ` : "outside the book · "}${fm.title ?? fm.id} — ${(fm.sets ?? []).length} sets, ${steps.length} stories`);
  if (prior.size) console.log(`  rests on ${sourcesOf(b).join(", ")} — ${prior.size} concepts already met`);

  for (const st of steps) if (st.kind !== "seeded") covered.add(st.concept);
  const seen = new Set(prior);
  const order = new Map(steps.map((s, i) => [s.concept, i]));
  let n = 0, setNow = null;

  for (const st of steps) {
    n++;
    if (st.set !== setNow) { setNow = st.set; console.log(`  ── ${setNow}`); }
    if (prior.has(st.concept)) {
      warnings++;
      console.log(`  ! ${st.concept} was already met in an earlier chapter — a callback, or a step to drop`);
    }
    const c = all[st.concept];
    if (c && st.kind === "seeded") {
      seen.add(st.concept);
      const owes = [].concat(st.defers ?? []);
      if (!owes.length) {
        errors++;
        console.log(`  ${String(n).padStart(2)}. ✗ ${st.concept} is seeded but says nothing under defers:`);
        console.log(`         a seeded step must name the mechanism it is leaving for later`);
      } else {
        owes.forEach((d) => deferred.set(d, fm.title ?? fm.id));
        console.log(`  ${String(n).padStart(2)}.  ⊙ ${st.concept.padEnd(32)} ${c.topic}  — defers ${owes.join(", ")}`);
      }
      continue;
    }
    if (!c) {
      errors++;
      console.log(`  ${String(n).padStart(2)}. ✗ ${st.concept} — no such concept in any topic`);
      continue;
    }
    const unmet = (c.preAll ?? c.pre).filter((p) => !seen.has(p) && all[p]);
    seen.add(st.concept);
    if (!unmet.length) {
      const tag = st.kind === "delight" ? "  ✦" : "   ";
      console.log(`  ${String(n).padStart(2)}.${tag} ${st.concept.padEnd(32)} ${c.topic}`);
      continue;
    }
    errors++;
    const later = unmet.filter((p) => order.has(p));
    const never = unmet.filter((p) => !order.has(p));
    const why = [
      later.length ? `${later.join(", ")} — appears later, at step ${Math.min(...later.map((p) => order.get(p) + 1))}` : "",
      never.length ? `${never.join(", ")} — never appears in this chain` : "",
    ].filter(Boolean);
    console.log(`  ${String(n).padStart(2)}. ✗ ${st.concept}  needs:`);
    why.forEach((w) => console.log(`         ${w}`));
  }

  // rule 2: the spine must survive deleting every delight
  for (const st of steps) {
    if (st.kind === "delight") continue;
    const c = all[st.concept];
    if (!c) continue;
    const leaning = (c.preAll ?? c.pre).filter((p) => delights.has(p));
    if (leaning.length) {
      errors++;
      console.log(`  ✗ ${st.concept} is on the spine but needs ${leaning.join(", ")}, marked as a delight`);
      console.log(`      either promote those to the spine, or make this one a delight too`);
    }
  }
  // rule 2, across the chapter boundary
  const priorDelights = priorDelightsOf(b);
  for (const st of steps) {
    if (st.kind === "delight") continue;
    const c = all[st.concept];
    if (!c) continue;
    const leaning = (c.preAll ?? c.pre).filter((p) => priorDelights.has(p));
    if (leaning.length) {
      errors++;
      console.log(`  ✗ ${st.concept} is on the spine but needs ${leaning.join(", ")}, a delight in an earlier chapter`);
      console.log(`      a cuttable step cannot carry a later one: promote it there, or make this a delight too`);
    }
  }
  for (const s0 of fm.sets ?? []) {
    const kinds = (s0.steps ?? []).map((x) => x.kind ?? "spine");
    if (kinds.length > 2 && !kinds.includes("delight")) {
      warnings++;
      console.log(`  ! "${s0.title}" is all spine — no delight in ${kinds.length} steps`);
    }
  }
  const nd = steps.filter((s) => s.kind === "delight").length;
  const ns = steps.filter((s) => s.kind === "seeded").length;
  console.log(`  ${steps.length - nd - ns} spine, ${nd} delight${ns ? `, ${ns} seeded` : ""}`);
  if (at.has(b.id)) told.push({ no: chapterNo, title: fm.title ?? b.id, n: steps.length });

  // a chain that never leaves one topic is a textbook chapter, not a book
  const topics = new Set(steps.map((s) => all[s.concept]?.topic).filter(Boolean));
  if (topics.size < 2 && steps.length > 4) {
    warnings++;
    console.log(`  ! stays inside one topic (${[...topics]}) — a chain is meant to cross them`);
  }
  console.log(`  topics crossed: ${[...topics].join(" → ")}`);
}

if (BOOK) {
  const n = told.reduce((a, c) => a + c.n, 0);
  const [lo, hi] = BOOK.target.length === 2 ? BOOK.target : [null, null];
  console.log(`\n${BOOK.title} — ${told.length} chapters, ${n} stories${lo ? ` of ${lo}\u2013${hi}` : ""}`);
  told.sort((a, b) => a.no - b.no)
    .forEach((c) => console.log(`  ${String(c.no).padStart(2)}. ${c.title.padEnd(24)} ${String(c.n).padStart(3)} stories`));
  const outside = books.filter((b) => !at.has(b.id));
  if (outside.length)
    console.log(`  outside the book: ${outside.map((b) => `${b.fm.title ?? b.id} (${b.steps.length})`).join(", ")}`);
  if (lo && n < lo) console.log(`  ${lo - n} more stories to reach ${lo}. Chapter order lives in content/03 - chains/_book.yml.`);
}

if (deferred.size) {
  console.log(`\ndeferred mechanisms (${deferred.size})`);
  for (const [id, from] of deferred) {
    const paid = covered.has(id);
    if (!paid) warnings++;
    console.log(`  ${paid ? "✓ repaid" : "! owed  "}  ${id.padEnd(32)} borrowed by "${from}"`);
  }
  if ([...deferred.keys()].some((id) => !covered.has(id)))
    console.log(`  An owed mechanism is a promise to the reader. It needs a later chain, or the loan was a lie.`);
}

console.log(`\n${errors ? "✗" : "✓"} ${errors} ordering error${errors === 1 ? "" : "s"}, ${warnings} warning${warnings === 1 ? "" : "s"}`);
process.exit(errors ? 1 : 0);
