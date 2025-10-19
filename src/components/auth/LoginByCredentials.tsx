import React, { useState } from 'react'
import { useMutation } from '@apollo/client'
import { LOGIN_BY_CREDENTIALS } from '@/lib/graphql'
import type { VerificationResponse } from '@/types/auth'
import { UserRound, Lock } from 'lucide-react'

interface LoginByCredentialsProps {
  onSuccess: (data: VerificationResponse) => void
  onError: (error: string) => void
  onSwitchToPhone: () => void
}

const LoginByCredentials: React.FC<LoginByCredentialsProps> = ({
  onSuccess,
  onError,
  onSwitchToPhone
}) => {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [loginByCredentials] = useMutation<{ loginByCredentials: VerificationResponse }>(
    LOGIN_BY_CREDENTIALS
  )

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!login.trim()) {
      onError('Введите логин')
      return
    }

    if (!password.trim()) {
      onError('Введите пароль')
      return
    }

    setIsLoading(true)
    onError('')

    try {
      const { data } = await loginByCredentials({
        variables: {
          login: login.trim(),
          password: password
        }
      })

      if (data?.loginByCredentials) {
        onSuccess(data.loginByCredentials)
      }
    } catch (error) {
      console.error('Ошибка входа по логину/паролю:', error)
      if (error instanceof Error) {
        onError(error.message)
      } else {
        onError('Произошла ошибка при входе')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col items-start gap-[30px]">
      <div className="flex w-full max-w-[340px] flex-col gap-5">
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
            required
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
            required
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

        {/* Ссылка на вход по номеру телефона */}
        <button
          type="button"
          onClick={onSwitchToPhone}
          disabled={isLoading}
          className="w-full text-center text-[14px] font-medium leading-[18px] text-[#424F60] transition-colors hover:text-[#EC1C24] disabled:opacity-60"
        >
          Войти по номеру телефона
        </button>
      </div>
    </form>
  )
}

export default LoginByCredentials
