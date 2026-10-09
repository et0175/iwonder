# Decisions

Settled decisions at the top, open questions below. When an open question is
answered, move it up with a date and a one-line reason.

---

## Settled

**2026-09 · Concepts are files, not a database.**
One markdown file per concept, plain frontmatter. Reviewable one at a time,
diffable, readable on github.com, and editable in Obsidian without tooling.

**2026-09 · The graph is validated in CI.**
Dangling prerequisites and circular chains are build errors, not opinions.
This is the one thing a repo gives this project that no writing tool does.

**2026-09 · Prerequisite depth is computed, never authored.**
Layers come from the graph. Naming them in `_topic.yml` is editorial decoration
only. If the layers look wrong, the prerequisites are wrong.

**2026-09 · The blueprint site looks like the Question Book.**
Professor Ada's notebook is the interface: ruled paper, blue-black ink, index
cards, and her three stamps for status (`✓ answered`, `investigating`,
`we don't know yet`). The two dense list pages — Concepts and Questions — drop
the paper and use a museum-cabinet grid instead: hairline rules and a manila
catalogue label carrying the concept's `layer · position` from the graph.
Tokens live in `tools/templates/site.css`; the atlas shares the palette.

**2026-09 · Concepts are named by their idea, not their title.**
`title` is a handle for the author. The child only ever meets the question.

**2026-10 · Short answer is author-facing, not child-facing.**
Every concept carries a 2–4 sentence mechanical answer in adult language. It
exists so the metaphor can be chosen with the mechanism in view, and it never
appears in the book.

**2026-10 · Topics may differ in language; files may not.**
`space` is English throughout, `living-nature` Ukrainian throughout. Frontmatter
keys and `##` headings stay English everywhere because the loader parses them.

**2026-10 · Evolution is the spine of living nature, in two halves.**
Inheritance plus variation produce the raw material; survival and mate choice
are two separate forces acting on it. Nearly every Animals / Plants / Insects /
Birds question needs both, and a third concept — that nothing changes within one
lifetime — is needed to stop the whole thing collapsing into Lamarckism.

---

## Open

### Medium — book, website, or both?
Changes what characters are for (narrators vs. guides), whether experiments can
be partly simulated, and whether reading order is fixed. The graph survives
either way, which is why this can stay open for now — but not past the first
written article.

### Do prerequisites cross topics?
Right now they resolve within one topic folder. The Space graph already contains
nine roots that are not about space at all — distance, shadows, air, falling.
When a second topic is mapped, those roots will almost certainly be shared.

Options: a `content/02 - concepts/_foundations/` folder that every topic can link
into; or allow `[[topic/id]]` cross-references. The second is more flexible and
more fragile. **Decide when the second topic exists, not before.**

### How many characters, and do they belong to topics?
Open until the cast is drafted. The risk to watch: characters who exist to
explain things turn the book into a lecture with names on it.

### What is the reading order for a printed book?
A graph is not a page order. A topological sort gives *a* valid order but not
a good one — it would scatter the Moon across three chapters. Probably needs a
hand-authored spine with the graph used only to catch violations.

### Age banding
Everything is currently `5-7`. Some concepts in the Space graph are clearly
older — light taking time to travel, we are made of old stars. Either widen the
band or split the atlas by age.

### Language
Is there a Ukrainian edition, and if so is it a translation or a parallel
original? Affects file layout now and nothing later, so worth an early answer.

---

## Notes from mapping

**The load-bearing roots.** Of 57 concepts, *distance makes things look smaller*
is upstream of 40 and *light travels in straight lines* of 37. Almost two-thirds
of a book about space rests on two facts that are not about space. If either is
taught badly, most of the rest cannot be rescued.

**The frontier.** 20 concepts have nothing depending on them yet. Those are
where the map stops, and where a second topic will most naturally attach.

### Shared roots across topics
`living-nature` repeats four ideas that `space` already has in its own words:
air being real, light travelling straight, nearer meaning warmer, and things
falling. They are deliberately separate concepts with separate ids for now,
because prerequisites still resolve inside one topic only. When cross-topic
prerequisites land, these are the first merge candidates.

