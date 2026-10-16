---
id: strange-moves-in
title: Дивак оселяється
status: draft
ages: [5-7, 8-10]
# Склад глави. Історія, яка не називає свого, успадковує цей.
characters: [strange, nota, max, kira, professor-ada]
# Olia's rewrite, Oct 2026, after testing on an eight-year-old. Her structure,
# not the original draft's — eleven questions over one evening instead of nine.
# Two steps are `seeded`: the conclusion is established by evidence, and the
# mechanism is handed to Professor Ada's notebook instead of being explained.
sets:
  - title: Новосілля
    setting: Порожній будинок, що гуде. Коробка з кульками. Дивак і Нота.
    steps:
      - concept: air-real
        question: Що збільшує повітряну кульку, якщо вона порожня?

  - title: Торт
    setting: Професорка Ада просіює борошно. Вежа з цукрових кубиків на столі.
    steps:
      - concept: everything-is-made-of-bits
        question: Куди зникає цукор у чаї?
      - concept: dissolving
        kind: delight
        question: Чому цукор розходиться, а пісок осідає?
      - concept: three-states
        question: Чому ложка не розчиняється в чаї?
      - concept: everything-has-a-melting-point
        kind: delight
        question: А камінь може розплавитись? Тоді чому ложка зараз тверда?
      - concept: near-hot
        question: Чому духовка не обігріла всю кімнату?
      - concept: heat-is-how-fast-the-bits-move
        question: Що відбувається всередині торта, поки він холоне?

  - title: Танці
    setting: Музика з телефона, кульки, паровозик. Нота стрибає з усіма.
    steps:
      - concept: spin-world-slides
        kind: delight
        question: Чому кімната їде, коли я вже стою?
      - concept: energy-comes-from-somewhere
        kind: seeded
        defers: [rubbing-makes-heat, burning-needs-air]
        question: Чи може щось нагрітись саме по собі?
      - concept: keeping-temperature
        question: Чому нам стало жарко, якщо духовка давно охолола?
      - concept: sweat-cools-by-evaporating
        kind: seeded
        defers: [evaporation-is-invisible, skin-is-the-biggest-organ]
        question: Навіщо ми пітніємо?
      - concept: panting-cools
        question: Кому Нота показує язик?

---

## Про цей ланцюжок

Переписаний варіант Олі, жовтень 2026, після читання восьмирічній дочці.
Одинадцять питань замість дев'яти, і три з них — нові для графа.

**Що додалося в граф через цю історію:**

- `heat-is-how-fast-the-bits-move` — температура як швидкість руху частинок.
  Її не було зовсім: вона згадувалась усередині відповіді `hot-and-cold-even-out`,
  але власного вузла не мала. Саме її дитина перевірила потім сама.
- `everything-has-a-melting-point` — була лише онward-питанням у `three-states`.
  Розділ про ложку, яка мерзне в гарячому чаї, зробив її концепцією.
- `a-hollow-body-makes-it-louder` — резинка на бляшанці. Теж не було.

**Дві сходинки позначені `seeded`.** Там висновок встановлено, а механізм
свідомо відкладено й записано в блокнот професорки Ади. Це не недогляд: саме
так воно й працює в тексті, і саме тому «навіщо ми пітніємо» вдалося розповісти,
не пояснюючи випаровування.

**Передумову `three-states` виправлено.** Вона вимагала `hot-and-cold-even-out`,
хоча три стани спершу спостерігають, а вже потім пояснюють. Текст пройшов повз
цю передумову й нічого не зламав — отже, вона була зайва.

**«Танці» — дірка, яку знайшли двічі з різних боків.** `npm run chain` каже,
що це єдиний набір без жодної цікавинки. Восьмирічна читачка сказала, що в
танцях немає Дивака. Це та сама дірка: він з'являється там одним рядком
масовки й не має жодного свого моменту.

Відрізок і так найщільніший — чотири сходинки, дві з відкладеним механізмом.
Цікавинка, якої бракує, має бути його: щось, що він робить або каже посеред
танців, ні на що не впливає і що можна викреслити.
