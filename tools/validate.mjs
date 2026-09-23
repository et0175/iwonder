#!/usr/bin/env node
/**
 * Checks every concept graph in content/concepts/.
 * Exits non-zero if anything is wrong, so CI blocks the push.
 *
 *   node tools/validate.mjs
 */
import { listTopics, loadTopic, graph, loadCharacters } from "./lib/load.mjs";

const REQUIRED = ["id", "short", "name", "dom", "see", "ask"];
const STATUSES = ["mapped", "drafted", "written", "retired"];
const LABEL = { short: "title", name: "proposition", dom: "domain", see: "What they can see", ask: "What they ask" };

let errors = 0;
let warnings = 0;
const implied = [];
const err = (m) => { errors++; console.error("  ✗ " + m); };
const warn = (m) => { warnings++; console.warn("  ! " + m); };

const topics = listTopics();
if (!topics.length) { console.error("No topics found under content/concepts/."); process.exit(1); }

for (const topic of topics) {
  console.log(`\n${topic}`);
  const { meta, concepts } = loadTopic(topic);
  const ids = new Set();

  for (const c of concepts) {
    const at = c.file;
    for (const f of REQUIRED) {
      if (!String(c[f] ?? "").trim()) err(`${at}: missing ${LABEL[f] ?? f}`);
    }
    if (ids.has(c.id)) err(`${at}: duplicate id "${c.id}"`);
    ids.add(c.id);
    if (!/^[a-z0-9-]+$/.test(c.id)) err(`${at}: id "${c.id}" must be lower-case kebab-case`);
    if (!c.file.endsWith(`/${c.id}.md`)) err(`${at}: filename does not match id "${c.id}"`);
    if (!STATUSES.includes(c.status)) err(`${at}: status "${c.status}" is not one of ${STATUSES.join(", ")}`);
    if (!c.next.length) warn(`${at}: no onward questions — every concept should open at least one door`);
    for (const [q, d] of c.next) {
      if (!String(q).trim()) err(`${at}: an entry under opens: has no question`);
      if (!String(d).trim() || d === "—") warn(`${at}: onward question "${q}" has no domain`);
    }
    if (c.status !== "mapped" && !c.experiment.trim()) {
      warn(`${at}: status is "${c.status}" but the experiment is empty`);
    }
  }

  // prerequisite references must resolve
  for (const c of concepts) {
    for (const p of c.pre) {
      if (!ids.has(p)) err(`${c.file}: prerequisite "${p}" does not exist in topic "${topic}"`);
      if (p === c.id) err(`${c.file}: is its own prerequisite`);
    }
    if (new Set(c.pre).size !== c.pre.length) err(`${c.file}: the same prerequisite is listed twice`);
  }

  // cycles + layers
  let g;
  try {
    g = graph(concepts);
  } catch (e) {
    err(`${topic}: ${e.message}`);
    continue;
  }

  // Transitively implied prerequisites: A lists B and C, but B already needs C.
  // NOT a warning — often deliberate, because an article can lean directly on a
  // concept its other prerequisite merely happens to imply. Reported for review.
  const ancestorsOf = (id, byId) => {
    const out = new Set(), stack = [...(byId[id]?.pre ?? [])];
    while (stack.length) {
      const x = stack.pop();
      if (out.has(x)) continue;
      out.add(x);
      (byId[x]?.pre ?? []).forEach((y) => stack.push(y));
    }
    return out;
  };
  for (const c of concepts) {
    if (c.impliedOk) continue;
    for (const p of c.pre) {
      const via = c.pre.filter((q) => q !== p).find((q) => ancestorsOf(q, g.byId).has(p));
      if (via) implied.push(`${c.id}: "${p}" already reachable via "${via}"`);
    }
  }

  // unreachable / dead-end reporting
  const roots = concepts.filter((c) => !c.pre.length);
  const leaves = concepts.filter((c) => !g.kids[c.id].length);
  if (!roots.length) err(`${topic}: no root concepts — the graph has no entry point`);
  if (meta.layers.length && meta.layers.length < g.maxL + 1) {
    warn(`${topic}: _topic.yml names ${meta.layers.length} layers but the graph is ${g.maxL + 1} deep`);
  }

  const deadEnds = leaves.filter((c) => c.status === "mapped");
  const byStatus = concepts.reduce((a, c) => ((a[c.status] = (a[c.status] || 0) + 1), a), {});
  const onward = concepts.flatMap((c) => c.next);
  console.log(
    `  ${concepts.length} concepts · ${g.maxL + 1} layers · ${roots.length} roots · ${leaves.length} leaves`
  );
  console.log(
    `  ${onward.length} onward questions, ${onward.filter((q) => q[1] !== meta.title).length} leaving ${meta.title}`
  );
  console.log(`  status: ${Object.entries(byStatus).map(([k, v]) => `${v} ${k}`).join(", ")}`);
  if (deadEnds.length) {
    console.log(`  ${deadEnds.length} concepts nothing else depends on yet — the frontier of the map`);
  }
}

if (implied.length) {
  console.log(`\ntransitively implied prerequisites (${implied.length})`);
  console.log("  Listed for review, not a problem. A concept may lean directly on");
  console.log("  something another of its prerequisites already implies. Set");
  console.log("  `implied_ok: true` in the frontmatter to stop listing a file.");
  implied.forEach((m) => console.log("  · " + m));
}

// characters
const cast = loadCharacters();
console.log(`\ncharacters`);
console.log(`  ${cast.length} in the cast`);
for (const ch of cast) {
  if (!ch.name) err(`${ch.file}: missing name`);
  if (!ch.role) warn(`${ch.file}: missing role — what is this character FOR?`);
}

console.log(
  `\n${errors ? "✗" : "✓"} ${errors} error${errors === 1 ? "" : "s"}, ${warnings} warning${warnings === 1 ? "" : "s"}`
);
process.exit(errors ? 1 : 0);
