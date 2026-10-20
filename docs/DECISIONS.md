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


---

## 2026-10 · Tested on a reader, and the reader found a gap

«Дивак оселяється» прочитано восьмирічній дитині. Два результати, обидва
структурні.

**Дитина поставила власний дослід.** Після розділу про танці вона пішла
перевіряти, чи можна нагріти воду, просто швидко її мішаючи. Вийшло ледь-ледь
— що є правильним результатом: це дослід Джоуля, і на нього свого часу пішли
роки й дуже точний термометр.

Важливо, звідки вона його взяла. Історія стверджує дві речі: температура — це
швидкість руху частинок, і ніщо не нагрівається саме по собі без того, хто
штовхає. З них одне випливає: якщо штовхати самому — має нагрітися. Дитина
пройшла цей висновок сама.

**І концепції, яку вона перевірила, у графі не було.** «Температура = швидкість
руху частинок» згадувалася всередині відповіді `hot-and-cold-even-out`, але
власного вузла не мала. Тепер має — `heat-is-how-fast-the-bits-move`, і дослід
дитини записано в нього як `## The experiment`, разом із попередженням, що
ледь помітний результат тут не невдача.

Висновок про метод: **перевірка на дитині знаходить дірки в графі, яких не
знаходить жоден обхід графа.** Варто читати кожну історію вголос до того, як
вважати тему змапованою.

## 2026-10 · `seeded`: висновок без механізму

Переробка ввела прийом, якого в інструментах не було: «навіщо ми пітніємо»
розказано в історії, де немає випаровування. Функцію встановлено свідченням
(гарячка, мамина радість), механізм свідомо відкладено й записано в блокнот
професорки Ади.

Тепер це вид сходинки: `kind: seeded` з обов'язковим `defers:`. Передумови для
неї не вимагаються — нічого ж не пояснюється. Натомість ведеться реєстр боргів:
відкладений механізм, який не з'являється в жодному ланцюжку, помічається як
`owed`. Обіцянка читачеві, яку ніхто не збирається виконувати, має бути видно.

Зараз не повернуто три: `burning-needs-air`, `evaporation-is-invisible`,
`skin-is-the-biggest-organ`.

## 2026-10 · Баг, який ховався від початку

Лоадер ланцюжків викидав зі сходинки все, крім `concept` і `question`. Отже
`kind: delight` не доходив до сайту жодного разу відтоді, як був уведений —
перевірка `npm run chain` його бачила, сторінки ні. Знайдено тільки тому, що
`seeded` мав помітний ефект у збірці.

## 2026-10 · Блокнот Ади: борги мають власний розділ

Реєстр боргів був тільки в терміналі (`npm run chain`). Тепер він — сторінка
сайту, `/notebook/`, і названа блокнотом професорки Ади, бо це рівно він і є.

Кожен борг показує: що відкладено, хто позичив (ланцюжок і сходинка, з
посиланням), що потрібно знати раніше, щоб його взагалі можна було пояснити,
і — якщо повернуто — де саме. Неповернуті стоять першими. Це не декор:
неповернутий борг означає, що дитині сказали «так є» і не сказали «чому», і
список таких місць має бути однією сторінкою, а не рядком у логу збірки.

Передбачається, що в кожній історії буде по кілька відкладень, тому розділ
росте разом з книгою.

## 2026-10 · Глави йдуть одна за одною: `follows:`

Нульова історія тріщала: дванадцять розділів і п'ять вечорів в одному. Коло з
гітарою вийшло з неї у власну главу, і відразу стало видно, чого не вмів
інструмент: нова глава спирається на `air-real`, якого в ній немає.

Тепер у ланцюжка є поле `follows:` — глава (або кілька), яку читач уже пройшов.
Її концепції вважаються відомими: на них можна спиратися, не навчаючи заново.
Що з цього випливає:

- `npm run chain` більше не вимагає, щоб кожна глава починалася з нуля;
- концепція, пройдена двічі, — попередження, а не помилка: це може бути
  свідома відсилка (у «Поїздці» так зроблено з `near-hot`);
- **правило цікавинок перестало зупинятися на межі глави.** Спина наступної
  глави не може спиратися на вирізну сходинку попередньої — бо якщо ту
  вирізати, завалиться наступна. Перший випадок знайшовся відразу: сухарик
  спирається на ложку, а ложка — цікавинка. Сухарик зроблено цікавинкою теж.

Відкрите питання: **чим тепер є «Book one».** Його перший набір — та сама
поїздка в машині, що тепер є окремою главою. Або book-one стає переліком глав,
або глави лишаються чернетками його наборів. Поки що вони дублюються, і
`follows:` у book-one свідомо не поставлено, щоб не робити вибір за автора.

