/**
 * One function per kind of page. Each takes the loaded content (`db`, built in
 * tools/build.mjs) and returns a full HTML string.
 */
import { outline } from "./load.mjs";
import { esc, md, mdInline, json, url, page, LANGS, AGE_BANDS } from "./site.mjs";

const nameOf = (c) => c.name?.en ?? c.name ?? c.id;
const initial = (c) => esc(nameOf(c)[0] ?? "?");
const portrait = (c, cls = "portrait") =>
  c.imageUrl
    ? `<img class="${cls}" src="${c.imageUrl}" alt="${esc(nameOf(c))}" loading="lazy">`
    : `<div class="${cls} blank" aria-hidden="true">${initial(c)}</div>`;
const missing = (what) => `<div class="missing">${what}</div>`;
const statusBadge = (s) => `<span class="badge ${esc(s)}">${esc(s)}</span>`;
const conceptChip = (c) => `<a class="chip" href="${url.concept(c.topic, c.id)}">${esc(c.short)}</a>`;
const characterChip = (c) =>
  `<a class="chip" href="${url.character(c.id)}">${c.imageUrl ? `<img src="${c.imageUrl}" alt="">` : ""}${esc(nameOf(c))}</a>`;
const storyChip = (s, lang = "en") =>
  `<a class="chip" href="${url.story(s.id, lang)}">${esc(s.versions[lang]?.title ?? s.id)}</a>`;

/* ====================================================================== */
/* Hub                                                                     */
/* ====================================================================== */

export function hubPage(db) {
  const stories = db.stories;
  const translated = stories.filter((s) => Object.keys(LANGS).every((l) => s.versions[l])).length;
  const concepts = db.concepts;
  const byStatus = (st) => concepts.filter((c) => c.status === st).length;
  const questions = db.questions;

  const stats = [
    [db.characters.length, "Characters", `${db.characters.filter((c) => c.status === "agreed").length} agreed`, url.characters()],
    [concepts.length, "Concepts", `${byStatus("written")} written · ${byStatus("drafted")} drafted`, url.concepts()],
    [questions.length, "Questions", `${questions.filter((q) => q.kind === "opens" && !q.target).length} on the frontier`, url.questions()],
    [stories.length, "Stories", `${translated} in both languages`, url.stories()],
  ].map(([n, label, small, href]) =>
    `<a class="stat" href="${href}"><b>${n}</b><span>${label}</span><small>${esc(small)}</small></a>`).join("");

  const topics = db.topics.map((t) => {
    const cs = t.concepts;
    const w = cs.filter((c) => c.status === "written").length, d = cs.filter((c) => c.status === "drafted").length;
    const onward = cs.flatMap((c) => c.opens);
    const out = onward.filter((o) => o.domain !== t.meta.title).length;
    return `<div class="card">
      <span class="tag">Topic · ages ${esc([].concat(t.meta.ages ?? "—").join(", "))} · ${esc(t.meta.status ?? "")}</span>
      <h3>${esc(t.meta.title)}</h3>
      <div class="bar" title="${w} written, ${d} drafted of ${cs.length}"><i class="w" style="width:${(100 * w) / cs.length}%"></i><i class="d" style="width:${(100 * d) / cs.length}%"></i></div>
      <div class="figs">
        <div class="fig"><b>${cs.length}</b><span>concepts</span></div>
        <div class="fig"><b>${t.maxL + 1}</b><span>layers</span></div>
        <div class="fig"><b>${cs.filter((c) => !c.pre.length).length}</b><span>roots</span></div>
        <div class="fig"><b>${out}/${onward.length}</b><span>doors out</span></div>
      </div>
      <div class="chips"><a class="go" href="${url.atlas(t.meta.topic)}">Open the graph →</a><a class="go" href="${url.concepts()}">Concept cards</a></div>
    </div>`;
  }).join("");

  const cast = db.characters.map((c) => characterChip(c)).join("");

  return page({
    title: "I Wonder — blueprint",
    description: "The structure of the I Wonder books: characters, concepts, questions and stories.",
    active: "",
    atlasHref: db.atlasHref,
    body: `
<header class="mast big">
  <p class="eyebrow">Blueprint · a curiosity encyclopaedia for children</p>
  <h1>I Wonder</h1>
  <p class="lede">A book organised by <b>what a child can already understand</b>, not by subject. Every article starts from something visible in the world and a question a child actually asks. It can only be told once the concepts underneath it are in place.</p>
  <div class="stats">${stats}</div>
</header>

<section class="block">
  <h2>The cast</h2>
  <p class="sub">Four ways of thinking, investigating together.</p>
  <div class="chips">${cast || '<span class="chip none">Nobody yet</span>'}</div>
</section>

<section class="block">
  <h2>Topics</h2>
  <p class="sub">Each topic is a prerequisite graph. Nothing can be told until the concepts to its left are in place.</p>
  <div class="grid">${topics}</div>
</section>

<section class="block">
  <h2>The five beats</h2>
  <p class="sub">Every article, always in this order.</p>
  <ol class="beats">
    <li><b>Concept</b><span>The idea the article is really about. A planning label — it never appears in the book.</span></li>
    <li><b>Phenomenon</b><span>Something the child can see for themselves, without equipment or permission.</span></li>
    <li><b>Question</b><span>How a child would actually put it. This is the article's title.</span></li>
    <li><b>Experiment</b><span>Ordinary objects, arranged so the honest answer becomes unavoidable.</span></li>
    <li><b>Next questions</b><span>The doors it opens. Most lead out of the topic entirely.</span></li>
  </ol>
</section>`,
  });
}

