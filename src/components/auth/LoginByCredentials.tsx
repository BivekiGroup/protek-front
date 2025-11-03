import React, { useState } from 'react'
import { useMutation } from '@apollo/client'
import { LOGIN_BY_CREDENTIALS } from '@/lib/graphql'
import type { VerificationResponse } from '@/types/auth'
import { UserRound, Lock } from 'lucide-react'
import { z } from 'zod'
import { toast } from 'react-hot-toast'

const loginSchema = z.object({
  login: z.string().min(1, 'Введите логин'),
  password: z.string().min(1, 'Введите пароль')
})

interface LoginByCredentialsProps {
  onSuccess: (data: VerificationResponse) => void
  onError: (error: string) => void
  onSwitchToRegistration?: () => void
}

const LoginByCredentials: React.FC<LoginByCredentialsProps> = ({
  onSuccess,
  onError,
  onSwitchToRegistration
}) => {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [loginByCredentials] = useMutation<{ loginByCredentials: VerificationResponse }>(
    LOGIN_BY_CREDENTIALS
  )

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    // Валидация через zod
    const validationResult = loginSchema.safeParse({
      login: login.trim(),
      password: password
    })

    if (!validationResult.success) {
      const errors = validationResult.error?.errors
      if (errors && errors.length > 0) {
        onError(errors[0].message)
      } else {
        onError('Ошибка валидации')
      }
      return
    }

    setIsLoading(true)
    onError('')

    try {
      const { data, errors } = await loginByCredentials({
        variables: {
          login: login.trim(),
          password: password
        }
      })

      // Проверяем наличие ошибок в ответе (благодаря errorPolicy: 'all')
      if (errors && errors.length > 0) {
        const errorMessage = errors[0].message
        toast.error(errorMessage)
        onError(errorMessage)
        return
      }

      if (data?.loginByCredentials) {
        onSuccess(data.loginByCredentials)
      }
    } catch (error: any) {
      // Извлекаем сообщение ошибки из GraphQL
      let errorMessage = 'Произошла ошибка при входе'

      if (error?.graphQLErrors && error.graphQLErrors.length > 0) {
        errorMessage = error.graphQLErrors[0].message
      } else if (error?.networkError) {
        errorMessage = 'Ошибка сети. Проверьте подключение к интернету'
      } else if (error?.message) {
        errorMessage = error.message
      }

      toast.error(errorMessage)
      onError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col items-start gap-[20px]">
      <div className="flex w-full max-w-[340px] flex-col gap-4">
        {/* Поле логина */}
        <div className="flex h-[48px] w-full items-center gap-[10px] rounded-[12px] bg-[#F5F8FB] px-5">
          <span className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full bg-[#EC1C24] text-white">
            <UserRound className="h-[18px] w-[18px]" strokeWidth={1.6} />
          </span>
          <input
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="Логин"
            className="w-full border-none bg-transparent text-[16px] font-medium leading-none text-[#424F60] placeholder:text-[#8893A2] focus:outline-none"
            disabled={isLoading}
            aria-label="Введите логин"
            autoComplete="username"
          />
        </div>

        {/* Поле пароля */}
        <div className="flex h-[48px] w-full items-center gap-[10px] rounded-[12px] bg-[#F5F8FB] px-5">
          <span className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full bg-[#EC1C24] text-white">
            <Lock className="h-[18px] w-[18px]" strokeWidth={1.6} />
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            className="w-full border-none bg-transparent text-[16px] font-medium leading-none text-[#424F60] placeholder:text-[#8893A2] focus:outline-none"
            disabled={isLoading}
            aria-label="Введите пароль"
            autoComplete="current-password"
          />
        </div>

        {/* Кнопка входа */}
        <button
          type="submit"
          disabled={isLoading || !login.trim() || !password.trim()}
          className="flex h-[50px] w-full items-center justify-center rounded-[12px] bg-[#EC1C24] px-5 text-center text-[16px] font-medium leading-[19px] text-white transition-colors duration-200 hover:bg-[#d9151d] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EC1C24]/60 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          style={{ color: '#ffffff' }}
        >
          {isLoading ? 'Проверяем...' : 'Войти'}
        </button>

        {/* Ссылка на регистрацию */}
        {onSwitchToRegistration && (
          <div className="w-full text-center">
            <p className="text-[14px] text-[#424F60]">
              Нет аккаунта?{' '}
              <button
                type="button"
                onClick={onSwitchToRegistration}
                disabled={isLoading}
                className="font-semibold text-[#EC1C24] hover:text-[#D01920] transition-colors disabled:opacity-60"
              >
                Зарегистрироваться
              </button>
            </p>
          </div>
        )}
      </div>
    </form>
  )
}

export default LoginByCredentials
