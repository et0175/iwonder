import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

export const CONTENT = "content";

/**
 * Folders and files may carry an ordering prefix so they sort nicely in
 * Obsidian — `01 - characters`, `01 space`, `02 professor-ada.md`. The prefix
 * is never part of the name the site uses.
 */
export const stripOrder = (name) => name.replace(/^\d+(\s*-\s*|\s+)/, "");

/** Find `<parent>/<name>` whether or not the folder has an ordering prefix. */
function findDir(parent, name) {
  if (!fs.existsSync(parent)) return null;
  const hit = fs
    .readdirSync(parent, { withFileTypes: true })
    .find((d) => d.isDirectory() && stripOrder(d.name) === name);
  return hit ? path.join(parent, hit.name) : null;
}

export const CONCEPTS = findDir(CONTENT, "concepts");
export const CHARACTERS = findDir(CONTENT, "characters");

/** Topic name → its folder, e.g. "space" → "content/02 - concepts/01 space". */
function topicDirs() {
  if (!CONCEPTS) return {};
  return Object.fromEntries(
    fs
      .readdirSync(CONCEPTS, { withFileTypes: true })
      .filter((d) => d.isDirectory() && !stripOrder(d.name).startsWith("_"))
      .map((d) => [stripOrder(d.name), path.join(CONCEPTS, d.name)])
  );
}

/** Split `---\nyaml\n---\nbody` into [frontmatter, body]. */
export function splitFrontmatter(raw, where) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error(`${where}: no YAML frontmatter block at the top of the file`);
  let fm;
  try {
    fm = yaml.load(m[1]) || {};
  } catch (e) {
    throw new Error(`${where}: frontmatter is not valid YAML — ${e.message}`);
  }
  return [fm, m[2]];
}

/** Pull `## Heading` sections out of a markdown body into { heading: text }. */
export function sections(body) {
  const out = {};
  const parts = body.split(/^##\s+/m).slice(1);
  for (const p of parts) {
    const nl = p.indexOf("\n");
    const head = (nl === -1 ? p : p.slice(0, nl)).trim().toLowerCase();
    out[head] = (nl === -1 ? "" : p.slice(nl + 1)).trim();
  }
  return out;
}

const unwiki = (s) => String(s).replace(/^\[\[|\]\]$/g, "").trim();
const unquote = (s) => s.replace(/^>\s?/gm, "").trim();
/** `_Not written yet._` and friends mean the section is empty. */
const placeholder = (s) => (/^_?(not (yet )?(written|flagged)|nothing flagged)[^]*_?$/i.test(s.trim()) ? "" : s);
/** `ages: 5-7` or `ages: [5-7, 8-10]` → ["5-7", "8-10"]. */
export const ageList = (a) => (a == null || a === "" ? [] : [].concat(a).map(String));

export function listTopics() {
  return Object.keys(topicDirs()).sort();
}

/** Load one topic: its meta plus every concept file in it. */
export function loadTopic(topic) {
  const dir = topicDirs()[topic];
  const metaPath = path.join(dir, "_topic.yml");
  const meta = fs.existsSync(metaPath)
    ? yaml.load(fs.readFileSync(metaPath, "utf8")) || {}
    : {};
  meta.topic ??= topic;
  meta.title ??= topic[0].toUpperCase() + topic.slice(1);
  meta.layers ??= [];

  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .sort();

  const concepts = files.map((f) => {
    const where = path.join(dir, f);
    const [fm, body] = splitFrontmatter(fs.readFileSync(where, "utf8"), where);
    const s = sections(body);
    return {
      file: where,
      id: fm.id ?? path.basename(f, ".md"),
      dom: fm.domain ?? "—",
      short: fm.title ?? "",
      name: fm.proposition ?? fm.title ?? "",
      status: fm.status ?? "mapped",
      impliedOk: fm.implied_ok === true,
      topic: meta.topic,
      ages: ageList(fm.ages ?? meta.ages),
      see: s["what they can see"] ?? "",
      ask: unquote(s["what they ask"] ?? ""),
      experiment: placeholder(s["the experiment"] ?? ""),
      hook: placeholder(s["memory hook"] ?? ""),
      note: placeholder(s["watch out"] ?? ""),
      pre: (fm.prerequisites ?? []).map(unwiki),
      next: (fm.opens ?? []).map((o) =>
        typeof o === "string" ? [o, "Space"] : [o.question, o.domain ?? "—"]
      ),
      opens: (fm.opens ?? []).map((o) =>
        typeof o === "string"
          ? { question: o, domain: "—", leadsTo: null }
          : { question: o.question, domain: o.domain ?? "—", leadsTo: o.leads_to ? unwiki(o.leads_to) : null }
      ),
    };
  });

  return { meta, concepts };
}

/** Layer depth, children, and a crossing-reduced order per layer. */
export function graph(concepts) {
  const byId = Object.fromEntries(concepts.map((n) => [n.id, n]));
  const memo = new Map();
  const layer = (id, seen = new Set()) => {
    if (memo.has(id)) return memo.get(id);
    if (seen.has(id)) throw new Error(`circular prerequisite chain through "${id}"`);
    seen.add(id);
    const n = byId[id];
    const v = !n || !n.pre.length
      ? 0
      : 1 + Math.max(...n.pre.map((p) => (byId[p] ? layer(p, new Set(seen)) : -1)));
    memo.set(id, v);
    return v;
  };
  concepts.forEach((n) => (n.layer = layer(n.id)));

  const kids = Object.fromEntries(concepts.map((n) => [n.id, []]));
  concepts.forEach((n) => n.pre.forEach((p) => kids[p]?.push(n.id)));

  const maxL = Math.max(0, ...concepts.map((n) => n.layer));
  const cols = Array.from({ length: maxL + 1 }, (_, i) =>
    concepts.filter((n) => n.layer === i)
  );
  const pos = {};
  cols[0]?.forEach((n, i) => (pos[n.id] = i));
  for (let L = 1; L <= maxL; L++) {
    const bary = (n) =>
      n.pre.length ? n.pre.reduce((s, p) => s + (pos[p] ?? 0), 0) / n.pre.length : 99;
    cols[L].sort((a, b) => bary(a) - bary(b) || a.short.localeCompare(b.short));
    cols[L].forEach((n, i) => (pos[n.id] = i));
  }
  cols.forEach((c, L) =>
    c.forEach((n, i) => (n.cat = L + "·" + String(i + 1).padStart(2, "0")))
  );

  return { byId, kids, cols, maxL };
}

export function loadCharacters() {
  const dir = CHARACTERS;
  if (!dir) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && !stripOrder(f).startsWith("_") && f !== "README.md")
    .sort()
    .map((f) => {
      const where = path.join(dir, f);
      const [fm, body] = splitFrontmatter(fs.readFileSync(where, "utf8"), where);
      return { file: where, dir, slug: stripOrder(path.basename(f, ".md")), ...fm, body, sections: sections(body) };
    });
}

