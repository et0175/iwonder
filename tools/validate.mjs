#!/usr/bin/env node
/**
 * Checks every concept graph in content/02 - concepts/.
 * Exits non-zero if anything is wrong, so CI blocks the push.
 *
 *   node tools/validate.mjs
 */
import { listTopics, loadTopic, graph, loadCharacters, loadStories } from "./lib/load.mjs";

const REQUIRED = ["id", "short", "name", "dom", "see", "ask"];
const STATUSES = ["mapped", "drafted", "written", "retired"];
const LABEL = { short: "title", name: "proposition", dom: "domain", see: "What they can see", ask: "What they ask" };

let errors = 0;
let warnings = 0;
const implied = [];
const err = (m) => { errors++; console.error("  ✗ " + m); };
const warn = (m) => { warnings++; console.warn("  ! " + m); };

const topics = listTopics();
const allConcepts = new Map(); // id → topic, across every topic
if (!topics.length) { console.error("No topics found — expected content/[NN - ]concepts/<topic>/."); process.exit(1); }

// Load every topic up front: prerequisites may point across topics, and a
// reference forward to a topic not yet read must still resolve.
const loaded = topics.map((t) => ({ topic: t, ...loadTopic(t) }));
const globalById = new Map();
for (const L of loaded) for (const c of L.concepts) {
  const clash = globalById.get(c.id);
  if (clash) err(`${c.file}: id "${c.id}" is also used in topic "${clash.topic}" — ids must be unique across all topics`);
  globalById.set(c.id, c);
  allConcepts.set(c.id, L.topic);
}

for (const { topic, meta, concepts } of loaded) {
  console.log(`\n${topic}`);
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
    if (new Set(c.preAll).size !== c.preAll.length) err(`${c.file}: the same prerequisite is listed twice`);
    for (const r of c.preExt) {
      const target = globalById.get(r.id);
      if (!target) err(`${c.file}: prerequisite "${r.topic}/${r.id}" does not exist in any topic`);
      else if (target.topic !== r.topic) err(`${c.file}: prerequisite "${r.topic}/${r.id}" actually lives in topic "${target.topic}"`);
    }
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
    `  ${onward.length} onward questions, ${onward.filter((q) => !(meta.domains ?? [meta.title]).includes(q[1])).length} leaving ${meta.title}`
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

// A cycle can now span topics, which per-topic layering cannot see.
{
  const state = new Map();
  const walk = (id, trail) => {
    if (state.get(id) === "done") return;
    if (state.get(id) === "open") {
      err(`circular prerequisite chain across topics: ${trail.slice(trail.indexOf(id)).concat(id).join(" → ")}`);
      return;
    }
    state.set(id, "open");
    for (const p of globalById.get(id)?.preAll ?? []) if (globalById.has(p)) walk(p, trail.concat(id));
    state.set(id, "done");
  };
  for (const id of globalById.keys()) walk(id, []);
}

// characters
const cast = loadCharacters();
console.log(`\ncharacters`);
console.log(`  ${cast.length} in the cast`);
const castIds = new Set();
for (const ch of cast) {
  if (!ch.id) err(`${ch.file}: missing id`);
  else {
    if (!/^[a-z0-9-]+$/.test(ch.id)) err(`${ch.file}: id "${ch.id}" must be lower-case kebab-case`);
    if (ch.slug !== ch.id) err(`${ch.file}: filename does not match id "${ch.id}"`);
    if (castIds.has(ch.id)) err(`${ch.file}: duplicate id "${ch.id}"`);
    castIds.add(ch.id);
  }
  if (!ch.name?.en) err(`${ch.file}: missing name.en`);
  if (!ch.name?.uk) warn(`${ch.file}: missing name.uk`);
  if (!ch.role) warn(`${ch.file}: missing role — what is this character FOR?`);
}

// onward questions that name the concept answering them
for (const topic of topics) {
  for (const c of loadTopic(topic).concepts) {
    for (const o of c.opens) {
      if (o.leadsTo && !allConcepts.has(o.leadsTo)) err(`${c.file}: leads_to "${o.leadsTo}" does not exist`);
    }
  }
}

// relationships between characters
for (const ch of cast) {
  for (const r of [].concat(ch.relationships ?? [])) {
    if (r?.with && !castIds.has(r.with)) err(`${ch.file}: relationship with "${r.with}", who is not in the cast`);
  }
}

// stories
const LANGS = ["en", "uk"];
const stories = loadStories();
console.log(`\nstories`);
console.log(`  ${stories.length} stories, ${stories.filter((s) => LANGS.every((l) => s.versions[l])).length} in both languages`);
for (const st of stories) {
  const at = st.files[0].file;
  if (!/^[a-z0-9-]+$/.test(st.id)) err(`${at}: id "${st.id}" must be lower-case kebab-case`);
  const seen = new Set();
  for (const f of st.files) {
    if (!f.lang) err(`${f.file}: missing lang (one of ${LANGS.join(", ")})`);
    else if (!LANGS.includes(f.lang)) err(`${f.file}: lang "${f.lang}" is not one of ${LANGS.join(", ")}`);
    if (seen.has(f.lang)) err(`${f.file}: a second "${f.lang}" version of story "${st.id}"`);
    seen.add(f.lang);
  }
  if (!st.concepts.length) warn(`${at}: not linked to any concept`);
  for (const c of st.concepts) if (!allConcepts.has(c)) err(`${at}: concept "${c}" does not exist`);
  for (const c of st.characters) if (!castIds.has(c)) err(`${at}: character "${c}" is not in the cast`);
  if (st.bridgeTo && !allConcepts.has(st.bridgeTo)) err(`${at}: bridge_to "${st.bridgeTo}" does not exist`);
  const missingLangs = LANGS.filter((l) => !st.versions[l]);
  if (missingLangs.length) warn(`${at}: no ${missingLangs.join(", ")} version yet`);
}

console.log(
  `\n${errors ? "✗" : "✓"} ${errors} error${errors === 1 ? "" : "s"}, ${warnings} warning${warnings === 1 ? "" : "s"}`
);
process.exit(errors ? 1 : 0);
