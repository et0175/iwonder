# Blueprint site — requirements

The internal website that shows the structure of *I Wonder*: characters,
concepts, the prerequisite graph, questions and stories. It is the
**authoring blueprint**, not the product children use.

Sources: `inputs/environment_setup.md`, `README.md`, `docs/PRINCIPLES.md`,
`docs/CONCEPT-SCHEMA.md`, `docs/DECISIONS.md`, `content/00-product/*`.

Status: draft v0.1 · 2026-09-25

---

## 1. Goals and non-goals

**Goals**

- G1. Look at the whole book at a glance: who the cast is, which concepts exist,
  what depends on what, which questions lead where, and which stories are written.
- G2. **Everything is generated from the metadata** in `content/`. Nobody edits
  the site by hand. Change a markdown file, rebuild, and the site is up to date.
- G3. Show the gaps: concepts without stories, stories without a translation,
  characters without dialogue samples for an age band.
- G4. Keep the current way of working: plain markdown, Obsidian as the editor,
  git for sync, checks in CI (see DECISIONS: *Concepts are files, not a database*).

**Non-goals (for now)**

- Not the child-facing encyclopedia: no quizzes, profiles or AI chat.
- No editing in the browser, no login and no backend.
- No page layout for the printed book (reading order is still an open decision).

---

## 2. Users

| Who | What they do on the site |
|---|---|
| Author | Plans concepts, checks prerequisites, sees which question leads to which story, keeps characters consistent. |
| Co-author / translator | Finds stories that need a Ukrainian or English version. |
| Illustrator | Reads the character sheets and what each character looks like. |
| Reviewer | Uses a shared link to read a story next to its concept. |

---

## 3. Site map

```
Hub (index)
├── Characters        cards → character screen
├── Concepts          cards grouped by topic / domain → concept screen
├── Concept graph     one interactive atlas per topic (already exists)
├── Questions         every question with its "what they can see" → concept / story
└── Stories           by question / concept / age → story reader (EN | UK)
```

Every screen links to the others. A concept links to its characters' stories, a
story links back to its concept and question, and so on. You can always get
anywhere in two clicks.

---

## 4. Functional requirements

Priority: **M** = MVP, **S** = should have next, **C** = could have later.

### 4.1 Hub

| ID | Requirement | P |
|---|---|---|
| FR-HUB-1 | Show the counts for each section (characters, concepts by status, questions, stories by language) and link to each section. | M |
| FR-HUB-2 | List every topic with its age band, concept count, layer count and how many doors lead out (this already exists). | M |
| FR-HUB-3 | "Gaps" panel: concepts with no story, stories missing a language, onward questions that lead to no concept, and characters with no dialogue for an age band. | S |

### 4.2 Characters

| ID | Requirement | P |
|---|---|---|
| FR-CHR-1 | Show a grid of **small cards**: picture, name (EN / UK), and a one-line description. | M |
| FR-CHR-2 | Clicking a card opens the **character screen**, with these sections in this order: Philosophy / way of thinking · Core traits · What they do · What they don't do (constraints) · Weaknesses · Relationships with other characters · Dialogue patterns · Dialogue samples by age band · Humour · Specific info (hobbies, habits, kit, loves / dislikes). | M |
| FR-CHR-3 | Show age-banded dialogue samples as tabs (5–7 / 8–10 / 11–13). A band with no sample shows "not written yet". | M |
| FR-CHR-4 | Draw the relationships as links: every character named in the relationships section opens that character's screen. | S |
| FR-CHR-5 | List the stories and concepts the character appears in. The site works this out from story metadata; it is never written by hand. | S |
| FR-CHR-6 | Show a status badge (`sketch` / `agreed` / `retired`) and a list of open points ("Unknown / to develop"). | C |

### 4.3 Concepts

| ID | Requirement | P |
|---|---|---|
| FR-CON-1 | Show concept **cards** that can be grouped by **topic** or by **domain** (toggle). Each card shows the question, the title and a status badge. | M |
| FR-CON-2 | Filters: age band (more than one allowed), domain, topic, status, and "has story" yes/no. | M |
| FR-CON-3 | Concept screen: id, title, proposition · What they can see · Question · Experiment · Memory hook · Watch out · Prerequisites (links) · Unlocks (concepts that depend on this one, computed) · Next questions with their domains · Linked stories (EN / UK). | M |
| FR-CON-4 | Each next question that another concept already answers links to that concept (see `leads_to` in §5.2). The others are marked as **frontier**. | S |
| FR-CON-5 | Show the layer depth and "load-bearing" count (how many concepts depend on this one, directly or further down). Both are computed. | S |

