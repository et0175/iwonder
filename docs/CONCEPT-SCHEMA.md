# Concept file schema

One file per concept: `content/02 - concepts/<topic>/<id>.md`.
The filename must match the `id`. The validator enforces everything below.

```markdown
---
id: earth-ball                    # lower-case kebab-case; matches the filename
title: The Earth is a ball        # short label, used on the atlas map
proposition: >-                   # the concept stated as a full claim
  The Earth is a ball, which is why the ground has
  an edge you can never reach.
domain: Space                     # which field this belongs to, not which topic
topic: space
ages: 5-7
status: mapped                    # mapped | drafted | written | retired
prerequisites:                    # concepts that must land first. [[wikilinks]]
  - "[[far-small]]"               # so Obsidian's graph view works.
  - "[[straight-light]]"
opens:                            # onward questions. Domain is what they lead INTO.
  - question: Where does the Sun go in the evening?
    domain: Space
  - question: If I dig straight down, where do I come out?
    domain: Earth
---

## What they can see
The phenomenon. Concrete, observable without permission or equipment.

## What they ask
> The child's question, verbatim, as a blockquote.

## The experiment
What they do, with what. `_Not written yet._` while status is `mapped`.

## Watch out
The misconception or trap, if there is one. `_Nothing flagged yet._` if not.
```

## Field notes

**`title` vs `proposition`** — `title` is the handle you use in conversation
("the Earth is a ball"). `proposition` is the claim in full, including the
*because* or *which is why*. The atlas shows `title` on the map and
`proposition` in the detail panel.

**`domain`** — the field of knowledge, not the book topic. A concept in the
Space topic can have domain `Motion`, `Light` or `Perception`; most of the
foundational ones do. This is how you find out that your space book is mostly
a physics book.

**`prerequisites`** — direct prerequisites only. If A needs B and B needs C,
you usually do not also list C on A — but you may, when the article leans on C
in its own right. The validator lists such cases for review rather than
complaining. Prerequisites currently resolve within a single topic
(see `DECISIONS.md`).

**`opens`** — at least one, ideally three or four. The `domain` is what the
question leads *into*, which is how the "doors out" count is calculated. A
concept whose questions all stay in its own domain is usually a dead end.

**`status`**

| | Meaning |
|---|---|
| `mapped` | The concept and its place in the graph exist. No prose. |
| `drafted` | Phenomenon, question and experiment written. Not edited. |
| `written` | An article exists in `content/articles/`. |
| `retired` | Kept for history; excluded from the book. |

## What the validator checks

**Errors** (these fail the build)

- missing `id`, `title`, `proposition`, `domain`, phenomenon or question
- duplicate ids, or a filename that does not match its id
- a prerequisite pointing at a concept that does not exist
- a concept listed as its own prerequisite, or the same one listed twice
- a circular prerequisite chain, at any depth
- an unknown `status`
- a topic with no root concepts — meaning no way in

**Warnings** (advisory)

- no onward questions
- an onward question with no domain
- `status` past `mapped` but no experiment written
- `_topic.yml` naming fewer layers than the graph is deep

**Advisory** (listed, but neither an error nor a warning)

*Transitively implied prerequisites* — A lists both B and C, but B already needs
C. Often deliberate: an article can lean directly on *light travels straight*
even though its other prerequisite happens to imply it. Worth reviewing once,
then silence a file with `implied_ok: true` in its frontmatter.
