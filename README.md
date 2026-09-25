# I Wonder

A curiosity encyclopaedia for children, organised by **what a child can already
understand** rather than by subject.

Every article starts from something visible in the world and a question a child
actually asks. It can only be told once the concepts underneath it are in place —
you cannot answer *where does the Sun go at night* until the child believes the
Earth is a ball, and you cannot establish that until they know that distance
makes things look smaller.

Those dependencies are the architecture of the whole book, so they are kept as
data and checked automatically on every change.

---

## The five beats

Every article, always in this order:

| | Beat | Notes |
|---|---|---|
| 1 | **Concept** | The idea the article is really about. A planning label — it never appears in the book. |
| 2 | **Phenomenon** | Something the child can see for themselves, without equipment or permission. |
| 3 | **Question** | How a child would actually put it. This is the article's title and the only part they meet first. |
| 4 | **Experiment** | Ordinary objects, arranged so the honest answer becomes unavoidable. |
| 5 | **Next questions** | The doors it opens. Most lead out of the topic entirely — that is the point, not a leak. |

Full reasoning in [`docs/PRINCIPLES.md`](docs/PRINCIPLES.md).

---

## What is here

```
content/
  00-product/        vision and story outline
  01 - characters/   the cast; one file each
  02 - concepts/     the prerequisite graphs — the spine of the project
    01 space/        one folder per topic
      _topic.yml     topic metadata and layer names
      earth-ball.md  one file per concept
  stories/           the stories; frontmatter links each to its concepts and cast
  articles/          written articles, once concepts graduate from mapped
docs/
  PRINCIPLES.md      why the book is built this way
  CONCEPT-SCHEMA.md  every field on a concept file, and what it is for
  DECISIONS.md       open questions and what has been settled
tools/
  validate.mjs       graph and schema checks — run in CI
  build.mjs          generates the site from content/
  serve.mjs          serves site/, optionally behind a password
  lib/pages.mjs      one function per kind of page
site/                generated; not committed
```

---

## Working on it

```bash
npm install
npm run check     # validate graphs, characters and stories
npm run build     # check, then generate site/
npm start         # serve site/ on http://localhost:3000
```

`site/` is the **blueprint**: characters, concept cards, the prerequisite graph,
every question, and the stories in English and Ukrainian. It is generated
entirely from `content/`; nothing in it is edited by hand. Requirements are in
[`inputs/website-requirements.md`](inputs/website-requirements.md).

### Online (Render)

`render.yaml` deploys the blueprint to Render and rebuilds it on every push to
`main`. In Render choose **New → Blueprint**, pick this repository, and set
`SITE_PASSWORD` when asked. Visitors then log in as `iwonder` with that
password. Leave `SITE_PASSWORD` empty to make the site open to anyone with the link.

`npm run check` runs on every push. It fails the build if a prerequisite points
at a concept that does not exist, if a chain becomes circular, or if a concept
is missing a phenomenon or a question. **Warnings** are advisory — a concept with
no onward questions, a prerequisite that is already implied by another one.

### Editing in Obsidian

`content/` is a valid Obsidian vault. Open it as a folder and the prerequisite
links (`[[far-small]]`) resolve, so **Obsidian's graph view is the concept
atlas** — live, while you write, with no build step. Both tools read the same
plain markdown files; git is what syncs them.

Folder and file names may start with an ordering prefix (`02 - `, `01 `) so
they sort nicely in Obsidian. The tools ignore it: `01 space` is the topic
`space`, `04 max.md` is the character `max`.

### Adding a concept

Create `content/02 - concepts/<topic>/<id>.md`. The filename must match the `id`.
Copy the shape of an existing one, or see
[`docs/CONCEPT-SCHEMA.md`](docs/CONCEPT-SCHEMA.md). Then `npm run check`.

### Adding a topic

Create `content/02 - concepts/<topic>/_topic.yml`, add concept files beside it, and
it appears on the site automatically. Prerequisites currently resolve **within**
a topic only — see the open question in `docs/DECISIONS.md`.

---

## Status

| Topic | Ages | Concepts | Status |
|---|---|---|---|
| Space | 5–7 | 57 | mapped — no experiments or articles written yet |

`mapped` → `drafted` → `written` is the lifecycle of a concept. Everything is
currently at `mapped`: the graph exists, the prose does not.