### 4.4 Concept graph

| ID | Requirement | P |
|---|---|---|
| FR-GRA-1 | Keep the existing atlas: columns are prerequisite depth, and clicking a node opens its details. | M |
| FR-GRA-2 | Filter the graph by age band and domain, and colour it by status (mapped / drafted / written). | S |
| FR-GRA-3 | Highlight the path: selecting a concept highlights everything upstream (what must come first) and downstream (what it opens). | S |
| FR-GRA-4 | Overlay stories: mark the concepts that have a story, so the graph shows the **story order constraints**. | C |

### 4.5 Questions

| ID | Requirement | P |
|---|---|---|
| FR-QUE-1 | One page lists every question. It is built from each concept's **question** (with its "what they can see") and each concept's **next questions**. | M |
| FR-QUE-2 | Selecting a question opens its concept and, if there are any, its stories. A frontier question with no concept is marked as such. | M |
| FR-QUE-3 | Group or filter questions by domain, topic and age band. Search in both English and Ukrainian. | S |
| FR-QUE-4 | "Where did this question come from": for a next question, show which concept(s) lead to it. | S |

### 4.6 Stories

| ID | Requirement | P |
|---|---|---|
| FR-STO-1 | List stories grouped by **question**, **concept** or **age band** (toggle). | M |
| FR-STO-2 | Story reader with an **EN / UK switch**. If one language is missing, the reader says so and does not hide the story. | M |
| FR-STO-3 | Story header: question, concept (link), age band, characters (links), memory hook, bridge question (link to the next story or concept, if there is one). | M |
| FR-STO-4 | Show the story arc from `outline.md` as a structure checklist: Question · False hypothesis · Experiments · Discovery · Aha moments · Memory hook · Bridge question. Each item shows whether the story contains it. | S |
| FR-STO-5 | Prerequisite warning: if the story's concept needs concepts that have no story yet, list them ("tell these first"). | S |

### 4.7 Cross-cutting

| ID | Requirement | P |
|---|---|---|
| FR-X-1 | Every entity has a stable URL (`/characters/kira`, `/concepts/space/tides`, `/stories/edge-of-the-world/uk`). | M |
| FR-X-2 | Global search across characters, concepts, questions and stories, in both languages. | S |
| FR-X-3 | Every page has an "Open source file" link (to GitHub, and to Obsidian via `obsidian://`). | C |

---

## 5. Content model (what the generator reads)

This is the contract between the markdown and the site. The rule: **frontmatter
holds the structure, and `##` headings hold the prose.** The site never reads
free-form text to work out structure.

### 5.1 Character — `content/characters/<id>.md`

```yaml
---
id: kira
name: { en: Kira, uk: Кіра }
image: kira.png              # in the same folder or content/assets/
one_line: Asks "but why?" until the answer is real.
role: The one who keeps digging
age: child                   # or a number / range
status: sketch               # sketch | agreed | retired
relationships:
  - with: max
    dynamic: Challenges his first guesses; he turns her questions into experiments.
---
## Philosophy
## Core traits
## What they do
## What they don't do
## Weaknesses
## Dialogue patterns
## Dialogue samples
### Ages 5-7
### Ages 8-10
### Ages 11-13
## Humour
## Specific info
```

### 5.2 Concept — `content/concepts/<topic>/<id>.md`

This is the existing schema (`docs/CONCEPT-SCHEMA.md`) plus the additions from
`environment_setup.md`:

| Field / section | Change |
|---|---|
| `ages` | Can now be a **list**: `[5-7, 8-10]`. A single value still works. |
| `opens[].leads_to` | **New**, optional: the id of the concept that answers this onward question. Used by FR-CON-4 and FR-QUE-2. |
| `## Memory hook` | **New** section. |
| stories | **Not** stored on the concept. The site works it out from the stories' `concept:` field, so the link is written in one place only. |

The field names `text` / `next_question` / `age_range` in `environment_setup.md`
become the existing `proposition` / `opens` / `ages`. Nothing is renamed.

### 5.3 Story — `content/stories/<id>/<lang>.md`

This keeps one folder per story and one file per language:

```yaml
---
id: edge-of-the-world
lang: en                      # en | uk
title: The Edge of the World
question: Where did the boat go?
concepts: [earth-ball]        # the main concept first
ages: [5-7]
characters: [max, kira, strange, professor-ada]
memory_hook: …
bridge: Why don't we fall off it then?   # optional; may use leads_to like opens
status: draft                 # draft | edited | final
---
```

