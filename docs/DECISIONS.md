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

**2026-09 · Concepts are named by their idea, not their title.**
`title` is a handle for the author. The child only ever meets the question.

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
