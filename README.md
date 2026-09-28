# GEO-Апгрейд — пакет правок по чек-листу LAB-20 (2026-09-28)

Прогон сайта по протоколу из статьи «Технический GEO-аудит: 20 проверок». Исправлены пункты,
которые можно поправить без вашего участия. Реквизиты (LAB-16) и UTM-метки (LAB-17) — не тронуты,
вы отложили их на позже.

## Что загружать

### В корень сайта (переписать существующие файлы):
| Файл | Что изменено |
|------|--------------|
| reviews.html | + og:image, twitter:card → summary_large_image |
| mentions.html | + og:image, twitter:card → large; description сокращён с 198 до 128 симв. (meta + og:description синхронно) |
| cases.html | + og:image, twitter:card → large; description сокращён с 214 до 157 (убрана пометка [зашифровано]) |
| faq.html | + og:image, twitter:card → large |
| brand-visibility.html | + og:image, twitter:card → large |
| ai-policy.html | + og:image, twitter:card → large |
| privacy.html | + meta description (было пусто), + og:description (было пусто), + JSON-LD WebPage |
| about.html | description расширен с 63 до 160 симв. (meta + og:description) |
| contacts.html | description расширен с 67 до 166 симв. (meta + og:description) |
| blog-post-digital-ghost.html | description сокращён с 174 до 162 (meta + og:description) |
| blog-post-local-visibility.html | description сокращён с 180 до 152; в виджете «Вскрытие AI-ответа» 3 заголовка h4 → h3 (иерархия h2→h3, CSS-селектор .aut-doc h4 → h3 обновлён) |
| blog-post-alice-ai-foundation.html | description сокращён с 176 до 150 (meta + og:description) |
| blog.html | виджет «Термин дня»: пустые h3/p/chips заполнены дефолтным термином GEO — теперь заголовок не пустой в HTML, JS при загрузке заменит на термин дня |
| blog-post-what-is-geo.html | + блок «Похожие материалы» (3 статьи + блог) — статья больше не вне кластера |
| blog-post-ai-avtomatizaciya-dlya-marketinga.html | + блок «Похожие материалы» (3 статьи + блог) — статья больше не вне кластера |
| blog-post-what-is-geo.md | md-версия синхронизирована: + раздел «Похожие материалы» |
| blog-post-ai-avtomatizaciya-dlya-marketinga.md | md-версия синхронизирована: + раздел «Похожие материалы» |
| favicon.ico | НОВЫЙ файл (раньше 404): сгенерирован из logo-round-min.png, 16/32/48 px, 8,8 КБ |

## Проверки, которые пакет прошёл
- html5lib strict: 0 ошибок на всех 15 страницах
- JSON-LD: валиден на всех страницах, старые блоки не изменены (в privacy добавлен WebPage)
- Все <script> JS: байт-в-байт совпадают с живыми версиями
- Внутренние ссылки в новых блоках: ведут на существующие страницы
- gzip: изменения +3…+427 байт (наибольший прирост — what-is-geo из-за нового блока ссылок)

## Что осталось вне пакета (по вашему решению)
- LAB-16: реквизиты (ИНН, ОГРН, телефон в футере всех страниц)
- LAB-17: UTM-метки + Яндекс Метрика
- Ручные замеры: PageSpeed Insights (FCP/LCP/INP) и просмотр на реальном смартфоне