/* ====================================================================== */
/* Characters                                                              */
/* ====================================================================== */

export function charactersPage(db) {
  const cards = db.characters.map((c) => `
    <a class="card who" href="${url.character(c.id)}">
      ${portrait(c, "pic")}
      <div class="txt">
        <h3>${esc(nameOf(c))} ${c.name?.uk ? `<span class="uk">· ${esc(c.name.uk)}</span>` : ""}</h3>
        ${c.tagline ? `<span class="tagline">“${esc(c.tagline)}”</span>` : ""}
        <p>${esc(c.one_line || c.archetype || c.role || "")}</p>
        <div class="foot">${statusBadge(c.status ?? "sketch")}</div>
      </div>
    </a>`).join("");

  return page({
    title: "Characters — I Wonder",
    active: "characters",
    atlasHref: db.atlasHref,
    body: `
<header class="mast">
  <p class="eyebrow">The cast · ${db.characters.length} characters</p>
  <h1>Characters</h1>
  <p class="lede">Each one is a way of thinking. Open a card for their philosophy, what they do and never do, their weaknesses, relationships and how they talk at each age.</p>
  ${db.castImage ? `<img class="cast-hero" src="${db.castImage}" alt="The cast of I Wonder together">` : ""}
</header>
<section class="block"><div class="grid">${cards || '<div class="empty">Nobody yet.</div>'}</div></section>`,
  });
}

/**
 * The character screen always shows the same slots in the same order, whatever
 * the headings in the markdown file happen to be called. Each `##` section is
 * placed in the first slot whose pattern matches its heading; `### What X does`
 * / `### What X doesn't do` subsections are pulled out of their parent. Anything
 * unmatched lands in "Specific info", so nothing written is ever hidden.
 */
const SLOTS = [
  ["philosophy", "Philosophy · way of thinking", /philosophy/i],
  ["traits", "Core traits", /personality traits|core traits|^traits|skills|strengths/i],
  ["does", "What they do", /\bdoes$|core functions/i],
  ["doesnt", "What they don't do · constraints", /doesn.?t do|don.?t do|constraints|consistency rules|don.?t overuse/i],
  ["weak", "Weaknesses", /weakness|imperfection|flaw/i],
  ["rel", "Relationships", /relationship|character dynamics|related characters/i],
  ["patterns", "Dialogue patterns", /dialogue style|patterns|example interactions|dialogue principles/i],
  ["samples", "Dialogue samples by age", /sample dialogues|dialogue samples/i],
  ["humour", "Humour", /humou?r/i],
  ["info", "Specific info", null],
];
const SKIP = /in one (sentence|line)$/i;

function slotFor(title) {
  return (SLOTS.find(([, , re]) => re && re.test(title)) ?? SLOTS.at(-1))[0];
}

