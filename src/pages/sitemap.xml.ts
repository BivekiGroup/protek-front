import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL
    || `${(req.headers['x-forwarded-proto'] || 'https') as string}://${req.headers.host}`)
    .replace(/\/$/, '')

  // Включаем только публичные маркетинговые страницы
  const staticPages = [
    { url: '/', changeFrequency: 'daily', priority: 1.0 },
    { url: '/about', changeFrequency: 'monthly', priority: 0.8 },
    { url: '/contacts', changeFrequency: 'monthly', priority: 0.8 },
    { url: '/catalog', changeFrequency: 'weekly', priority: 0.9 },
    { url: '/news', changeFrequency: 'weekly', priority: 0.7 },
    { url: '/brands', changeFrequency: 'monthly', priority: 0.7 },
    { url: '/payments-method', changeFrequency: 'monthly', priority: 0.6 },
    { url: '/privacy-policy', changeFrequency: 'yearly', priority: 0.4 },
    { url: '/confidentiality', changeFrequency: 'yearly', priority: 0.4 },
    { url: '/wholesale', changeFrequency: 'monthly', priority: 0.6 },
    { url: '/vin', changeFrequency: 'monthly', priority: 0.7 },
    { url: '/search', changeFrequency: 'weekly', priority: 0.6 },
    { url: '/vehicles-by-part', changeFrequency: 'weekly', priority: 0.5 },
    { url: '/article-search', changeFrequency: 'weekly', priority: 0.5 },
  ] as const

  const nowIso = new Date().toISOString()

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  staticPages.map((page) => (
    `  <url>\n` +
    `    <loc>${baseUrl}${page.url}</loc>\n` +
    `    <lastmod>${nowIso}</lastmod>\n` +
    `    <changefreq>${page.changeFrequency}</changefreq>\n` +
    `    <priority>${page.priority}</priority>\n` +
    `  </url>`
  )).join('\n') +
  `\n</urlset>`

  res.setHeader('Content-Type', 'application/xml')
  res.status(200).send(sitemap)
}

