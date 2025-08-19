import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const apiKey = process.env.DADATA_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'DADATA_API_KEY is not configured' })
  }
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const payload = {
      query: body?.query || '',
      branch_type: body?.branch_type || 'MAIN',
      type: body?.type,
      count: body?.count || 5,
      kpp: body?.kpp,
      status: body?.status,
    }
    const resp = await fetch('https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Token ${apiKey}`,
      },
      body: JSON.stringify(payload),
    })
    const data = await resp.json()
    if (!resp.ok) {
      return res.status(resp.status).json({ error: data?.message || 'DaData error' })
    }
    return res.status(200).json(data)
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Internal error' })
  }
}
