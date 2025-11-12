import React, { useState } from 'react'
import { useMutation, useLazyQuery } from '@apollo/client'
import { REGISTER_CLIENT_WITH_PASSWORD, VERIFY_INN } from '@/lib/graphql'
import { User, Mail, Building2, Phone, Lightbulb, Hash } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { z } from 'zod'

const registrationSchema = z.object({
  inn: z.string()
    .min(10, 'ИНН должен содержать минимум 10 цифр')
    .max(12, 'ИНН должен содержать максимум 12 цифр')
    .regex(/^\d{10}$|^\d{12}$/, 'ИНН должен содержать 10 (ЮЛ) или 12 (ИП) цифр'),
  companyName: z.string().min(1, 'Введите название компании'),
  firstName: z.string().min(1, 'Введите имя'),
  lastName: z.string().min(1, 'Введите фамилию'),
  email: z.string()
    .min(1, 'Введите email')
    .email('Введите корректный email'),
  phone: z.string()
    .regex(/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/, 'Введите корректный номер телефона')
    .refine((val) => {
      const digits = val.replace(/\D/g, '')
      return digits.length === 11 && digits.startsWith('7')
    }, 'Номер должен содержать 10 цифр')
})

interface PasswordRegistrationProps {
  onSuccess: (client: any, token: string) => void
  onShowPendingVerification: (email: string, phone: string) => void
}

