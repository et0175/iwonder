#!/usr/bin/env node
/**
 * Generates the blueprint website into site/ from content/:
 *
 *   site/index.html                      the hub
 *   site/characters/[<id>/]index.html    cast cards and one screen per character
 *   site/concepts/[<topic>/<id>/]        concept cards and one page per concept
 *   site/atlas/<topic>.html              the interactive prerequisite graph
 *   site/questions/index.html            every question, asked and onward
 *   site/stories/<id>/[<lang>/]          story list and a reader per language
 *   site/data/<topic>.json               the graph as plain data
 *
 *   node tools/build.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { listTopics, loadTopic, graph, loadCharacters, loadStories, CHARACTERS } from "./lib/load.mjs";
import { esc, url, nav } from "./lib/site.mjs";
import * as P from "./lib/pages.mjs";

const OUT = "site";
const TPL = fs.readFileSync("tools/templates/atlas.html", "utf8");

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, "atlas"), { recursive: true });
fs.mkdirSync(path.join(OUT, "data"), { recursive: true });
fs.mkdirSync(path.join(OUT, "assets", "characters"), { recursive: true });
fs.copyFileSync("tools/templates/site.css", path.join(OUT, "assets", "site.css"));

/** Write `html` to site/<route>index.html (routes end in "/") or site/<route>. */
const write = (route, html) => {
  const file = path.join(OUT, route.endsWith("/") ? route + "index.html" : route);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
};

/* ---------- load everything into one model ---------- */

const topics = listTopics().map((topic) => {
  const { meta, concepts } = loadTopic(topic);
  const g = graph(concepts);
  const layers = Array.from({ length: g.maxL + 1 }, (_, i) => meta.layers[i] ?? `Layer ${i}`);
  const descendants = (id) => {
    const seen = new Set(), stack = [...g.kids[id]];
    while (stack.length) { const x = stack.pop(); if (seen.has(x)) continue; seen.add(x); g.kids[x].forEach((y) => stack.push(y)); }
    return seen.size;
  };
  concepts.forEach((c) => {
    c.topicTitle = meta.title;
    c.layerName = layers[c.layer];
    c.kids = g.kids[c.id];
    c.descendants = descendants(c.id);
  });
  return { meta, concepts, g, layers, maxL: g.maxL };
});

const concepts = topics.flatMap((t) => t.concepts);
const conceptById = new Map();
concepts.forEach((c) => { if (!conceptById.has(c.id)) conceptById.set(c.id, c); });

const characters = loadCharacters();
for (const c of characters) {
  if (!c.image) continue;
  const src = path.join(c.dir, c.image);
  if (!fs.existsSync(src)) { console.warn(`  ! ${c.file}: image ${c.image} not found`); continue; }
  const name = c.id + path.extname(src);
  fs.copyFileSync(src, path.join(OUT, "assets", "characters", name));
  c.imageUrl = `/assets/characters/${name}`;
}
const castSrc = CHARACTERS && ["png", "jpg", "webp"].map((e) => path.join(CHARACTERS, "images", "cast." + e)).find(fs.existsSync);
if (castSrc) fs.copyFileSync(castSrc, path.join(OUT, "assets", "cast" + path.extname(castSrc)));

const stories = loadStories();
const storiesByConcept = new Map();
stories.forEach((s) => s.concepts.forEach((id) => {
  if (!storiesByConcept.has(id)) storiesByConcept.set(id, []);
  storiesByConcept.get(id).push(s);
}));

// Questions are never authored on their own: a concept's question, plus
// every onward question it opens.
const questions = concepts.flatMap((c) => [
  ...(c.ask ? [{ kind: "asks", question: c.ask, see: c.see, domain: c.dom, topicTitle: c.topicTitle, ages: c.ages, target: c }] : []),
  ...c.opens.map((o) => ({
    kind: "opens", question: o.question, domain: o.domain, topicTitle: c.topicTitle, ages: c.ages, from: c,
    target: o.leadsTo ? conceptById.get(o.leadsTo) ?? null : null,
  })),
]);

