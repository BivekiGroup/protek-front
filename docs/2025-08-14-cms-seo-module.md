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

### Интеграция на фронт (план)
- Вынести meta-теги из `protekauto-frontend/src/lib/meta-config.ts` к запросу в CMS (по URL и приоритету совпадения), с кэшем.
- Учесть порядок приоритета: `EXACT` > `PREFIX` > `REGEX`.
