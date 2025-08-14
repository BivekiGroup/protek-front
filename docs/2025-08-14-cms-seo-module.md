## CMS: модуль управления SEO (2025-08-14)

Добавлен раздел админки для управления SEO-конфигурациями всех страниц.

### Модель данных (Prisma)
- Файл: `protekauto-cms/prisma/schema.prisma`
- Модель: `SeoPageConfig`
  - `pattern: String` — путь/шаблон (например: `/about`, `/catalog`, `^/vehicle-search/.*$`)
  - `matchType: SeoMatchType` — `EXACT` | `PREFIX` | `REGEX`
  - Мета-поля: `title`, `description`, `keywords`, `ogTitle`, `ogDescription`, `ogImage`, `canonicalUrl`
  - Флаги: `noIndex`, `noFollow`
  - `structuredData: Json` — JSON-LD

Требуется миграция БД:
- `cd protekauto-cms && npx prisma migrate dev` (локально) или `npx prisma migrate deploy` (в проде)

### GraphQL (CMS API)
- Типы/инпуты: `SeoPageConfig`, `SeoPageConfigInput`, `SeoPageConfigUpdateInput`, `SeoMatchType`
- Запросы:
  - `seoPageConfigs(search, skip, take): [SeoPageConfig]`
  - `seoPageConfigsCount(search): Int`
  - `seoPageConfig(id): SeoPageConfig`
- Мутации:
  - `createSeoPageConfig(input): SeoPageConfig`
  - `updateSeoPageConfig(id, input): SeoPageConfig`
  - `deleteSeoPageConfig(id): Boolean`
- Файлы:
  - `protekauto-cms/src/lib/graphql/typeDefs.ts`
  - `protekauto-cms/src/lib/graphql/resolvers.ts`

### UI (админка)
- Раздел: `Dashboard → SEO`
- Страницы:
  - Список: `protekauto-cms/src/app/dashboard/seo/page.tsx` — поиск, список, удаление, переход к созданию/редактированию
  - Создание: `protekauto-cms/src/app/dashboard/seo/new/page.tsx`
  - Редактирование: `protekauto-cms/src/app/dashboard/seo/[id]/page.tsx`
- Навигация: пункт добавлен в сайдбар (группа «Система»)

### Интеграция на фронт (готово)
- Публичный эндпоинт CMS: `GET /api/seo-meta?path=/about`
  - Файл: `protekauto-cms/src/app/api/seo-meta/route.ts`
  - Возвращает `{ meta: { title, description, keywords, ogTitle, ogDescription, ogImage, canonicalUrl, noIndex, noFollow, structuredData } }`
  - Приоритет совпадений: `EXACT` > `PREFIX` (самый длинный) > `REGEX`.

- Автоподхват на фронте в `MetaTags`:
  - Файл: `protekauto-frontend/src/components/MetaTags.tsx`
  - При наличии `process.env.NEXT_PUBLIC_CMS_BASE_URL`, компонент на клиенте запрашивает CMS по текущему пути и перекрывает переданные пропсы.
  - `robots` формируется из `noIndex`/`noFollow`.

- Переменные окружения:
  - На фронте: `NEXT_PUBLIC_CMS_BASE_URL=https://cms.example.com`

- Фолбэк:
  - Если CMS недоступен или конфигурация не найдена, остаются статические значения, переданные через пропсы/утилиты (`getMetaByPath`).

- Примечание по SSR/SEO:
  - Текущая реализация выполняет запрос на клиенте. Для SSR-рендера тегов в HTML (для ботов) можно прокинуть мета-данные через `getServerSideProps`/`getStaticProps` страниц и передать их в `MetaTags` — API CMS совместим.