function characterSlots(c) {
  const filled = Object.fromEntries(SLOTS.map(([k]) => [k, []]));
  for (const s of outline(c.body)) {
    if (SKIP.test(s.title)) continue;
    // Pull "does / doesn't do" subsections out of their parent section.
    const moved = s.subs.filter((sub) => ["does", "doesnt"].includes(slotFor(sub.title)) && !/sample/i.test(s.title));
    moved.forEach((sub) => filled[slotFor(sub.title)].push({ from: sub.title, text: sub.text }));
    const keep = s.subs.filter((sub) => !moved.includes(sub));
    const text = moved.length
      ? [s.intro, ...keep.map((k) => `### ${k.title}\n${k.text}`)].filter(Boolean).join("\n\n")
      : s.text;
    if (!text.trim() || /^\*?to be developed/i.test(text.trim())) continue;
    filled[slotFor(s.title)].push({ from: s.title, text, subs: keep });
  }
  return filled;
}

function ageTabs(parts, idp) {
  // Collect "### Ages 5-7" subsections across every sample section.
  const bands = Object.fromEntries(AGE_BANDS.map((b) => [b, []]));
  const other = [];
  for (const p of parts) {
    const subs = outline("## x\n" + p.text)[0].subs;
    if (!subs.length) { other.push(p); continue; }
    for (const sub of subs) {
      const m = sub.title.match(/(\d+)\s*[-–]\s*(\d+)/);
      const band = m && `${m[1]}-${m[2]}`;
      if (band && bands[band]) bands[band].push(sub.text);
      else other.push({ from: sub.title, text: sub.text });
    }
  }
  const tabs = AGE_BANDS.map((b, i) =>
    `<button role="tab" id="${idp}-t${i}" aria-controls="${idp}-p${i}" aria-selected="${i === 0}">Ages ${b.replace("-", "–")}${bands[b].length ? "" : " ·  —"}</button>`).join("");
  const panels = AGE_BANDS.map((b, i) =>
    `<div class="tabpanel prose" role="tabpanel" id="${idp}-p${i}" aria-labelledby="${idp}-t${i}"${i ? " hidden" : ""}>${
      bands[b].length ? bands[b].map(md).join("<hr>") : missing(`No dialogue sample for ages ${b} yet.`)}</div>`).join("");
  return `<div class="tabs" role="tablist">${tabs}</div>${panels}` +
    other.map((p) => `<div class="part"><div class="tag from">${esc(p.from)}</div><div class="prose">${md(p.text)}</div></div>`).join("");
}

export function characterPage(db, c) {
  const slots = characterSlots(c);
  const stories = db.stories.filter((s) => s.characters.includes(c.id));
  const facts = [
    ["Role", c.role], ["Archetype", c.archetype], ["Always asks", c.asks], ["Never", c.never],
    ["Appearance", c.appearance], ["Age", c.age], ["Hobby", c.hobby],
  ].filter(([, v]) => v).map(([k, v]) => `<div><dt class="tag">${k}</dt><dd>${mdInline(v)}</dd></div>`).join("");

  const toc = SLOTS.map(([k, label]) =>
    `<a href="#${k}"${slots[k].length ? "" : ' class="gap" title="Not written yet"'}>${esc(label.split(" · ")[0])}</a>`).join("");

  const body = SLOTS.map(([k, label], i) => {
    const parts = slots[k];
    let inner;
    if (!parts.length) inner = missing("Not written yet.");
    else if (k === "samples") inner = ageTabs(parts, "ages");
    else inner = parts.map((p) =>
      `<div class="part">${parts.length > 1 || !new RegExp(label.split(" ")[0], "i").test(p.from) ? `<div class="tag from">${esc(p.from)}</div>` : ""}<div class="prose">${md(p.text)}</div></div>`).join("");
    return `<section class="slot" id="${k}"><h2><span class="n">${String(i + 1).padStart(2, "0")}</span>${esc(label)}</h2>${inner}</section>`;
  }).join("");

  const others = db.characters.filter((o) => o.id !== c.id);

  return page({
    title: `${nameOf(c)} — I Wonder`,
    active: "characters",
    atlasHref: db.atlasHref,
    body: `
<header class="mast">
  <p class="eyebrow"><a href="${url.characters()}">Characters</a> · ${statusBadge(c.status ?? "sketch")}</p>
  <div class="char-head">
    ${portrait(c)}
    <div>
      <h1>${esc(nameOf(c))}${c.name?.uk ? ` <span class="uk" style="font-weight:500;color:var(--ink-faint)">· ${esc(c.name.uk)}</span>` : ""}</h1>
      ${c.tagline ? `<p class="tagline" style="font-size:20px;margin:0 0 8px">“${esc(c.tagline)}”</p>` : ""}
      ${c.one_line ? `<p class="lede">${esc(c.one_line)}</p>` : ""}
    </div>
  </div>
  ${facts ? `<dl class="facts">${facts}</dl>` : ""}
  <div style="margin-top:18px;display:flex;flex-wrap:wrap;gap:18px">
    <div><span class="tag">Appears in</span><div class="chips" style="margin-top:6px">${stories.map((s) => storyChip(s)).join("") || '<span class="chip none">No stories yet</span>'}</div></div>
    <div><span class="tag">With</span><div class="chips" style="margin-top:6px">${others.map(characterChip).join("")}</div></div>
  </div>
</header>
<nav class="toc" aria-label="On this page">${toc}</nav>
${body}`,
    script: TABS_JS,
  });
}

const TABS_JS = `
document.querySelectorAll('[role=tablist]').forEach(list => {
  const tabs = [...list.querySelectorAll('[role=tab]')];
  const show = t => tabs.forEach(x => { const on = x === t; x.setAttribute('aria-selected', on); document.getElementById(x.getAttribute('aria-controls')).hidden = !on; });
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => show(t));
    t.addEventListener('keydown', e => { const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (d) { const n = tabs[(i + d + tabs.length) % tabs.length]; n.focus(); show(n); } });
  });
});`;

/* ====================================================================== */
/* Concepts                                                                */
/* ====================================================================== */

export function conceptsPage(db) {
  const data = db.concepts.map((c) => ({
    id: c.id, topic: c.topic, topicTitle: c.topicTitle, title: c.short, q: c.ask, see: c.see,
    dom: c.dom, ages: c.ages, status: c.status, layer: c.layer, layerName: c.layerName,
    stories: db.storiesByConcept.get(c.id)?.length ?? 0, url: url.concept(c.topic, c.id),
  }));
  const opts = (xs) => xs.map((x) => `<option>${esc(x)}</option>`).join("");
  const domains = [...new Set(db.concepts.map((c) => c.dom))].sort();
  const statuses = ["mapped", "drafted", "written", "retired"];

  return page({
    title: "Concepts — I Wonder",
    active: "concepts",
    atlasHref: db.atlasHref,
    body: `
<header class="mast">
  <p class="eyebrow">Concepts · ${db.concepts.length} in ${db.topics.length} topic${db.topics.length === 1 ? "" : "s"}</p>
  <h1>Concepts</h1>
  <p class="lede">Each card is one idea, shown as the question a child actually asks. Group them by <b>topic</b> (which book), <b>domain</b> (which field of knowledge) or <b>layer</b> (how much has to be understood first).</p>
</header>
<div class="toolbar" role="search">
  <div class="seg" role="group" aria-label="Group by">
    <button data-g="topic" aria-pressed="true">Topic</button><button data-g="dom" aria-pressed="false">Domain</button><button data-g="layer" aria-pressed="false">Layer</button>
  </div>
  <label><span class="tag">Age</span><select id="f-age"><option value="">All</option>${opts(AGE_BANDS)}</select></label>
  <label><span class="tag">Domain</span><select id="f-dom"><option value="">All</option>${opts(domains)}</select></label>
  <label><span class="tag">Status</span><select id="f-status"><option value="">All</option>${opts(statuses)}</select></label>
  <label><span class="tag">Story</span><select id="f-story"><option value="">Any</option><option value="yes">Has a story</option><option value="no">No story yet</option></select></label>
  <input type="search" id="f-q" placeholder="Search questions, titles, ids…" aria-label="Search concepts">
  <span class="count" id="count"></span>
</div>
<div id="out"></div>`,
    script: `
const C = ${json(data)};
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[m]);
let group = 'topic';
const h = new URLSearchParams(location.hash.slice(1));
if (h.get('dom')) $('f-dom').value = h.get('dom');
if (h.get('group')) group = h.get('group');
function card(c) {
  return '<a class="card" href="' + c.url + '"><span class="tag">' + esc(c.dom) + ' · layer ' + c.layer + '</span>' +
    '<div class="q">' + esc(c.q || c.title) + '</div><p>' + esc(c.title) + '</p>' +
    '<div class="foot"><span class="badge ' + c.status + '">' + c.status + '</span>' +
    (c.stories ? '<span class="badge story">' + c.stories + ' stor' + (c.stories > 1 ? 'ies' : 'y') + '</span>' : '') +
    c.ages.map(a => '<span class="badge">' + esc(a) + '</span>').join('') + '</div></a>';
}
function render() {
  document.querySelectorAll('[data-g]').forEach(b => b.setAttribute('aria-pressed', b.dataset.g === group));
  const age = $('f-age').value, dom = $('f-dom').value, st = $('f-status').value, story = $('f-story').value;
  const q = $('f-q').value.trim().toLowerCase();
  const rows = C.filter(c => (!age || c.ages.includes(age)) && (!dom || c.dom === dom) && (!st || c.status === st) &&
    (!story || (story === 'yes') === (c.stories > 0)) &&
    (!q || (c.q + ' ' + c.title + ' ' + c.id + ' ' + c.see).toLowerCase().includes(q)));
  const key = c => group === 'topic' ? c.topicTitle : group === 'dom' ? c.dom : c.layer;
  const label = c => group === 'layer' ? 'Layer ' + c.layer + ' · ' + c.layerName : key(c);
  const groups = new Map();
  rows.slice().sort((a, b) => group === 'layer' ? a.layer - b.layer : String(key(a)).localeCompare(String(key(b))) || a.layer - b.layer)
    .forEach(c => { const k = key(c); if (!groups.has(k)) groups.set(k, { label: label(c), items: [] }); groups.get(k).items.push(c); });
  $('out').innerHTML = rows.length ? [...groups.values()].map(g =>
    '<section class="group"><div class="gh"><h2>' + esc(g.label) + '</h2><span class="tag">' + g.items.length + '</span></div><div class="grid">' +
    g.items.map(card).join('') + '</div></section>').join('') : '<div class="empty" style="margin-top:24px">Nothing matches these filters.</div>';
  $('count').textContent = rows.length + ' of ' + C.length;
}
document.querySelectorAll('[data-g]').forEach(b => b.addEventListener('click', () => { group = b.dataset.g; render(); }));
['f-age', 'f-dom', 'f-status', 'f-story', 'f-q'].forEach(id => $(id).addEventListener('input', render));
render();`,
  });
}

export function conceptPage(db, c) {
  const pre = c.pre.map((p) => db.conceptIn(c.topic, p)).filter(Boolean);
  const kids = c.kids.map((k) => db.conceptIn(c.topic, k)).filter(Boolean);
  const stories = db.storiesByConcept.get(c.id) ?? [];
  const opens = c.opens.map((o) => {
    const target = o.leadsTo && db.conceptById.get(o.leadsTo);
    return `<li><span>${target ? `<a href="${url.concept(target.topic, target.id)}">${esc(o.question)}</a>` : esc(o.question)}</span>
      <span class="end">${target ? "" : '<span class="badge absent" title="No concept answers this yet">frontier</span>'}<span class="badge${o.domain !== c.topicTitle ? " story" : ""}">${esc(o.domain)}</span></span></li>`;
  }).join("");
  const sec = (label, html) => `<div class="sec"><span class="tag">${label}</span>${html}</div>`;

  return page({
    title: `${c.short} — I Wonder`,
    active: "concepts",
    atlasHref: db.atlasHref,
    body: `
<header class="mast">
  <p class="eyebrow"><a href="${url.concepts()}">Concepts</a> · ${esc(c.topicTitle)} · layer ${c.layer} ${esc(c.layerName)} · ${esc(c.dom)}</p>
  <h1>${esc(c.short)}</h1>
  <p class="lede">${esc(c.name)}</p>
</header>
<div class="detail">
  <div>
    ${sec("What they can see", `<div class="prose">${md(c.see) || missing("Not written yet.")}</div>`)}
    ${sec("The question", c.ask ? `<p class="ask">${esc(c.ask)}</p>` : missing("Not written yet."))}
    ${sec("The experiment", c.experiment ? `<div class="prose">${md(c.experiment)}</div>` : missing("Not written yet."))}
    ${sec("Memory hook", c.hook ? `<div class="prose">${md(c.hook)}</div>` : missing("Not written yet. Add a <code>## Memory hook</code> section."))}
    ${sec("Watch out", c.note ? `<div class="note prose">${md(c.note)}</div>` : missing("Nothing flagged yet."))}
    ${sec(`Next questions · ${c.opens.length}`, c.opens.length ? `<ul class="qlist">${opens}</ul>` : missing("No onward questions."))}
  </div>
  <aside>
    <div class="chips">${statusBadge(c.status)}${c.ages.map((a) => `<span class="badge">${esc(a)}</span>`).join("")}<span class="badge">${esc(c.dom)}</span></div>
    <div><span class="tag">Stories</span><div class="chips">${stories.map((s) => storyChip(s)).join("") || '<span class="chip none">No story yet</span>'}</div></div>
    <div><span class="tag">Needs first</span><div class="chips">${pre.map(conceptChip).join("") || '<span class="chip none">Nothing — a child already has this</span>'}</div></div>
    <div><span class="tag">Unlocks</span><div class="chips">${kids.map(conceptChip).join("") || '<span class="chip none">Nothing yet — on the frontier</span>'}</div></div>
    <div><span class="tag">Load-bearing</span>${c.descendants} concept${c.descendants === 1 ? "" : "s"} depend on this, directly or further down.</div>
    <div><span class="tag">id</span><code>${esc(c.id)}</code></div>
    <a class="go" href="${url.atlas(c.topic, c.id)}">Show in the graph →</a>
  </aside>
</div>`,
  });
}

/* ====================================================================== */
/* Questions                                                               */
/* ====================================================================== */

export function questionsPage(db) {
  const data = db.questions.map((q) => ({
    q: q.question, see: q.see ?? "", kind: q.kind, dom: q.domain, topic: q.topicTitle, ages: q.ages,
    href: q.target ? url.concept(q.target.topic, q.target.id) : null,
    targetTitle: q.target?.short ?? null,
    from: q.kind === "opens" ? { title: q.from.short, href: url.concept(q.from.topic, q.from.id) } : null,
    stories: (q.target ? db.storiesByConcept.get(q.target.id) ?? [] : []).map((s) => ({ title: s.versions.en?.title ?? s.id, href: url.story(s.id) })),
  }));
  const domains = [...new Set(data.map((d) => d.dom))].sort();

  return page({
    title: "Questions — I Wonder",
    active: "questions",
    atlasHref: db.atlasHref,
    body: `
<header class="mast">
  <p class="eyebrow">Questions · ${data.length}</p>
  <h1>Questions</h1>
  <p class="lede">Every question in the book. <b>Asked</b> questions open a concept, together with what the child can see. <b>Onward</b> questions are the doors a concept opens. If no concept answers one yet, it is marked <b>frontier</b>.</p>
</header>
<div class="toolbar" role="search">
  <div class="seg" role="group" aria-label="Kind">
    <button data-k="" aria-pressed="true">All</button><button data-k="asks" aria-pressed="false">Asked</button><button data-k="opens" aria-pressed="false">Onward</button><button data-k="frontier" aria-pressed="false">Frontier</button>
  </div>
  <label><span class="tag">Domain</span><select id="f-dom"><option value="">All</option>${domains.map((d) => `<option>${esc(d)}</option>`).join("")}</select></label>
  <label><span class="tag">Age</span><select id="f-age"><option value="">All</option>${AGE_BANDS.map((a) => `<option>${a}</option>`).join("")}</select></label>
  <input type="search" id="f-q" placeholder="Search questions…" aria-label="Search questions">
  <span class="count" id="count"></span>
</div>
<div id="out"></div>`,
    script: `
const Q = ${json(data)};
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[m]);
let kind = '';
function row(q) {
  const title = q.href ? '<a class="qq" href="' + q.href + '">' + esc(q.q) + '</a>' : '<span class="qq">' + esc(q.q) + '</span>';
  const badges = (q.kind === 'asks' ? '<span class="badge">asked</span>' : '<span class="badge">onward</span>') +
    (q.kind === 'opens' && !q.href ? '<span class="badge absent">frontier</span>' : '') +
    (q.stories.length ? '<span class="badge story">story</span>' : '');
  const meta = [];
  if (q.from) meta.push('from <a href="' + q.from.href + '">' + esc(q.from.title) + '</a>');
  if (q.href && q.targetTitle) meta.push('→ concept <a href="' + q.href + '">' + esc(q.targetTitle) + '</a>');
  q.stories.forEach(s => meta.push('→ story <a href="' + s.href + '">' + esc(s.title) + '</a>'));
  return '<div class="qrow">' + title + '<div class="right">' + badges + '</div>' +
    (q.see ? '<p class="see">' + esc(q.see) + '</p>' : '') +
    (meta.length ? '<div class="meta">' + meta.join(' · ') + '</div>' : '') + '</div>';
}
function render() {
  document.querySelectorAll('[data-k]').forEach(b => b.setAttribute('aria-pressed', b.dataset.k === kind));
  const dom = $('f-dom').value, age = $('f-age').value, s = $('f-q').value.trim().toLowerCase();
  const rows = Q.filter(q => (!kind || (kind === 'frontier' ? q.kind === 'opens' && !q.href : q.kind === kind)) &&
    (!dom || q.dom === dom) && (!age || q.ages.includes(age)) && (!s || (q.q + ' ' + q.see).toLowerCase().includes(s)));
  const groups = new Map();
  rows.slice().sort((a, b) => a.dom.localeCompare(b.dom)).forEach(q => { if (!groups.has(q.dom)) groups.set(q.dom, []); groups.get(q.dom).push(q); });
  $('out').innerHTML = rows.length ? [...groups].map(([d, qs]) =>
    '<section class="group"><div class="gh"><h2>' + esc(d) + '</h2><span class="tag">' + qs.length + '</span></div>' + qs.map(row).join('') + '</section>').join('')
    : '<div class="empty" style="margin-top:24px">Nothing matches these filters.</div>';
  $('count').textContent = rows.length + ' of ' + Q.length;
}
document.querySelectorAll('[data-k]').forEach(b => b.addEventListener('click', () => { kind = b.dataset.k; render(); }));
['f-dom', 'f-age', 'f-q'].forEach(id => $(id).addEventListener('input', render));
render();`,
  });
}

