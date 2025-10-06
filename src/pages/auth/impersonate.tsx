import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

const decodeClientPayload = (encoded: string) => {
  if (typeof window === 'undefined' || typeof window.atob !== 'function') {
    throw new Error('Декодирование недоступно в этом окружении')
  }

  const binary = window.atob(encoded)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))

  if (typeof TextDecoder === 'undefined') {
    const escaped = Array.from(bytes)
      .map((value) => `%${value.toString(16).padStart(2, '0')}`)
      .join('')
    const json = decodeURIComponent(escaped)
    return JSON.parse(json)
  }

  const decoder = new TextDecoder()
  const json = decoder.decode(bytes)
  return JSON.parse(json)
}

const ImpersonatePage = () => {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!router.isReady) {
      return
    }

    const { token, client, redirect } = router.query

    if (typeof token !== 'string' || typeof client !== 'string') {
      setError('Не хватает данных для авторизации клиента.')
      return
    }

    try {
      const clientData = decodeClientPayload(client)

      if (!clientData?.id) {
        throw new Error('Некорректные данные клиента')
      }

      localStorage.setItem('authToken', token)
      localStorage.setItem('userData', JSON.stringify(clientData))

      window.dispatchEvent(
        new CustomEvent('auth:changed', {
          detail: {
            status: 'login',
            user: clientData,
          },
        })
      )

      const redirectPath = typeof redirect === 'string' ? redirect : '/profile-orders'
      router.replace(redirectPath)
    } catch (err) {
      console.error('Не удалось выполнить вход клиента', err)
      setError('Не удалось выполнить вход клиента. Попробуйте ещё раз.')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-2xl font-semibold text-gray-900">Авторизация клиента</h1>
        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <>
            <p className="text-sm text-gray-600">
              Готовим личный кабинет клиента. Это займёт всего пару секунд...
            </p>
            <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
              <span className="inline-flex h-3 w-3 animate-pulse rounded-full bg-red-500" />
              Перенаправляем на сайт
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ImpersonatePage
