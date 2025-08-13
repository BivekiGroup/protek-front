import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const robotsTxt = `User-agent: *
Allow: /

# Запрещаем индексацию служебных страниц
Disallow: /api/
Disallow: /admin/
Disallow: /dashboard/
Disallow: /_next/
Disallow: /static/
Disallow: /test-auth/

# Запрещаем индексацию страниц с параметрами
Disallow: /*?*

# Разрешаем основные страницы
Allow: /
Allow: /catalog
Allow: /about
Allow: /contacts
Allow: /news
Allow: /brands
Allow: /delivery
Allow: /payment
Allow: /wholesale
Allow: /vin

# Указываем карту сайта
Sitemap: https://protekauto.ru/sitemap.xml
`

  res.setHeader('Content-Type', 'text/plain')
  res.status(200).send(robotsTxt)
} 