/* ====================================================================== */
/* Stories                                                                 */
/* ====================================================================== */

export function storiesPage(db) {
  const data = db.stories.map((s) => {
    const cs = s.concepts.map((id) => db.conceptById.get(id)).filter(Boolean);
    return {
      id: s.id, href: url.story(s.id),
      title: s.versions.en?.title ?? Object.values(s.versions)[0].title,
      uk: s.versions.uk?.title ?? null,
      langs: Object.keys(LANGS).map((l) => [l, !!s.versions[l]]),
      question: s.versions.en?.question || cs[0]?.ask || "",
      concepts: cs.map((c) => ({ title: c.short, href: url.concept(c.topic, c.id) })),
      concept: cs[0]?.short ?? "No concept",
      ages: s.ages.length ? s.ages : ["no age"],
      who: s.characters.map((id) => db.charById.get(id)).filter(Boolean).map((c) => ({ name: nameOf(c), img: c.imageUrl })),
      status: s.versions.en?.status ?? "draft",
    };
  });

  return page({
    title: "Stories — I Wonder",
    active: "stories",
    atlasHref: db.atlasHref,
    body: `
<header class="mast">
  <p class="eyebrow">Stories · ${data.length}</p>
  <h1>Stories</h1>
  <p class="lede">The investigations, arranged by the question they start from, the concept they reveal, or the age they are written for. Each story has an English and a Ukrainian version.</p>
</header>
<div class="toolbar">
  <div class="seg" role="group" aria-label="Group by">
    <button data-g="concept" aria-pressed="true">Concept</button><button data-g="question" aria-pressed="false">Question</button><button data-g="age" aria-pressed="false">Age</button><button data-g="order" aria-pressed="false">In order</button>
  </div>
  <span class="count">${data.length} stor${data.length === 1 ? "y" : "ies"}</span>
</div>
<div id="out"></div>`,
    script: `
const S = ${json(data)};
const esc = s => String(s ?? '').replace(/[&<>"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[m]);
let group = 'concept';
function card(s) {
  return '<a class="card" href="' + s.href + '"><span class="tag">' + s.concepts.map(c => esc(c.title)).join(' · ') + '</span>' +
    '<h3>' + esc(s.title) + '</h3>' + (s.uk ? '<p>' + esc(s.uk) + '</p>' : '') +
    (s.question ? '<p><i>' + esc(s.question) + '</i></p>' : '') +
    '<div class="foot">' + s.langs.map(([l, ok]) => '<span class="badge ' + (ok ? 'have' : 'absent') + '">' + l + '</span>').join('') +
    '<span class="badge ' + s.status + '">' + s.status + '</span>' +
    s.ages.map(a => '<span class="badge">' + esc(a) + '</span>').join('') + '</div></a>';
}
function render() {
  document.querySelectorAll('[data-g]').forEach(b => b.setAttribute('aria-pressed', b.dataset.g === group));
  const keys = s => group === 'concept' ? [s.concept] : group === 'question' ? [s.question || 'No question yet'] : group === 'age' ? s.ages : ['All stories'];
  const groups = new Map();
  S.forEach(s => keys(s).forEach(k => { if (!groups.has(k)) groups.set(k, []); groups.get(k).push(s); }));
  const order = [...groups.keys()]; if (group !== 'order') order.sort();
  document.getElementById('out').innerHTML = S.length ? order.map(k =>
    '<section class="group"><div class="gh"><h2>' + esc(k) + '</h2><span class="tag">' + groups.get(k).length + '</span></div><div class="grid">' +
    groups.get(k).map(card).join('') + '</div></section>').join('') : '<div class="empty">No stories yet.</div>';
}
document.querySelectorAll('[data-g]').forEach(b => b.addEventListener('click', () => { group = b.dataset.g; render(); }));
render();`,
  });
}

