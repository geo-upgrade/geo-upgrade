# GEO POLL v1 — опрос «Откуда вы о нас узнали»

## Что сделано
1. **Виджет опроса** (одинаковый блок) вставлен на две страницы:
   - `contacts.html` — в конце секции «Передать задачу в лабораторию» (после формы и окна «Сигнал принят»);
   - `reviews.html` — в конце секции «Хотите стать первым?» (после формы отзыва, перед комментарием «ШАБЛОН ОТЗЫВА»).
2. **Графа в форму на контактах**: поле «Откуда вы о нас узнали?» (select, необязательное) сразу после выбора услуги. При выборе «Другое (свой вариант)» появляется текстовое поле. Выбор попадает в письмо в строке «Источник: …». Если человек уже голосовал в виджете — форма автоматически подставит его вариант.
3. В письмо заявки добавлена строка «Источник: …» — теперь каждое письмо несёт канал.

## Как считает голоса
Бесплатный публичный счётчик **Abacus** (abacus.jasoncameron.dev, без регистрации и ключей). Namespace: `geo-upgrade.ru`. Каждый вариант — отдельный счётчик. Один голос с устройства (localStorage `geo-poll-vote-v1`). Посмотреть текущие значения можно в браузере по ссылкам:

- poll1-ai: https://abacus.jasoncameron.dev/get/geo-upgrade.ru/poll1-ai
- poll1-search: https://abacus.jasoncameron.dev/get/geo-upgrade.ru/poll1-search
- poll1-vk: https://abacus.jasoncameron.dev/get/geo-upgrade.ru/poll1-vk
- poll1-tg: https://abacus.jasoncameron.dev/get/geo-upgrade.ru/poll1-tg
- poll1-social: https://abacus.jasoncameron.dev/get/geo-upgrade.ru/poll1-social
- poll1-daria: https://abacus.jasoncameron.dev/get/geo-upgrade.ru/poll1-daria
- poll1-blog: https://abacus.jasoncameron.dev/get/geo-upgrade.ru/poll1-blog
- poll1-maps: https://abacus.jasoncameron.dev/get/geo-upgrade.ru/poll1-maps
- poll1-friends: https://abacus.jasoncameron.dev/get/geo-upgrade.ru/poll1-friends
- poll1-freelance: https://abacus.jasoncameron.dev/get/geo-upgrade.ru/poll1-freelance
- poll1-other: https://abacus.jasoncameron.dev/get/geo-upgrade.ru/poll1-other

## Admin-ключи (для сброса или пересчёта)

| Ключ | admin_key |
|------|-----------|
| `poll1-ai` | 7a4ff958-8986-46b6-9339-9bda93e4f2c5 |
| `poll1-search` | dc0c7d22-e22c-49ae-9591-38b32441c68b |
| `poll1-vk` | 7d13139e-8566-40f4-a038-ffa7aa7337d7 |
| `poll1-tg` | 5334e38a-1fa4-4672-bd89-73e6c63487e3 |
| `poll1-social` | ddd44b10-b3d4-428f-9c61-11173ceb5d60 |
| `poll1-daria` | 808c6d52-51aa-4c78-b095-1599012e6eeb |
| `poll1-blog` | e59ac7da-86bf-42f4-a503-8df2446a3895 |
| `poll1-maps` | 1068ee9c-ee7e-4209-9611-2d46475d79cd |
| `poll1-friends` | 5d9a33e8-fda4-435e-94a5-91a17ba48768 |
| `poll1-freelance` | 17a26f99-9cc0-4979-9e96-fbaa7131dec8 |
| `poll1-other` | 763ccf76-742a-40c8-b176-fd331e2488de |

Сброс счётчика в 0:
```
curl -X POST "https://abacus.jasoncameron.dev/update/geo-upgrade.ru/poll1-ai?value=0" -H "Authorization: Bearer <admin_key>"
```

## Нюансы
- Счётчики публичные (unlisted): голоса теоретически можно накрутить прямыми запросами к API — для дешёвого теста каналов это приемлемо, отклонения будут видны на графике писем-заявок.
- «Другое (свой вариант)» в виджете увеличивает счётчик `poll1-other`; сам текст никуда не отправляется (в бесплатном счётчике нет хранилища текстов). Подробный вариант человек может дописать в форме на контактах — тогда он придёт письмом.
- Rate limit Abacus: 30 запросов / 10 с на IP. Виджет делает 11 чтений при попадании в экран + 1 голос — в лимит вписывается.
- Если сервис когда-нибудь закроется, счётчики просто «замрут» на текущих значениях; виджет покажет ошибку и не потеряет голоса в форме (поле «Источник» в mailto не зависит от счётчика).
- Тестовый namespace `geo-upgrade-test` (poll1-tg=1, poll1-other=2, poll1-vk=2) — мусор от проверки работоспособности, к реальным голосам отношения не имеет.
- После загрузки файлов на сервер проверьте: голосуйте в приватном окне, обновите страницу — увидите процентные полосы. На своём браузере сбросить голос можно очисткой localStorage (`localStorage.removeItem('geo-poll-vote-v1')`) — удобно для повторных тестов.

## Технические маркеры (для будущих правок)
- CSS: `<style id="geo-poll-css">` перед `</head>`, оба файла.
- Разметка: `<!-- GEO POLL v1: опрос … -->`, оба файла.
- Скрипт: `<script>`-блок с комментарием `GEO POLL v1` перед `</body>`, оба файла.
- Форма контактов: `<select id="source">`, `<input id="source-custom">`, обработчик с `sourceText`.