const db = {
  topics, concepts, conceptById, characters, stories, storiesByConcept, questions,
  charById: new Map(characters.map((c) => [c.id, c])),
  conceptIn: (topic, id) => topics.find((t) => t.meta.topic === topic)?.g.byId[id],
  castImage: castSrc ? "/assets/cast" + path.extname(castSrc) : null,
  atlasHref: topics.length ? url.atlas(topics[0].meta.topic) : "/",
};

/* ---------- atlas: one interactive graph per topic ---------- */

const NAV_CSS = fs.readFileSync("tools/templates/site.css", "utf8").match(/\/\* -+ top navigation[\s\S]*?(?=\/\* -+ page heads)/)[0];

for (const t of topics) {
  const { meta, concepts: cs, g, layers } = t;
  const data = cs.map((c) => ({
    id: c.id, dom: c.dom, short: c.short, name: c.name,
    see: c.see, ask: c.ask, pre: c.pre, next: c.next,
    ...(c.note ? { note: c.note } : {}),
  }));
  // Open on the concept the rest of the graph leans on most. Override with `start:`.
  const start = meta.start ?? cs.slice().sort((a, b) => b.descendants - a.descendants || a.layer - b.layer)[0].id;
  const deck =
    meta.deck ??
    `${cs.length} concepts for the ${meta.title} branch, arranged by what has to be understood <b>first</b>. Each one is named by its idea, not its title — the child meets it as something they can see, and a question they already want to ask. Columns are prerequisite depth: nothing in a column can be attempted until its lines to the left are in place.`;

  const html = TPL
    .replaceAll("__TITLE__", esc(`${meta.title} — I Wonder`))
    .replaceAll("__EYEBROW__", esc(`I Wonder · concept atlas · ${meta.title.toLowerCase()} · ages ${meta.ages ?? "—"}`))
    .replaceAll("__H1__", esc(meta.title + " Atlas"))
    .replaceAll("__DECK__", deck)
    .replaceAll("__DECKPLAIN__", esc(deck.replace(/<[^>]+>/g, "")))
    .replaceAll("__DATA__", JSON.stringify(data))
    .replaceAll("__LAYERS__", JSON.stringify(layers))
    .replaceAll("__START__", JSON.stringify(start))
    .replaceAll("__TOPIC__", JSON.stringify(meta.topic))
    .replace("</style>", NAV_CSS + ".topnav{position:relative}.topnav .in{max-width:1560px}\n</style>")
    .replace("<body>", "<body>\n" + nav("atlas", db.atlasHref));

  write(`atlas/${meta.topic}.html`, html);
  fs.writeFileSync(path.join(OUT, "data", `${meta.topic}.json`), JSON.stringify({ meta, concepts: data }, null, 2));
}

/* ---------- pages ---------- */

write("/", P.hubPage(db));
write("characters/", P.charactersPage(db));
characters.forEach((c) => write(`characters/${c.id}/`, P.characterPage(db, c)));
write("concepts/", P.conceptsPage(db));
concepts.forEach((c) => write(`concepts/${c.topic}/${c.id}/`, P.conceptPage(db, c)));
write("questions/", P.questionsPage(db));
write("stories/", P.storiesPage(db));
stories.forEach((s, i) => {
  for (const lang of Object.keys(s.versions)) write(url.story(s.id, lang), P.storyPage(db, s, lang, i));
  // a story with no English version still needs a page at its plain URL
  if (!s.versions.en) write(url.story(s.id), P.storyPage(db, s, Object.keys(s.versions)[0], i));
});

console.log(`built ${OUT}/`);
topics.forEach((t) => console.log(`  ${t.meta.title.padEnd(14)} ${String(t.concepts.length).padStart(3)} concepts, ${t.maxL + 1} layers → atlas/${t.meta.topic}.html`));
console.log(`  ${characters.length} characters · ${concepts.length} concept pages · ${questions.length} questions · ${stories.length} stories`);