## 2026-10 · Калюжа повернула борг

«Поїздка в машині» починається з `evaporation-is-invisible` — рівно того
механізму, який нульова історія позичила на пітніння. У блокноті Ади стало на
один рядок менше: два винні, два повернені.

Нова концепція `drying-is-not-melting` (сухарик у духовці) з'явилася звідти ж:
ложка дала плавлення, калюжа — випаровування, а різниці між ними не мав ніхто.
Автор сумнівалася, чи це питання «точно наукове» на торті — на сухарику воно
точне: там відбувається рівно одна річ, і вона видна на вагах.

## 2026-10 · Три рівні: історія — глава — книга

Рішення Олі: **книга — це 60–100 історій, об'єднаних у глави**, перша глава —
«Дивак заселяється». Отже одна історія = одне питання = одна сходинка
ланцюжка; глава = ланцюжок; книга = впорядкований список глав. Записано в
`docs/STRUCTURE.md`.

Головне, що з цього зроблено в інструментах: **порядок глав живе в одному
місці** — `content/03 - chains/_book.yml`. Глава не знає свого номера й не
називає попередницю; вона просто спирається на все, що пройдено до неї.
Перетасувати книгу — переставити рядки в одному списку, і перевірка порядку
перераховується сама. Поле `follows:` лишилось для ланцюжків поза книгою.

Звідси й відповідь на відкрите питання про «Book one»: він **не глава**, а пул
відбору. У `_book.yml` його немає, і ніщо в книзі не має права на нього
спиратися. «На березі» та «У саду» — найближчі кандидати стати главами.

Зараз: 3 глави, 25 історій з 60. 35 бракує, і вони вже є в графі — питання
тільки, які саме (`npm run select`).

## 2026-10 · Чим тримається коротка історія (ВІДКРИТЕ)

Глави вийшли різні за довжиною — 12, 4, 9 історій. Рішення автора: **не тягнути
навмисно**. Але тоді коротка історія мусить чіпляти чимось, окрім обсягу, а
частина концепцій не дивує зовсім («біля духовки тепліше, ніж далі»).

Записано як відкрите, бо ще не випробуване на дитині.

**Спостереження, з якого все почалось.** У секції про духовку вже є те, чого
бракувало в формулюванні концепції: «Я йшов рівно, але тепло не зростало».
Гачок не у факті, а в **зламаному передбаченні** — дитина йде рівними кроками
й очікує рівних порцій тепла. Це і є справжній зміст `near-hot`, і він
перевіряється кроками й рукою. Перенесено в сам файл концепції, у `## The
experiment` і `## Watch out`.

**Чим чіпляти, коли подиву немає.** Чотири речі, і жодна не потребує довжини:

1. **ставка** — хтось чогось хоче; Нота лягла на кахлі, а не на килим;
2. **власна правота** — дитина ризикує здогадкою і має рацію (мішання води:
   там не було подиву, була влада над світом — сильніше за подив);
3. **знайоме стає дивним** — нуль нових фактів, переоцінка старих («виходить,
   ложці в кімнаті холодно»);
4. **Дивак** — коли нема чим зачепити, чіпляє те, що хтось сказав це вголос
   неправильно.

**Що з цього випливає для довжини.** Не кожна концепція заслуговує на власний
розділ. У першій главі 9 розділів прози на 12 концепцій: розчинення,
температура плавлення й утримування температури їдуть пасажирами всередині
сусідніх розділів. Власний розділ концепція отримує, якщо має хоч одне з
трьох — **подив, перевірку з видимим результатом або ставку**. Інакше вона
пасажир. Короткі глави тоді не треба тягнути: у них просто менше розділів.

**Відкладено (не зроблено свідомо).** Сайт рахує історії за сходинками (25),
хоча розділів менше. Можна додати сходинці поле `story:` — кілька сходинок з
однаковим значенням = один розділ; тоді ціль 60–100 стосуватиметься розділів,
і стане видно зворотне: чи не їде пасажиром щось несуче, що мало б мати власну
перевірку. Поки лишено як є.

## 2026-10 · Одна історія — один файл

Розбито: глава була одним файлом прози, тепер це папка з файлами на історію.

```
content/stories/00 strange-moves-in/03 spoon.uk.md
```

Номер у назві — для файлового браузера, `.uk` — мова, решта — id історії.
У фронтматері: `chapter`, `concepts` (одна історія може нести кілька — саме так
живуть «пасажири»), `title` (він же питання в обставинах), `status`.