The structure fields (`concepts`, `ages`, `characters`) are only required in
the `en` file. The other language inherits them and only overrides `title`,
`question`, `memory_hook` and `bridge`.

### 5.4 Questions

There is **no separate file**. Questions are always computed from concepts and
stories. This keeps a question from existing in two places that could drift
apart.

---

## 6. Validation (extends `npm run check`)

**Errors**

- A story's `concepts` or `characters` points at an id that does not exist.
- An `opens[].leads_to` or `relationships[].with` points at an id that does not exist.
- Two story files for the same `id` + `lang`.
- A character without `id`, `name` or `one_line`.

**Warnings**

- A story exists in only one language.
- A concept with status `written` has no story.
- A character has no dialogue sample for an age band that one of their stories uses.
- A story's concept has prerequisites that have no story yet.

---

## 7. Non-functional requirements

| ID | Requirement |
|---|---|
| NFR-1 | Static pages. `npm run build` → `site/`. No database. Served on Render by `tools/serve.mjs`, which adds only the password check. |
| NFR-2 | The build is deterministic: the same content always produces the same output. It takes under 5 seconds for about 500 concepts. |
| NFR-3 | Zero manual steps: a new file appears on the site after the next build. |
| NFR-4 | `content/` stays a valid Obsidian vault, and wikilinks still resolve there. |
| NFR-5 | Works on a laptop and a phone (for reading stories). Readable in light and dark mode. |
| NFR-6 | The site interface is in English. Content is shown in EN / UK. |
| NFR-7 | Pages work offline once loaded. There are no external calls apart from fonts. |

---

## 8. Things to fix before building

**Status: fixed 2026-09-25.** The loader strips ordering prefixes, all 4
characters and 3 stories have frontmatter, and the helper files are
`_cast-overview.md` / `_dialog-samples.md`. `npm run check` and `npm run build`
pass. Kept for history:

1. **The build finds nothing.** `tools/lib/load.mjs` reads `content/concepts/`
   and `content/characters/`, but the folders are now `content/02 - concepts/01 space/`
   and `content/01 - characters/`. Either rename them back, or let the loader
   strip `NN - ` / `NN ` prefixes from folder and file names.
   *Recommendation:* strip the prefixes. That keeps the Obsidian sort order and
   gives clean URLs.
2. **Character and story files have no frontmatter.** The name, role and so on
   are written as `**Name**: Max\Макс` in the text. They need the §5.1 / §5.3
   frontmatter.
3. `js-yaml` is not installed locally. Run `npm install`. The build currently fails with `ERR_MODULE_NOT_FOUND`.
4. File names don't match: `04 max.md` has the heading "Character: Boy", and
   `01 characters.md` / `dialog-samples.md` are not character files (the loader
   has to skip them, or they move to `_`-prefixed names).

---

## 9. Open decisions

| # | Question | Default if not decided |
|---|---|---|
| D1 | Is Ukrainian a **translation** or a **parallel original**? (Also open in DECISIONS.) | Translation: `en` is the source and `uk` follows it. The site shows when `uk` is older than `en`. |
| D2 | Can one story cover **several concepts**? | Yes. `concepts:` is a list and the first one is the main concept. |
| D3 | Can one concept have **several stories** (for example, one per age band)? | Yes. |
| D4 | Where do character images live, and in what format? | `content/assets/characters/<id>.png` |
| D5 | Is the site private or public (for reviewers)? | **Decided:** Render, behind a shared password (`SITE_PASSWORD`). |
| D6 | Keep the numbered folder prefixes? | Keep them, and the loader strips them (see §8.1). |

---

## 10. Suggested MVP slice

**Status: built 2026-09-25.** Everything below is built. Also done: FR-CHR-5 (appears in),
FR-CON-4/5 (frontier, load-bearing), FR-QUE-4 (where a question came from),
FR-X-1 (stable URLs), and deployment to Render behind a password (D5).

1. Fix §8 (the loader paths, and frontmatter for the 4 characters and 3 stories).
2. Character cards and character screen (FR-CHR-1…3).
3. Concept cards and concept screen (FR-CON-1…3), with the existing atlas linked in.
4. Questions page (FR-QUE-1…2).
5. Story list and EN/UK reader (FR-STO-1…3).
6. Validation errors from §6.

Everything marked **S** / **C** comes after the first real story is linked
end-to-end (question → concept → story → next question).
