import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    || `${(req.headers['x-forwarded-proto'] || 'https') as string}://${req.headers.host}`

  const robotsTxt = `User-agent: *
Allow: /

# Запрещаем индексацию служебных страниц
Disallow: /api/
Disallow: /admin/
Disallow: /dashboard/
Disallow: /_next/
Disallow: /static/
Disallow: /test-auth/

# Приватные и корзина/чекаут
Disallow: /profile
Disallow: /profile-
Disallow: /favorite
Disallow: /cart
Disallow: /checkout
Disallow: /order-confirmation

# Запрещаем индексацию страниц с параметрами
Disallow: /*?*

# Указываем карту сайта
Sitemap: ${siteUrl.replace(/\/$/, '')}/sitemap.xml
Host: ${siteUrl.replace(/\/$/, '')}
`

  res.setHeader('Content-Type', 'text/plain')
  res.status(200).send(robotsTxt)
}