**Чого там свідомо немає — попередньої й наступної.** Порядок уже є в главі,
один раз; «попередня-наступна» обчислюються з нього, як номер глави з
`_book.yml`. Переставити історію — одна правка в ланцюжку, а не чотири в
чотирьох файлах. Номери в назвах файлів ні на що не впливають; якщо вони
розійдуться з ланцюжком, збірка про це скаже, а переможе ланцюжок.

**Главу досі можна читати цілою** — `/chapters/<id>/`: ті самі файли, зшиті в
порядку ланцюжка, зі змістом на початку. Тобто файл — одиниця роботи, глава —
одиниця читання. Посилання на неї є зі сторінки ланцюжка й з кожної історії.

Що з цього одразу стало видно: 15 історій, 12 з них у главах, і стан кожної
окремо — замість одного `draft` на всю главу. Також видно зворотне: скільки
концепцій глави ще без прози (зараз нуль в обох написаних главах).

Обсидіан не ставимо: репозиторій і далі звичайний markdown, а граф, зворотні
посилання й навігацію дає сайт. Рішення автора — не плодити сутностей.

## 2026-10-18 · Три читачі першої глави (ВІДКРИТЕ)

Оля переписала «що всередині торта», додала туди Дивака, вставила посередині
нову історію про чайник і переписала «чому не обігріло кімнату» — тепер не
духовка, а чайник, і з кремом на торті замість кроків від духовки. Прочитала
дочці Саші (8) і чоловікові. Що з цього вийшло — три реакції, і всі три варті
того, щоб лишитись записаними.

**Саша: «чайник вибухне, а не зможе обігріти кімнату».** Відповідь не на те
питання, яке ставила історія: дитина лишилась із чайником, а не перейшла в
кімнату. Це і про перехід, і про те, що «вибухне» — справжнє наступне питання
(закрита посудина, тиск; у графі є `air-pushes-from-all-sides` і
`pressure-depends-on-area`). Записати як питання Саші.

**Саша: «крем хтось з'їв, бо інакше куди ж він подівся».** Це не нудьга, це
альтернативна гіпотеза — дитина всередині задачі. Але вона ж і показує, що
премиса «крем розділили точно» не викликала довіри: якщо порівну, то хтось
забрав.

**Саша: «чому нас нагріває чай» — і хочу твою історію, не гугл, я почекаю.**
Найсильніше свідчення за весь проєкт: дитина просить форму, а не відповідь.
У графі це `hot-and-cold-even-out`, **нуль передумов** — історію можна писати
просто зараз.

**Чоловік: цікавіше, чому деякі народи п'ють гарячий чай, щоб охолонути в
спеку.** Це те саме питання з іншого боку: `hot-and-cold-even-out` +
`sweat-cools-by-evaporating` (уже розказане в першій главі). Два питання —
«чому чай гріє» і «чому чай холодить» — варті **однієї** історії, де обидва
виявляються правдою.

**Чоловік: «маразм розділяти крем».** Механізм (однакові кроки від центру —
кільця стають більшими — того самого крему не вистачає) — найкраща перевірка
`near-hot`, яка в книзі взагалі траплялась: її робиш руками й бачиш результат.
Штучна в ній не ідея, а мотивація: ніхто не ділить крем на блюдця, і текст це
сам визнає («тут точність ні до чого — це не науковий експеримент, а просто
торт»). Пропозиція: нічого не ділити й не важити. Кіра просто мазала від
середини, однаково товсто, і до зовнішнього кільця крем закінчився. Нестачу
відкривають, а не конструюють; нитка від центру до краю доводить, чому; ложечка
Дивака лишається жартом, бо однією ложечкою ціле кільце не з'їсти.

**Чого ще немає у графі.** Найкраще в чайниковій історії — «гарячішою вода вже
не стане, вона просто піде парою». Вузла немає; передумови (`three-states`,
`heat-is-how-fast-the-bits-move`) пройдені в першій главі.

**Зроблено з цього (18.10):** додано вузол `water-cannot-get-hotter` («гарячіше
не буде — буде менше») і сходинку до першої глави, між тортом і кімнатою; у
ланцюжку `near-hot` переїхав після торта, і його питання тепер про чайник, а не
про духовку. Обидва питання Саші записані в граф як відчинені двері:
«чому нас нагріває чай» — на `hot-and-cold-even-out`, «що заважає чайнику
вибухнути» — на новому вузлі (формулювання чернеткове).

Передумов для чайної історії Саші справді бракує: немає вузлів на
**терморецептори шкіри** («шкіра відчуває не тепло, а зміну») і на
**розширення судин** («кров розносить тепло до шкіри»). У `human-body` є
`skin-is-the-biggest-organ`, `blood-is-the-delivery-service` і
`nerves-carry-messages`, але саме цих двох немає. Поки не додано.

