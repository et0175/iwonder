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
      ages: fm.ages ?? meta.ages ?? "",
      see: s["what they can see"] ?? "",
      ask: unquote(s["what they ask"] ?? ""),
      experiment: s["the experiment"] ?? "",
      note: /not (yet )?(written|flagged)/i.test(s["watch out"] ?? "")
        ? ""
        : s["watch out"] ?? "",
      pre: (fm.prerequisites ?? []).map(unwiki),
      next: (fm.opens ?? []).map((o) =>
        typeof o === "string" ? [o, "Space"] : [o.question, o.domain ?? "—"]
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
      return { file: where, slug: stripOrder(path.basename(f, ".md")), ...fm, sections: sections(body) };
    });
}
