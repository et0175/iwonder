/**
 * Shared pieces for generated pages: escaping, markdown, URLs and the page shell.
 * Every link is root-absolute ("/concepts/space/tides/") so pages can live at
 * any depth; the site is always served from the domain root.
 */
import fs from "node:fs";
import crypto from "node:crypto";
import { marked } from "marked";

/** Changes whenever site.css does, so browsers never keep a stale stylesheet. */
const CSS_VERSION = crypto.createHash("sha1").update(fs.readFileSync("tools/templates/site.css")).digest("hex").slice(0, 10);

// breaks: a line break in the markdown is a line break on the page — dialogue is written one line per speaker
marked.setOptions({ gfm: true, breaks: true });

export const esc = (s) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Markdown → HTML. Content is our own, so it is trusted. */
export const md = (s) => (s && String(s).trim() ? marked.parse(String(s)) : "");
export const mdInline = (s) => (s && String(s).trim() ? marked.parseInline(String(s)) : "");

/** JSON that is safe to drop inside a <script> block. */
export const json = (v) => JSON.stringify(v).replace(/</g, "\\u003c");

export const url = {
  home: () => "/",
  characters: () => "/characters/",
  character: (id) => `/characters/${id}/`,
  concepts: () => "/concepts/",
  concept: (topic, id) => `/concepts/${topic}/${id}/`,
  atlas: (topic, id) => `/atlas/${topic}.html${id ? "#" + id : ""}`,
  questions: () => "/questions/",
  stories: () => "/stories/",
  story: (id, lang = "en") => (lang === "en" ? `/stories/${id}/` : `/stories/${id}/${lang}/`),
};

export const LANGS = { en: "English", uk: "Українська" };
export const AGE_BANDS = ["5-7", "8-10", "11-13"];

const NAV = [
  ["characters", "Characters", url.characters()],
  ["concepts", "Concepts", url.concepts()],
  ["atlas", "Graph", null], // filled in per build: first topic's atlas
  ["questions", "Questions", url.questions()],
  ["stories", "Stories", url.stories()],
];

export function nav(active, atlasHref) {
  const links = NAV.map(([key, label, href]) => {
    const h = href ?? atlasHref;
    return `<a href="${h}"${key === active ? ' aria-current="page"' : ""}>${label}</a>`;
  }).join("");
  return `<header class="topnav"><div class="in"><a class="brand" href="/">I Wonder</a><nav aria-label="Sections">${links}</nav></div></header>`;
}

const FONTS =
  '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,700;1,9..144,500&display=swap">';

export function page({ title, description = "", active = "", atlasHref = "/", body, script = "" }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
${description ? `<meta name="description" content="${esc(description)}">` : ""}
<meta name="robots" content="noindex">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>?</text></svg>">
${FONTS}
<link rel="stylesheet" href="/assets/site.css?v=${CSS_VERSION}">
</head>
<body>
${nav(active, atlasHref)}
<main class="wrap">
${body}
<footer class="site">Generated from <code>content/</code> by <code>npm run build</code>. Edit the markdown, not this page.</footer>
</main>
${script ? `<script>${script}</script>` : ""}
</body>
</html>
`;
}