const PasswordRegistration: React.FC<PasswordRegistrationProps> = ({
  onSuccess,
  onShowPendingVerification
}) => {
  const [inn, setInn] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('+7 ')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingInn, setIsLoadingInn] = useState(false)
  const [innData, setInnData] = useState<any>(null)

  const [registerClient] = useMutation(REGISTER_CLIENT_WITH_PASSWORD)
  const [verifyInn] = useLazyQuery(VERIFY_INN)

  const formatPhone = (value: string) => {
    // Убираем все кроме цифр
    const digits = value.replace(/\D/g, '')

    // Если пользователь стер все, оставляем +7
    if (digits.length === 0 || digits === '7') {
      return '+7 '
    }

    // Берем только последние 10 цифр после 7
    const phoneDigits = digits.startsWith('7') ? digits.slice(1, 11) : digits.slice(0, 10)

    // Форматируем по маске +7 (XXX) XXX-XX-XX
    let formatted = '+7 '
    if (phoneDigits.length > 0) {
      formatted += '('
      formatted += phoneDigits.slice(0, 3)
      if (phoneDigits.length >= 3) {
        formatted += ') '
        formatted += phoneDigits.slice(3, 6)
        if (phoneDigits.length >= 6) {
          formatted += '-'
          formatted += phoneDigits.slice(6, 8)
          if (phoneDigits.length >= 8) {
            formatted += '-'
            formatted += phoneDigits.slice(8, 10)
          }
        }
      }
    }

    return formatted
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setPhone(formatted)
  }

  const handleInnChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 12)
    setInn(value)

    // Проверяем ИНН когда введено 10 или 12 цифр
    if (value.length === 10 || value.length === 12) {
      setIsLoadingInn(true)
      try {
        const { data } = await verifyInn({
          variables: { inn: value }
        })

        if (data?.verifyInn?.success && data?.verifyInn?.company) {
          const company = data.verifyInn.company
          setInnData(company)
          // Автозаполняем название компании
          setCompanyName(company.name?.short_with_opf || company.name?.short || '')
          toast.success('Данные компании загружены')
        } else {
          setInnData(null)
          toast.error('Компания с таким ИНН не найдена')
        }
      } catch (error) {
        console.error('Ошибка проверки ИНН:', error)
        toast.error('Не удалось проверить ИНН')
      } finally {
        setIsLoadingInn(false)
      }
    } else {
      setInnData(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Валидация через zod
    const validationResult = registrationSchema.safeParse({
      inn: inn.trim(),
      companyName: companyName.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim() || '+7 '
    })

    if (!validationResult.success) {
      const errors = validationResult.error?.issues
      if (errors && errors.length > 0) {
        toast.error(errors[0].message)
      } else {
        toast.error('Ошибка валидации')
      }
      return
    }

    setIsLoading(true)

    try {
      // Извлекаем только цифры для отправки на сервер
      const phoneDigits = phone.replace(/\D/g, '')

      const { data, errors } = await registerClient({
        variables: {
          input: {
            inn: inn.trim(),
            phone: phoneDigits,
            companyName: companyName.trim(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            legalEntityData: innData ? {
              shortName: innData.name?.short_with_opf || innData.name?.short || companyName.trim(),
              fullName: innData.name?.full_with_opf || innData.name?.full || companyName.trim(),
              inn: inn.trim(),
              kpp: innData.kpp || null,
              ogrn: innData.ogrn || null,
              address: innData.address?.value || null
            } : null
          }
        }
      })

      // Проверяем наличие ошибок в ответе (благодаря errorPolicy: 'all')
      if (errors && errors.length > 0) {
        const errorMessage = errors[0].message
        toast.error(errorMessage)
        return
      }

      if (data?.registerClientWithPassword?.success) {
        toast.success('Регистрация успешна! Ожидайте проверки менеджером')
        // Показываем экран ожидания проверки
        onShowPendingVerification(email.trim(), phone)
      }
    } catch (error: any) {
      // Извлекаем сообщение ошибки из GraphQL
      let errorMessage = 'Не удалось зарегистрировать пользователя'

      if (error?.graphQLErrors && error.graphQLErrors.length > 0) {
        errorMessage = error.graphQLErrors[0].message
      } else if (error?.networkError) {
        errorMessage = 'Ошибка сети. Проверьте подключение к интернету'
      } else if (error?.message) {
        errorMessage = error.message
      }

      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col items-center gap-[16px]">
      <div className="flex w-full max-w-[340px] flex-col gap-3">
        {/* Баннер для юридических лиц */}
        <div className="rounded-lg bg-red-50 border border-red-200 p-2.5 flex gap-2">
          <Lightbulb className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-medium text-red-900">Только для юридических лиц и ИП</p>
            <p className="text-[10px] text-red-700 mt-0.5">
              Регистрация доступна только для организаций.
            </p>
          </div>
        </div>

        {/* ИНН */}
        <div className="flex h-[44px] w-full items-center gap-[10px] rounded-[12px] bg-[#F5F8FB] px-4 relative">
          <Hash className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={inn}
            onChange={handleInnChange}
            placeholder="ИНН организации (10 или 12 цифр)"
            maxLength={12}
            className="w-full border-none bg-transparent text-[15px] font-medium leading-none text-[#424F60] placeholder:text-[#9CA3AF] focus:outline-none"
            disabled={isLoading}
          />
          {isLoadingInn && (
            <div className="absolute right-4">
              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Показываем найденные данные компании */}
        {innData && (
          <div className="rounded-lg bg-green-50 border border-green-200 p-2.5">
            <p className="text-xs font-medium text-green-900">✓ Организация найдена</p>
            <p className="text-[10px] text-green-700 mt-0.5">
              {innData.name?.full_with_opf || innData.name?.short_with_opf}
            </p>
          </div>
        )}

        {/* Название компании */}
        <div className="flex h-[44px] w-full items-center gap-[10px] rounded-[12px] bg-[#F5F8FB] px-4">
          <Building2 className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Название компании"
            className="w-full border-none bg-transparent text-[15px] font-medium leading-none text-[#424F60] placeholder:text-[#9CA3AF] focus:outline-none"
            disabled={isLoading || (innData && !!innData.name)}
          />
        </div>

        {/* Имя и Фамилия в одну строку */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex h-[44px] w-full items-center gap-[10px] rounded-[12px] bg-[#F5F8FB] px-4">
            <User className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Имя"
              className="w-full border-none bg-transparent text-[15px] font-medium leading-none text-[#424F60] placeholder:text-[#9CA3AF] focus:outline-none"
              disabled={isLoading}
            />
          </div>

          <div className="flex h-[44px] w-full items-center gap-[10px] rounded-[12px] bg-[#F5F8FB] px-4">
            <User className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Фамилия"
              className="w-full border-none bg-transparent text-[15px] font-medium leading-none text-[#424F60] placeholder:text-[#9CA3AF] focus:outline-none"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Email */}
        <div className="flex h-[44px] w-full items-center gap-[10px] rounded-[12px] bg-[#F5F8FB] px-4">
          <Mail className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full border-none bg-transparent text-[15px] font-medium leading-none text-[#424F60] placeholder:text-[#9CA3AF] focus:outline-none"
            disabled={isLoading}
          />
        </div>

        {/* Телефон */}
        <div className="flex h-[44px] w-full items-center gap-[10px] rounded-[12px] bg-[#F5F8FB] px-4">
          <Phone className="h-4 w-4 text-slate-400" />
          <input
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
            onKeyDown={(e) => {
              if (e.key === 'Backspace') {
                e.preventDefault()

                // Получаем только цифры (убираем +7)
                const digits = phone.replace(/\D/g, '')
                const phoneDigits = digits.startsWith('7') ? digits.slice(1) : digits

                // Если есть цифры для удаления
                if (phoneDigits.length > 0) {
                  const newDigits = phoneDigits.slice(0, -1)

                  // Форматируем заново
                  let formatted = '+7 '
                  if (newDigits.length > 0) {
                    formatted += '('
                    formatted += newDigits.slice(0, 3)
                    if (newDigits.length >= 3) {
                      formatted += ') '
                      formatted += newDigits.slice(3, 6)
                      if (newDigits.length >= 6) {
                        formatted += '-'
                        formatted += newDigits.slice(6, 8)
                        if (newDigits.length >= 8) {
                          formatted += '-'
                          formatted += newDigits.slice(8, 10)
                        }
                      }
                    }
                  }

                  setPhone(formatted)
                } else {
                  // Если цифр нет, возвращаем к начальному состоянию
                  setPhone('+7 ')
                }
              }
            }}
            placeholder="+7 (999) 123-45-67"
            className="w-full border-none bg-transparent text-[15px] font-medium leading-none text-[#424F60] placeholder:text-[#9CA3AF] focus:outline-none"
            disabled={isLoading}
          />
        </div>

        {/* Информация о проверке */}
        <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
          <p className="font-medium mb-1">После регистрации:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Ваша заявка будет проверена менеджером</li>
            <li>Мы отправим вам пароль на email</li>
            <li>Вы сможете войти с телефоном и паролем</li>
          </ul>
        </div>

        {/* Кнопка регистрации */}
        <button
          type="submit"
          disabled={isLoading}
          className="flex h-[48px] w-full items-center justify-center rounded-[12px] bg-[#EC1C24] text-[16px] font-bold !text-white hover:bg-[#D01920] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </div>
    </form>
  )
}

export default PasswordRegistration
