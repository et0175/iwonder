---
id: book-one
title: Book one
status: draft
# A chain is a reading order: one walk through the concept graph, held together
# by a setting rather than by subject. Every step names the concept the story
# teaches. `npm run chain` checks that nothing is used before its prerequisites.
sets:
  - title: Поїздка в машині
    setting: Дитина дивиться у вікно машини на трасі.
    steps:
      - concept: smooth-ride
        question: Ми їдемо? Я зовсім цього не відчуваю.
      - concept: motion-is-relative
        question: Чому дерево тікає від нас?
      - concept: far-small
        question: Чому дерево більшає, коли ми під'їжджаємо?
      - concept: parallax
        question: Чому дерево тікає швидко, а хмара майже стоїть?
      - concept: near-hot
        question: Чому біля вікна, куди світить сонце, тепліше?
      - concept: sun-far-huge
        question: Сонце не меншає і не відстає — воно що, їде за нами?

  - title: На березі
    setting: Море, горизонт, корабель, пісок і тінь від парасолі.
    steps:
      - concept: straight-light
        question: Як утекти від власної тіні?
      - concept: earth-ball
        question: Куди зникає човен за горизонтом?
      - concept: things-fall
        question: Чому все, що я відпускаю, падає вниз?
      - concept: down-is-center
        question: Чому люди на іншому боці Землі не падають?
      - concept: gravity-everywhere
        question: Земля тягне мене — чи я теж тягну Землю?

  - title: У саду
    setting: Вечір у саду, пересаджування квітів, кішка з кошенятами.
    steps:
      - concept: spin-world-slides
        question: Чому сад тікає по колу, коли я кручуся на місці?
      - concept: earth-spins
        question: Куди ввечері дівається Сонце?
      - concept: alive-or-not
        question: Якщо Земля рухається — вона жива?
      - concept: needs-to-live
        question: Що буде, якщо не поливати квітку?
      - concept: children-resemble-parents
        question: Чому з цієї насінини не виросте троянда?
      - concept: everyone-is-different
        question: Чому кошенята схожі між собою, але різні?
---

## Про цей ланцюжок

Перша версія — ваша, з документа «I wonder - books». Тут вона розкладена так,
щоб кожен крок спирався лише на те, що вже прозвучало раніше. `npm run chain`
це перевіряє.

Що змінилося проти чернетки, і чому:

- **«Як утекти від тіні» переїхало вперед**, у другий набір, перед човном.
  `earth-ball` спирається на нього: човен зникає знизу вгору саме тому, що
  світло йде прямо. Тінь мусить бути **до** човна, не після.
- **Додано `smooth-ride` і `motion-is-relative`** на початок. Ваш перший крок
  («дерево тікає») називав концепцію, якої в графі не було — я її дописала.
  Перед нею потрібен один крок: рівний рух не відчувається, тому й не можна
  сказати, хто саме рухається.
- **`far-small` переставлено перед `parallax`.** Щоб помітити, що близьке
  зміщується швидше за далеке, треба вже знати, що далеке виглядає меншим.
- **Додано `near-hot`** перед Сонцем. Сила аргументу «воно крихітне, але гріє
  цілий світ» тримається саме на тому, що ближче = тепліше.
- **Додано `things-fall`** перед «чому не падаємо». Не можна пояснити, **куди**
  тягне, поки не домовилися, що взагалі тягне.
- **Додано `spin-world-slides`** перед Землею, що обертається. Дитина, яка
  покрутилася на місці й бачила, як сад їде по колу, має власний доказ. Без
  нього «Земля обертається» — просто слова, які треба прийняти на віру.

Одну помилку ланцюжок знайшов не в собі, а в графі: `gravity-everywhere`
вимагала `orbit-is-falling`. Це було зайве — астронавти, що стрибають на
Місяці, доводять «у всього є тяжіння» без жодних орбіт. Передумову виправлено
на `things-fall`.
