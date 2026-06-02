Вот исчерпывающий сравнительный анализ по всем релевантным провайдерам.

---

Что конкретно нужно Darrow Code
Система Нужно для модулей
Western natal (планеты, дома, аспекты, ASC, MC) CORE, LOVE, MONEY, BODY, STYLE, PLACE
Текущие транзиты YEAR
Bazi Four Pillars (Day Master, элементы) Все модули
Numerology Уже есть в коде — API не нужен

---

Все актуальные провайдеры

1. FreeAstroAPI — freeastroapi.com ⭐ Рекомендую
   Swiss Ephemeris engine, Western natal, transits, synastry — и полноценный Bazi Four Pillars с Day Master strength, Shen Sha Stars, 12 Life Stages, Luck Pillars. FreeAstroAPI
   Bazi endpoint: POST /api/v1/chinese/bazi — возвращает Day Master, Ten Gods, element balance, взаимодействия столпов и звёзды. FreeAstroAPI
   Pricing: 50 бесплатных запросов в день, или 50,000 запросов за $15/месяц. Roxyapi
   Почему лучший выбор для Darrow Code:
   • Western + Bazi в ОДНОМ API — один ключ, одна интеграция
   • Самый дешёвый из серьёзных: $15/мес = ~$0.0003 за вызов
   • При 500 заказов/мес = ~$0.50 в API costs
   • Swiss Ephemeris = та же точность что astro.com использует под капотом
   • Чистый JSON, TypeScript-friendly

---

2. AstrologyAPI.com — json.astrologyapi.com
   Планеты, дома, аспекты, полный Western natal — plus transits engine, AstroCartoGraphy, synastry, progressions. Есть MCP сервер для прямого подключения к Claude. Astrologyapi
   Credits-based pricing — 50 бесплатных credits на signup, затем платишь только за использование. Нет lock-in, можно pause в любой момент. Astrologyapi
   Оценка для Darrow Code: хороший выбор для Western, но Bazi у них базовый. Дороже FreeAstroAPI при том же coverage.

---

3. RoxyAPI — roxyapi.com
   Все 10 планет, 12 домов (Placidus, Koch, Whole Sign, Equal), аспекты, ASC, MC. Верифицирован против NASA JPL Horizons. Roxyapi
   Pricing: $39/месяц за 5,000 запросов через 8 доменов. Roxyapi
   Оценка: Качественный, но дороже и без Bazi. Имеет смысл для Phase 2 (Tandem/синастрия) где важна высокая точность.

---

4. DivineAPI — divineapi.com
   300+ endpoints, Swiss Ephemeris, Western и Vedic, 99.9% uptime, 72ms response. 125+ white-label PDF типов. DivineAPI
   Оценка: Мощный но complex. Их сила — Vedic астрология. Для Western + Bazi это overkill с лишними costs.

---

5. Astrology-api.io
   Самый широкий набор — natal, synastry, composite, transit, solar/lunar returns, progressions, 23 house systems. Отдельный Bazi/Luck Pillars API. Astrology API
   $99/мес за 3 млн запросов — самая низкая цена per-call при объёме. Astrology API
   Оценка: Интересен для scale, но требует двух отдельных API keys (Western + Chinese). На MVP лишняя сложность.

---

Про astro.com специально
Astro.com (Astrodienst) — это reference tool, не developer API. Они генерируют chart images (SVG) и human-readable PDF, не structured JSON для AI processing. Есть Astrologer API на RapidAPI (astrologer.p.rapidapi.com) который использует Kerykeion engine и даёт AI-optimized XML context для natal charts, synastry, transits — но это XML, не JSON, и требует parsing. Не подходит как primary source для Darrow Code. GitHub

---

Финальная рекомендация
MVP (сейчас, до launch):
FreeAstroAPI — один API, два ключевых endpoint:
Western: POST /api/v1/natal/calculate
Bazi: POST /api/v1/chinese/bazi
Стоимость: $15/мес. При любом разумном launch volume — практически бесплатно.
Phase 2 (после первых 100 customers):
Добавить RoxyAPI или astrology-api.io для синастрии (LOVE Tandem модуль) — там нужна более сложная inter-chart механика.

---

Что делать прямо сейчас

1. Зайди на freeastroapi.com → Sign Up → используй бесплатный tier для тестирования
2. Проверь два endpoint'а с реальными тестовыми данными прямо в их docs:
   o Natal для даты 1990-05-15, 10:00, Bratislava
   o Bazi для той же даты
3. Покажи мне реальный JSON ответ — я проверю достаточно ли данных для всех 7 модулей Darrow Code
4. Если ок — покупаешь план $15/мес и даёшь Lovable ключ как ASTROAPI_KEY
   Lovable сможет имплементировать провайдер за 1 день после того как ключи есть.

FreeAstroAPI Key
6e6b9341903735caf82750f4026b6b2a24e13336c104f70951abdb051fd9d220
