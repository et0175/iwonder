#!/usr/bin/env node
/**
 * Proposes a prerequisite-closed selection of concepts for one book.
 *
 *   node tools/select.mjs [per-topic budget]
 *
 * Nothing is chosen for being interesting — the score is how much of the rest
 * of the map leans on it. Cost is how many unmet prerequisites it drags in.
 * A concept nothing depends on is a leaf: lovely, but it waits for book two.
 */
import { listTopics, loadTopic } from "./lib/load.mjs";

const BUDGET = Number(process.argv[2] || 13);
const all = {};
const order = [];
for (const t of listTopics()) for (const c of loadTopic(t).concepts) { all[c.id] = c; order.push(c.id); }

const preOf = (id) => (all[id]?.preAll ?? []).filter((p) => all[p]);
const closure = (id, have) => {               // everything that must come with it
  const need = new Set(), stack = [id];
  while (stack.length) { const x = stack.pop();
    if (have.has(x) || need.has(x)) continue;
    need.add(x); preOf(x).forEach((p) => stack.push(p)); }
  return need;
};
const descendants = {};
for (const id of order) descendants[id] = 0;
for (const id of order) for (const a of closure(id, new Set()).values()) if (a !== id) descendants[a]++;

const chosen = new Set();
const perTopic = Object.fromEntries(listTopics().map((t) => [t, 0]));

for (;;) {
  let best = null;
  for (const id of order) {
    if (chosen.has(id)) continue;
    const need = closure(id, chosen);
    // adding this must not blow any topic's budget
    const add = {};
    for (const n of need) add[all[n].topic] = (add[all[n].topic] ?? 0) + 1;
    if (Object.entries(add).some(([t, k]) => perTopic[t] + k > BUDGET)) continue;
    const value = [...need].reduce((s, n) => s + descendants[n] + 1, 0) / need.size;
    if (!best || value > best.value) best = { id, need, add, value };
  }
  if (!best) break;
  best.need.forEach((n) => chosen.add(n));
  for (const [t, k] of Object.entries(best.add)) perTopic[t] += k;
}

// topological order inside the selection
const out = [], done = new Set();
const visit = (id) => { if (done.has(id)) return; done.add(id);
  preOf(id).filter((p) => chosen.has(p)).forEach(visit); out.push(id); };
order.filter((id) => chosen.has(id)).forEach(visit);

console.log(`Selection: ${chosen.size} concepts, budget ${BUDGET} per topic\n`);
let topicNow = null;
for (const id of out) {
  const c = all[id];
  if (c.topic !== topicNow) { topicNow = c.topic; console.log(`── ${topicNow} (${perTopic[topicNow]})`); }
  console.log(`   ${String(descendants[id]).padStart(3)}  ${id.padEnd(34)} ${c.ask || ""}`);
}
// The greedy pass optimises for load-bearing, which systematically excludes
// the leaves — and the leaves are where the delight is. These cost nothing:
// every prerequisite they need is already in the selection.
const free = order.filter((id) => !chosen.has(id) && preOf(id).every((p) => chosen.has(p)));
console.log(`\nfree to add — prerequisites already covered (${free.length}):`);
let tn = null;
for (const id of free.sort((a, b) => all[a].topic.localeCompare(all[b].topic))) {
  if (all[id].topic !== tn) { tn = all[id].topic; console.log(`── ${tn}`); }
  console.log(`   ${id.padEnd(34)} ${all[id].ask || ""}`);
}

console.log(`\nstill out of reach, highest load-bearing first:`);
order.filter((id) => !chosen.has(id) && !free.includes(id))
  .sort((a, b) => descendants[b] - descendants[a]).slice(0, 8)
  .forEach((id) => console.log(`   ${String(descendants[id]).padStart(3)}  ${id.padEnd(34)} needs ${preOf(id).filter((p) => !chosen.has(p)).join(", ")}`));
