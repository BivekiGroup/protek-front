import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { ArrowRight, LockKeyhole, Mail, PhoneCall } from 'lucide-react'

interface MaintenanceModeProps {
  onPasswordCorrect: () => void
}

const MaintenanceMode: React.FC<MaintenanceModeProps> = ({ onPasswordCorrect }) => {
  const [password, setPassword] = useState('')
  const [isInvalid, setIsInvalid] = useState(false)
  const [progress, setProgress] = useState(0)

  const correctPassword = 'protek2024'

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev >= 98 ? 12 : prev + 2))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === correctPassword) {
      onPasswordCorrect()
    } else {
      setIsInvalid(true)
      setPassword('')
      setTimeout(() => setIsInvalid(false), 600)
    }
  }

  return (
    <>
      <Head>
        <title>Protekauto — закрытый доступ</title>
        <meta
          name="description"
          content="Предпросмотр закрытой витрины Protekauto. Авторизуйтесь кодом партнёра."
        />
      </Head>

      <div className="min-h-screen bg-[#f2f4f7] text-slate-900">
        <div className="h-1 w-full bg-gradient-to-r from-[#ec1c24] via-[#c4121b] to-[#123057]" />

        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-center gap-16 px-6 py-16 lg:flex-row lg:items-center">
          <section className="flex-1 space-y-10">
            <div>
              <span className="inline-flex items-center rounded-full bg-[#ec1c24]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-[#c3101b]">
                beta build
              </span>
              <h1 className="mt-6 text-4xl font-semibold leading-tight sm:text-5xl">
                Закрытая витрина Protekauto
              </h1>
              <p className="mt-5 max-w-xl text-lg text-slate-600">
                Каталог скоро будет открыт для просмотра всем посетителям, а закупки смогут оформлять юридические лица. Пока мы заканчиваем настройку, вход доступен по коду партнёра.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {[{
                title: 'OEM + aftermarket',
                description: '190 000 позиций с валидацией остатков и цен.'
              }, {
                title: 'Онлайн-статусы',
                description: 'Оплата, отгрузки и возвраты в одном кабинете.'
              }, {
                title: 'API-подключение',
                description: 'Обмен прайсами и заказами без ручной рутины.'
              }].map(item => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/60 bg-white/90 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur"
                >
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-2 text-sm text-slate-500">{item.description}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-white/60 bg-white/90 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur">
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Сборка витрины</span>
                <span>{progress}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-[#ec1c24] transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </section>

          <section className="w-full max-w-md">
            <div className="rounded-[28px] border border-white bg-white p-8 shadow-[0_25px_60px_rgba(15,23,42,0.15)]">
              <h2 className="text-2xl font-semibold">Введите код партнёра</h2>
              <p className="mt-3 text-sm text-slate-500">
                Код отправляет ваш менеджер. Он даёт временный доступ к разделу для юрлиц.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="●●●●●●"
                    className={`w-full rounded-2xl border-2 bg-white px-5 py-4 text-base text-slate-900 outline-none transition-all duration-300 focus:border-[#ec1c24] focus:ring-2 focus:ring-[#ec1c24]/15 ${
                      isInvalid ? 'border-[#ec1c24] bg-[#fde7e9]' : 'border-slate-200'
                    }`}
                    autoComplete="one-time-code"
                  />
                  <LockKeyhole className="pointer-events-none absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors peer-focus:text-[#ec1c24]" />
                </div>

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ec1c24] px-6 py-4 text-base font-semibold text-white shadow-[0_15px_25px_rgba(236,28,36,0.35)] transition-transform duration-200 hover:-translate-y-[1px] hover:shadow-[0_20px_35px_rgba(236,28,36,0.4)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#ec1c24]/30"
                >
                  <span>Войти в витрину</span>
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </form>

              {isInvalid && (
                <p className="mt-4 text-sm text-[#c3101b]">Неверный код. Проверьте сообщение от менеджера и попробуйте снова.</p>
              )}

              <div className="mt-8 space-y-3 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <a
                    href="mailto:support@protekauto.ru"
                    className="text-slate-600 underline decoration-dotted underline-offset-4 hover:text-[#ec1c24]"
                  >
                    support@protekauto.ru
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneCall className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">7(495)260-20-60</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}

export default MaintenanceMode
