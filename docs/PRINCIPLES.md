# Principles

Why the book is built this way. These are the rules an article is judged
against; when one of them is broken it should be on purpose and written down.

---

## 1. The concept is never named

The concept is a planning label, not a heading. A child does not want to read
about *axial rotation*; they want to know where the Sun goes at night. If a
child can repeat the concept's name but cannot predict what happens next, the
article has failed and merely sounds like it succeeded.

The test: **remove every abstract noun from the article. Does it still teach?**

## 2. The phenomenon must be visible without permission

Not "in a laboratory", not "on a clear night with a telescope", not "ask an
adult to help you". A shadow on the pavement. A ship at the horizon. The Moon
in a blue afternoon sky. If the child cannot get to the phenomenon on their
own, the article is about a fact rather than about the world.

## 3. The question is the child's, not the author's

*Why does the Earth rotate on its axis* is an adult's question wearing a child
costume. *Where does the Sun go in the evening* is a real one. The difference
is that the real question contains a wrong assumption worth dismantling.

Write questions down as children actually say them, including the grammar.

## 4. The wrong answer gets said out loud, by somebody likeable

Children already have an explanation. It is usually the intuitive one — the Sun
goes behind the hill, winter is when the Sun moves further away, the Moon is
eaten by the Earth's shadow. An article that never states that belief cannot
displace it; the child simply files the new information beside the old and
keeps both.

So the wrong answer is given by a character, sympathetically, before it is
tested. Being wrong must look survivable.

## 5. The experiment decides, not the narrator

The point of the experiment is not illustration. It is that the child's own
hands produce a result the wrong answer cannot account for. A torch on a slanted
sheet of paper settles the seasons; a paragraph asserting the seasons never
will.

Ordinary objects only — a ball, a torch, a stick, string, water, flour, a
coin. **If it needs buying, it needs rewriting.**

## 5a. There are three kinds of test, not one

Principle 5 says the experiment decides. In practice the book uses three
different ways of letting the child, rather than the narrator, settle it — and
it is worth naming all three, because only the first is an experiment.

**A thing you do.** A ball and a torch, a toy boat over a beach ball, ten
apples and twenty tokens. Strongest, and the default wherever it is possible.

**Evidence you can go and find.** You cannot repeat the formation of a
mountain, but you can look at seashells on its summit and at the growth rings
in a stump. This is how the past is tested — in geology as much as in history.

**A consequence you can follow.** "If giraffes stretched their necks, why has
mine not grown?" — nothing is done and nothing is found, but the wrong answer
still fails in front of the child. "If everyone got a million, who would bake
the bread?" is the same move.

The third is not weaker than the first; it is what makes the wrong answer
collapse rather than merely get contradicted. What all three share is that the
child does the deciding. **An article where the narrator decides has failed, no
matter which of the three it claims to use.**

## 6. Prerequisites are real constraints, not suggestions

An article whose prerequisites are not in place does not teach half of
something. It teaches nothing and leaves the child feeling stupid. The
prerequisite graph exists so that this is a build error rather than an opinion.

The corollary is uncomfortable and worth keeping: **some good articles cannot
be written yet.** The right response is to write the missing prerequisite, not
to soften the article.

## 7. Most doors lead out

The onward questions are not a "see also" list. They are the reason the book
exists: a child who has understood gravity should be wondering about birds,
balloons, swimming, and why their legs ache going uphill. Roughly half of the
onward questions should leave the topic entirely.

A topic is a launchpad. A book that keeps a child inside astronomy has
mistaken its own table of contents for the world.

## 8. Never lie in a simplification

Simplifying is choosing what to leave out, not replacing the truth with a
convenient falsehood. "Gravity is switched off in space" is a lie that has to
be unlearned later; "they are falling, and so is everything around them, so
nothing presses on anything" is true and no harder.

Anywhere the honest answer is genuinely too hard, the article stops and says
so. **"Nobody knows yet" and "that is a question for when you are older" are
both allowed, and both are better than a lie.**

## 9. Wonder is not decoration

The point is not to deliver facts wrapped in charm. It is that the world is
strange and that noticing is a thing you can get better at. An article that
ends with the child satisfied has done half the job; one that ends with them
looking at something ordinary differently has done all of it.


## 10. Every chapter needs something that is there purely for joy

A set made only of load-bearing concepts is a textbook with characters in it.
The project has the evidence: `npm run select 13` returns the sixty-eight most
load-bearing concepts in the whole map, and not one of them is a rainbow, a
lightning bolt or a spider's web — those are leaves, and nothing depends on
leaves.

So a chain marks some steps `kind: delight`, and the rule is that they must be
cuttable: nothing on the spine may depend on one. That makes them free to move,
free to drop and free to add — which is exactly why they can be chosen for
delight alone. One or two per set. `npm run chain` warns when a set has none,
and `npm run select` lists the leaves whose prerequisites a selection already
covers, which is where to shop for them.
