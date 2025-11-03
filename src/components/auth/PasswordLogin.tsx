import React, { useState } from 'react'
import { useMutation } from '@apollo/client'
import { LOGIN_WITH_PASSWORD } from '@/lib/graphql'
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface PasswordLoginProps {
  phone: string
  onSuccess: (client: any, token: string) => void
  onBack: () => void
}

const PasswordLogin: React.FC<PasswordLoginProps> = ({
  phone,
  onSuccess,
  onBack
}) => {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [loginWithPassword] = useMutation(LOGIN_WITH_PASSWORD)

  const formatPhoneForDisplay = (value: string) => {
    const digits = value.replace(/\D/g, '')
    const trimmed = digits.length >= 10 ? digits.slice(-10) : digits
    if (trimmed.length !== 10) {
      return value
    }
    const part1 = trimmed.slice(0, 3)
    const part2 = trimmed.slice(3, 6)
    const part3 = trimmed.slice(6, 8)
    const part4 = trimmed.slice(8, 10)
    return `+7 ${part1} ${part2} ${part3} ${part4}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password) {
      toast.error('Введите пароль')
      return
    }

    setIsLoading(true)

    try {
      const { data } = await loginWithPassword({
        variables: {
          phone,
          password
        }
      })

      if (data?.loginWithPassword?.success && data.loginWithPassword.client) {
        toast.success('Вход выполнен успешно!')
        onSuccess(data.loginWithPassword.client, data.loginWithPassword.token)
      }
    } catch (error) {
      if (error instanceof Error) {
        // Проверяем специальное сообщение о непроверенном аккаунте
        if (error.message.includes('ожидает проверки')) {
          toast.error('Ваш аккаунт ожидает проверки менеджером')
        } else {
          toast.error(error.message)
        }
      } else {
        toast.error('Не удалось войти')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col items-start gap-[20px]">
      <div className="flex w-full max-w-[400px] flex-col gap-4">
        {/* Заголовок с кнопкой назад */}
        <div className="mb-2">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors mb-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Изменить номер
          </button>
          <h3 className="text-xl font-bold text-slate-900">Введите пароль</h3>
          <p className="text-sm text-slate-600 mt-1">
            {formatPhoneForDisplay(phone)}
          </p>
        </div>

        {/* Поле пароля */}
        <div className="flex h-[48px] w-full items-center gap-[10px] rounded-[12px] bg-[#F5F8FB] px-5">
          <Lock className="h-5 w-5 text-slate-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите пароль"
            className="w-full border-none bg-transparent text-[16px] font-medium leading-none text-[#424F60] placeholder:text-[#9CA3AF] focus:outline-none"
            disabled={isLoading}
            autoFocus
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        {/* Информация */}
        <div className="text-xs text-slate-500">
          <p>
            Пароль был отправлен на ваш email после подтверждения регистрации менеджером.
          </p>
        </div>

        {/* Кнопка входа */}
        <button
          type="submit"
          disabled={isLoading || !password}
          className="flex h-[48px] w-full items-center justify-center rounded-[12px] bg-[#EC1C24] text-[16px] font-bold text-white hover:bg-[#D01920] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Вход...' : 'Войти'}
        </button>

        {/* Помощь */}
        <div className="text-center">
          <p className="text-xs text-slate-500">
            Забыли пароль? Свяжитесь с нами:
          </p>
          <p className="text-xs font-semibold text-slate-700 mt-1">
            +7 (495) 123-45-67
          </p>
        </div>
      </div>
    </form>
  )
}

export default PasswordLogin