### Is 111 concepts too many for one topic?
`living-nature` covers 98 questions and adds 12 foundations. It is twice the
size of `space`. Either that is the honest size of the subject, or the topic
wants splitting — plants and animals are nearly independent subgraphs.


---

## 2026-10 · Six topics, physics underneath

**Physics is a foundation, not a topic.** Water's three states hold up rain,
clouds, dew, frost, the fridge and the kettle. Writing them six times would
have meant six versions drifting apart. `03 physics` is 29 concepts and almost
nothing in it is interesting on its own — that is the point.

**Cross-topic prerequisites are on.** `[[topic/id]]` resolves across topics.
`pre` stays local so each atlas keeps its own layering; external prerequisites
are listed separately as *assumed known*. Ids must now be unique across the
whole project, and cycles are checked globally, not per topic.

**A chain is a reading order, and it is checked.** `content/03 - chains/`
holds one file per book; `npm run chain` fails if a concept is used before its
prerequisites. The first chain found five ordering problems in its own draft —
and one modelling error in the graph (`gravity-everywhere` did not need
`orbit-is-falling`; astronauts bouncing on the Moon prove it without orbits).

**`npm run select` proposes a book.** It scores concepts by how much of the map
leans on them and only takes what it can afford, prerequisites included.

**The chain is a screen, not just a check.** `/chains/` walks a reading order
step by step: the question as the child asks it *in that setting*, the concept
it teaches, and — the part worth the page — **the earlier steps it rests on**,
by number. The same rule `npm run chain` enforces is shown rather than printed,
so an order that leans forward is marked on the row that does it. The page also
counts what the walk does not reach: how little of each topic it uses, and the
55 doors it opens and leaves open.

---

## Open

### The load-bearing concepts are not the interesting ones
`npm run select 13` returns 68 concepts — the evolution engine, the physics
foundation, the space roots. Not one of them is a rainbow, a lightning bolt or
a mountain, because those are leaves and nothing depends on them. A book built
only from the selection would be a well-ordered textbook.

The tool now also lists what is **free to add**: 60 concepts whose prerequisites
the selection already covers. That is where the delight is, and choosing among
them is an editorial job, not an algorithmic one. Rough shape for book one:
the 68 as the spine, plus 20–30 chosen leaves.

### Living nature is twice the size of anything else
111 concepts against 24–32 elsewhere. Plants and animals are nearly independent
subgraphs and could split. Deferred until a second chain shows whether it
actually hurts.

### Nature and technology are thin in the selection
They came out at 6 and 10 against a budget of 13, because their prerequisites in
physics were already spent. Either raise the budget for them or accept that
book one is light on weather and machines.


---

## 2026-10 · Delights are part of the format

A chain step can be `kind: delight`, and `npm run chain` enforces that nothing
on the spine depends on one. That makes the definition exact: **a delight is a
step you could delete.** A set with none gets a warning.

Applied to `01 book-one`: all three sets were pure spine. Five delights added,
all of them already free — brakes hot after a descent, the lighthouse, walking
round the Earth, the stick as a sundial, and why a spinning planet does not
make you dizzy.

## 2026-10 · Three kinds of test, not one

Principle 5a. A thing you do, evidence you can find, or a consequence you can
follow. Only the first is an experiment, and all three are legitimate as long
as the child does the deciding. This was already true of the book — the giraffe
neck has always been settled by the third kind — it just had no name.

## 2026-10 · Society is in, with one topic-level caveat

`07 society`, 16 concepts: agreement, evidence, exchange, money, drift. Added
after the objection that humanities cannot be tested turned out to be wrong in
the interesting cases. Ten apples and twenty tokens is a real experiment, and
"if everyone had a million, who bakes the bread?" is a real refutation.

The genuinely valuable part is `separated-things-drift-apart`: the mechanism
behind species works unchanged on languages, dialects, recipes and borders. It
is the first place in the project where one idea does a second job in a
completely different material, and that is worth building a chapter around.

If it turns out not to fit the book, the topic is self-contained and five
cross-topic links — one `git rm -r` and a `npm run check`.