export function storyPage(db, s, lang, i) {
  const v = s.versions[lang];
  const en = s.versions.en ?? v;
  const cs = s.concepts.map((id) => db.conceptById.get(id)).filter(Boolean);
  const who = s.characters.map((id) => db.charById.get(id)).filter(Boolean);
  const question = v.question || en.question;
  const hook = v.memoryHook || en.memoryHook;
  const bridge = v.bridge || en.bridge;
  const bridgeTo = s.bridgeTo && db.conceptById.get(s.bridgeTo);
  const prev = db.stories[i - 1], next = db.stories[i + 1];

  const tabs = Object.entries(LANGS).map(([l, label]) =>
    s.versions[l]
      ? `<a href="${url.story(s.id, l)}" lang="${l}"${l === lang ? ' aria-current="page"' : ""}>${label}</a>`
      : `<span class="off" title="Not written yet">${label}</span>`).join("");
  const row = (k, html) => `<dt class="tag">${k}</dt><dd>${html}</dd>`;
  const none = (t) => `<span style="color:var(--ink-faint);font-style:italic">${t}</span>`;

  return page({
    title: `${v.title} — I Wonder`,
    active: "stories",
    atlasHref: db.atlasHref,
    body: `
<div class="reader">
<header class="mast">
  <p class="eyebrow"><a href="${url.stories()}">Stories</a> · ages ${esc(s.ages.join(", ") || "—")} · ${statusBadge(v.status)}</p>
  <h1 lang="${lang}">${esc(v.title)}</h1>
  <div class="tabs">${tabs}</div>
  <dl class="storymeta">
    ${row("Question", question ? `<i>${esc(question)}</i>` : cs[0]?.ask ? `<i>${esc(cs[0].ask)}</i> <span class="tag">from the concept</span>` : none("not set"))}
    ${row("Concept", cs.map(conceptChip).join(" ") || none("not linked"))}
    ${row("Characters", `<div class="chips">${who.map(characterChip).join("") || none("none listed")}</div>`)}
    ${row("Memory hook", hook ? esc(hook) : cs[0]?.hook ? `${esc(cs[0].hook)} <span class="tag">from the concept</span>` : none("not written yet"))}
    ${row("Bridge", bridge ? (bridgeTo ? `<a href="${url.concept(bridgeTo.topic, bridgeTo.id)}">${esc(bridge)}</a>` : esc(bridge)) : none("not written yet"))}
  </dl>
</header>
<article class="story" lang="${lang}">${md(v.body)}</article>
<nav class="pager">
  ${prev ? `<a href="${url.story(prev.id, prev.versions[lang] ? lang : "en")}"><span class="tag">← Previous</span>${esc((prev.versions[lang] ?? prev.versions.en).title)}</a>` : "<span></span>"}
  ${next ? `<a href="${url.story(next.id, next.versions[lang] ? lang : "en")}" style="text-align:right"><span class="tag">Next →</span>${esc((next.versions[lang] ?? next.versions.en).title)}</a>` : ""}
</nav>
</div>`,
  });
}