/**
 * Split a markdown body into `## sections`, each with its `### subsections`.
 * Text before the first `##` is dropped (it is the `# Title`).
 */
export function outline(body) {
  return body.split(/^##(?!#)\s*/m).slice(1).map((part) => {
    const nl = part.indexOf("\n");
    const title = (nl === -1 ? part : part.slice(0, nl)).trim().replace(/:$/, "");
    const text = nl === -1 ? "" : part.slice(nl + 1);
    const [intro, ...rest] = text.split(/^###\s*/m);
    const subs = rest.map((p) => {
      const i = p.indexOf("\n");
      return { title: (i === -1 ? p : p.slice(0, i)).trim(), text: (i === -1 ? "" : p.slice(i + 1)).trim() };
    });
    return { title, text: text.trim(), intro: intro.trim(), subs };
  });
}

/**
 * Stories: `content/stories/<file>.md` or `content/stories/<id>/<lang>.md`.
 * Every file carries `id` and `lang`; files with the same id are translations
 * of one story. Structure (concepts, ages, characters) comes from the English
 * file, and a translation may override only its own wording.
 */
export function loadStories() {
  const dir = path.join(CONTENT, "stories");
  if (!fs.existsSync(dir)) return [];
  const files = [];
  const walk = (d) =>
    fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".md") && !stripOrder(e.name).startsWith("_") && e.name !== "README.md") files.push(p);
    });
  walk(dir);

  const byId = new Map();
  for (const where of files.sort()) {
    const [fm, body] = splitFrontmatter(fs.readFileSync(where, "utf8"), where);
    const id = fm.id ?? stripOrder(path.basename(where, ".md"));
    if (!byId.has(id)) byId.set(id, { id, versions: {}, files: [] });
    const story = byId.get(id);
    story.files.push({ file: where, lang: fm.lang });
    story.versions[fm.lang ?? "en"] ??= {
      file: where,
      lang: fm.lang ?? "en",
      title: fm.title ?? id,
      question: fm.question ?? "",
      memoryHook: fm.memory_hook ?? "",
      bridge: fm.bridge ?? "",
      status: fm.status ?? "draft",
      // the body without its leading `# Title`
      body: body.replace(/^\s*#\s+.*\n/, "").trim(),
      fm,
    };
  }

  return [...byId.values()].map((s) => {
    const base = (s.versions.en ?? Object.values(s.versions)[0]).fm;
    return {
      ...s,
      order: path.basename(s.files[0].file),
      concepts: [].concat(base.concepts ?? []).map(unwiki),
      ages: ageList(base.ages),
      characters: [].concat(base.characters ?? []).map(unwiki),
      bridgeTo: base.bridge_to ? unwiki(base.bridge_to) : null,
    };
  }).sort((a, b) => a.order.localeCompare(b.order));
}
