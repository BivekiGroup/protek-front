## SEO: robots.txt и sitemap.xml — 2025-08-14

Обновили SEO-инфраструктуру фронтенда: добавили/переписали динамические `robots.txt` и `sitemap.xml`.

### Эндпоинты
- `GET /robots.txt` — отдаёт правила индексации для поисковых ботов.
- `GET /sitemap.xml` — отдаёт актуальную карту сайта.

### Базовый URL
- Используется `NEXT_PUBLIC_SITE_URL` (рекомендуется прописать в `.env`),
  иначе берётся из заголовков запроса: схема (`x-forwarded-proto`|`https`) + `host`.

### robots.txt
- Разрешаем: `/` (по умолчанию весь публичный контент).
- Блокируем служебные/приватные разделы:
  - `/api/`, `/_next/`, `/static/`, `/test-auth/`
  - `/profile`, `/profile-…`, `/favorite`
  - `/cart`, `/checkout`, `/order-confirmation`
- Блокируем URL с параметрами: `Disallow: /*?*`
- Добавляем:
  - `Sitemap: {siteUrl}/sitemap.xml`
  - `Host: {siteUrl}`

Файл: `src/pages/robots.txt.ts`

### sitemap.xml
- Формируется из набора публичных страниц (маркетинговые/каталог без личных разделов):
  - `/`, `/about`, `/contacts`, `/catalog`, `/news`, `/brands`,
    `/payments-method`, `/privacy-policy`, `/confidentiality`,
    `/wholesale`, `/vin`, `/search`, `/vehicles-by-part`, `/article-search`
- Для каждой страницы выставляем:
  - `lastmod`: текущее время
  - `changefreq`: разумные интервалы (daily/weekly/monthly/yearly)
  - `priority`: 1.0 для главной, ниже для остальных

Файл: `src/pages/sitemap.xml.ts`

### Проверка
- Dev: открыть `http://localhost:3001/robots.txt` и `http://localhost:3001/sitemap.xml`
- Prod: `https://{домен}/robots.txt` и `https://{домен}/sitemap.xml`
- Рекомендуется указать `NEXT_PUBLIC_SITE_URL=https://protekauto.ru` в окружении.

### Дальнейшие шаги (по желанию)
- Разбить sitemap на индекс и подкарты (бренды/новости/динамика).
- Добавить кеширование ответов (Cache-Control) на уровне Next/CDN.
