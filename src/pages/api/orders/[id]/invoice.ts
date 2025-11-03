import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Order ID is required' })
  }

  try {
    // Получаем токен из cookies или headers, либо используем clientId из заказа
    let token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '')

    // Если нет обычного токена, используем временный токен формата client_{orderId}
    // Это позволит скачать счёт сразу после создания заказа без авторизации
    if (!token) {
      // Используем orderId как clientId для временного доступа
      token = `client_${id}`
    }

    // Проксируем запрос на CMS API
    const cmsUrl = process.env.NEXT_PUBLIC_CMS_GRAPHQL_URL?.replace(/\/api\/graphql.*/, '') || 'http://localhost:3000'
    const invoiceUrl = `${cmsUrl}/api/order-invoice/${id}`

    console.log('📄 Requesting invoice:', { invoiceUrl, hasToken: !!token })

    const response = await fetch(invoiceUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to generate invoice' }))
      return res.status(response.status).json(error)
    }

    // Получаем PDF как буфер
    const pdfBuffer = await response.arrayBuffer()

    // Устанавливаем заголовки для PDF
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${id}.pdf"`)
    res.setHeader('Content-Length', pdfBuffer.byteLength.toString())

    // Отправляем PDF
    res.send(Buffer.from(pdfBuffer))

  } catch (error) {
    console.error('Error generating invoice:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
