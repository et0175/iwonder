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
 *   3. A step marked `kind: seeded` establishes a conclusion without its
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
import { CONTENT, listTopics, loadTopic, splitFrontmatter, stripOrder } from "./lib/load.mjs";

const dir = fs.readdirSync(CONTENT, { withFileTypes: true })
  .find((d) => d.isDirectory() && stripOrder(d.name) === "chains");
if (!dir) { console.log("No chains folder yet."); process.exit(0); }
const CHAINS = path.join(CONTENT, dir.name);

const all = {};
for (const t of listTopics()) for (const c of loadTopic(t).concepts) all[c.id] = c;

let errors = 0, warnings = 0;
const deferred = new Map();   // concept id → the chain that owes it
const covered = new Set();    // every concept any chain actually explains

for (const f of fs.readdirSync(CHAINS).filter((f) => f.endsWith(".md") && !f.startsWith("_")).sort()) {
  const where = path.join(CHAINS, f);
  const [fm] = splitFrontmatter(fs.readFileSync(where, "utf8"), where);
  const steps = (fm.sets ?? []).flatMap((s) => (s.steps ?? []).map((st) => ({ kind: "spine", ...st, set: s.title })));
  const delights = new Set(steps.filter((s) => s.kind === "delight").map((s) => s.concept));
  console.log(`\n${fm.title ?? fm.id} — ${(fm.sets ?? []).length} sets, ${steps.length} steps`);

  for (const st of steps) if (st.kind !== "seeded") covered.add(st.concept);
  const seen = new Set();
  const order = new Map(steps.map((s, i) => [s.concept, i]));
  let n = 0, setNow = null;

  for (const st of steps) {
    n++;
    if (st.set !== setNow) { setNow = st.set; console.log(`  ── ${setNow}`); }
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

  // a chain that never leaves one topic is a textbook chapter, not a book
  const topics = new Set(steps.map((s) => all[s.concept]?.topic).filter(Boolean));
  if (topics.size < 2 && steps.length > 4) {
    warnings++;
    console.log(`  ! stays inside one topic (${[...topics]}) — a chain is meant to cross them`);
  }
  console.log(`  topics crossed: ${[...topics].join(" → ")}`);
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
