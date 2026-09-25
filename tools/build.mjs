#!/usr/bin/env node
/**
 * Generates the website into site/ :
 *   site/index.html          the project hub
 *   site/atlas/<topic>.html  one interactive prerequisite map per topic
 *   site/data/<topic>.json   the same graph as plain data
 *
 *   node tools/build.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { listTopics, loadTopic, graph, loadCharacters } from "./lib/load.mjs";

const OUT = "site";
const TPL = fs.readFileSync("tools/templates/atlas.html", "utf8");
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, "atlas"), { recursive: true });
fs.mkdirSync(path.join(OUT, "data"), { recursive: true });

const summaries = [];

for (const topic of listTopics()) {
  const { meta, concepts } = loadTopic(topic);
  const g = graph(concepts);

  const data = concepts.map((c) => ({
    id: c.id, dom: c.dom, short: c.short, name: c.name,
    see: c.see, ask: c.ask, pre: c.pre, next: c.next,
    ...(c.note ? { note: c.note } : {}),
  }));

  const layers = meta.layers.length
    ? meta.layers.concat(Array.from({ length: Math.max(0, g.maxL + 1 - meta.layers.length) }, (_, i) => `Layer ${meta.layers.length + i}`))
    : Array.from({ length: g.maxL + 1 }, (_, i) => `Layer ${i}`);

  // Open on the concept the rest of the graph leans on most — the one with the
  // largest descendant set. Override with `start:` in _topic.yml.
  const descendantCount = (id) => {
    const seen = new Set(), stack = [...g.kids[id]];
    while (stack.length) { const x = stack.pop(); if (seen.has(x)) continue; seen.add(x); g.kids[x].forEach((y) => stack.push(y)); }
    return seen.size;
  };
  const start =
    meta.start ??
    concepts.slice().sort((a, b) => descendantCount(b.id) - descendantCount(a.id) || a.layer - b.layer)[0].id;
  const onward = concepts.flatMap((c) => c.next);
  const deck =
    meta.deck ??
    `${concepts.length} concepts for the ${meta.title} branch, arranged by what has to be understood <b>first</b>. Each one is named by its idea, not its title — the child meets it as something they can see, and a question they already want to ask. Columns are prerequisite depth: nothing in a column can be attempted until its lines to the left are in place.`;

  const html = TPL
    .replaceAll("__TITLE__", esc(`${meta.title} — I Wonder`))
    .replaceAll("__EYEBROW__", esc(`I Wonder · concept atlas · ${meta.title.toLowerCase()} · ages ${meta.ages ?? "—"}`))
    .replaceAll("__H1__", esc(meta.title + " Atlas"))
    .replaceAll("__DECK__", deck)
    .replaceAll("__DECKPLAIN__", esc(deck.replace(/<[^>]+>/g, "")))
    .replaceAll("__DATA__", JSON.stringify(data))
    .replaceAll("__LAYERS__", JSON.stringify(layers))
    .replaceAll("__START__", JSON.stringify(start));

  fs.writeFileSync(path.join(OUT, "atlas", `${topic}.html`), html);
  fs.writeFileSync(
    path.join(OUT, "data", `${topic}.json`),
    JSON.stringify({ meta, concepts: data }, null, 2)
  );

  summaries.push({
    topic, title: meta.title, ages: meta.ages ?? "—",
    count: concepts.length, layers: g.maxL + 1,
    roots: concepts.filter((c) => !c.pre.length).length,
    onward: onward.length,
    out: onward.filter((q) => q[1] !== meta.title).length,
    written: concepts.filter((c) => c.status === "written").length,
    drafted: concepts.filter((c) => c.status === "drafted").length,
  });
}

const cast = loadCharacters();
const hub = fs.readFileSync("tools/templates/hub.html", "utf8")
  .replaceAll("__TOPICS__", JSON.stringify(summaries))
  .replaceAll("__CAST__", JSON.stringify(cast.map((c) => ({
    name: c.name?.en ?? c.name, role: c.role ?? "", age: c.age ?? "", asks: c.asks ?? "",
    blurb: c.one_line ?? c.archetype ?? "",
  }))));
fs.writeFileSync(path.join(OUT, "index.html"), hub);

console.log(`built ${OUT}/`);
summaries.forEach((s) =>
  console.log(`  ${s.title.padEnd(14)} ${String(s.count).padStart(3)} concepts, ${s.layers} layers → atlas/${s.topic}.html`)
);
console.log(`  hub with ${cast.length} characters → index.html`);