Питання чоловіка («чому гарячий чай у спеку охолоджує») не вимагає переписувати
історію про пітніння: язик Ноти несучий, і саме його дитина запам'ятала.
Пропозиція — поставити чай у спеку в пляжну главу, де спека справжня: термос із
гарячим чаєм на піску. Там воно стоїть на `sweat-cools-by-evaporating` (перша
глава) і `hot-and-cold-even-out`, і закінчується питанням Саші, а не відповіддю
на нього.

## 2026-10-18 · Друга переробка першої глави внесена

Три секції Олі перенесено дослівно (перевірено хешем проти .docx):

- `04 cooling-cake.uk.md` — торт, війна борошна з цукром, танець, чай як мірка;
- `05 kettle.uk.md` — **нова**, «навіщо вимикається чайник»: гарячіше не буде,
  буде менше;
- `06 kettle-and-room.uk.md` — кімната з кремом і ложками 1-3-5-7.

Файли перенумеровано під порядок ланцюжка (`04 oven-and-room` став
`06 kettle-and-room`), бо чайник тепер стоїть між тортом і кімнатою.

**Чайниковий вимикач вийшов не боргом, а дверима.** Ада записала в блокнот
«як вимикається чайник», висновку діти не зробили — отже це не `seeded`, а
відчинене питання. Записано як `opens` на `water-cannot-get-hotter` з
`leads_to: kettle-knows-when-to-stop`; дослід для тієї майбутньої історії
(кипіти з відкритою кришкою) уже лежить у самому вузлі.

**Що знадобилось поправити в моєму тексті.** Танець переїхав у секцію про торт,
тому «кімната, що кружляє» більше не може починатися з «а давайте потанцюємо».
Тепер вона починається з «торт з'їли майже весь, і музику ввімкнули знову» —
дві мої репліки, не Олині.

**Що в блокноті Ади в самій історії ширше, ніж на сторінці `/notebook/`.**
У тексті вона записує і борги, і просто питання («навіщо вимикається чайник»,
«чому не обігрів кімнату»). Сторінка показує тільки борги; відчинені двері
живуть на сторінці глави. Можливо, варто звести їх в одне місце — відкрито.

## 2026-10-19 · Блокнот Ади — колекція, а не реєстр

Правило Олі: Ада **колекціонує питання, які їй подобаються**, і ніколи їх не
викреслює. Питання лишається в блокноті і після того, як на нього відповіли —
відповідь пишеться поруч, а не поверх. Блокнот виходить тоді, коли питання варте
того, щоб його мати, а не тоді, коли воно без відповіді.

Звідси два наслідки для прози, записані у файл Ади:

- **про запис не повідомляють щоразу** — це нудно, і від цього нічого не
  залежить: читач може вважати, що вона записала тихо, що питання в неї вже є,
  що історія це просто опустила, або що питання їй не дуже сподобалось;
- **блокнот нічого не пояснює.** Репліки «я нічого не записую, ви вже все
  перевірили самі» бути не може — вона робить із блокнота трекер відкритих
  відповідей.

Виправлено в трьох місцях, де я це порушив: кінцівка «кімнати, що кружляє» (та
сама репліка), і два викреслювання в «Поїздці в машині» — тепер у калюжі Ада
просто закриває блокнот («рядок лишився, де був»), а на стоянці записує нове
питання Кіри «куди подівся весь той рух?».

Сторінка `/notebook/` перейменована: тепер це **Borrowed mechanisms**, у
навігації — «Debts», і в ліді сказано прямо, що це бухгалтерія авторів, а не
блокнот Ади.

## 2026-10-19 · Два різні питання в одному обертанні

`spin-world-slides` відповідає на те, що кімната тікає **поки** крутишся — і
саме це потрібне потім для обертання Землі: твоє обертання і біг кімнати це одна
подія з двох місць.

Те, що кімната їде **після** зупинки, — інше питання з іншим механізмом:
півколові канали внутрішнього вуха заповнені рідиною, рідина згинає волоскові
клітини, і коли тіло стає, рідина за інерцією ще рухається. Знайшла Оля.

Вузла на рівновагу в графі немає, тому це лишилось **відчиненими дверима**: в
історії Макс і Кіра це питання ставлять і не відповідають на нього, Ада забирає
його в колекцію. Механізм записаний у `## Watch out` вузла, щоб не змішували.

Історію переписано під це: тепер діти перелічують, що саме пролітає (двері,
вікно, Нота, знову двері), крутяться в інший бік і отримують той самий перелік
навпаки, а Нота — контроль, бо для неї кімната стоїть.
