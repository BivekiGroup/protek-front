import React, { useState } from 'react'
import { useMutation } from '@apollo/client'
import { REGISTER_NEW_CLIENT } from '@/lib/graphql'
import type { VerificationResponse } from '@/types/auth'
import { User } from 'lucide-react'
import CredentialsModal from './CredentialsModal'
import { toast } from 'react-hot-toast'

interface UserRegistrationProps {
  phone: string
  sessionId: string
  onSuccess: (data: VerificationResponse) => void
  onError: (error: string) => void
}

const UserRegistration: React.FC<UserRegistrationProps> = ({
  phone,
  sessionId,
  onSuccess,
  onError
}) => {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showCredentials, setShowCredentials] = useState(false)
  const [credentials, setCredentials] = useState<{ login: string; password: string } | null>(null)
  const [registrationData, setRegistrationData] = useState<VerificationResponse | null>(null)

  const [registerClient] = useMutation<{ registerNewClient: VerificationResponse }>(REGISTER_NEW_CLIENT)

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

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName.trim()) {
      onError('Введите имя')
      return
    }
    if (!lastName.trim()) {
      onError('Введите фамилию')
      return
    }
    if (!email.trim()) {
      onError('Введите email')
      return
    }
    if (!validateEmail(email)) {
      onError('Введите корректный email')
      return
    }
    setIsLoading(true)
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`
      const { data } = await registerClient({
        variables: {
          phone,
          name: fullName,
          sessionId,
          email: email.trim()
        }
      })
      if (data?.registerNewClient) {
        // Показываем модальное окно с логином и паролем если они есть
        if (data.registerNewClient.generatedLogin && data.registerNewClient.generatedPassword) {
          setCredentials({
            login: data.registerNewClient.generatedLogin,
            password: data.registerNewClient.generatedPassword
          })
          setRegistrationData(data.registerNewClient)
          setShowCredentials(true)
        } else {
          // Если нет логина и пароля, сразу вызываем onSuccess
          onSuccess(data.registerNewClient)
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
        onError(error.message)
      } else {
        toast.error('Не удалось зарегистрировать пользователя')
        onError('Не удалось зарегистрировать пользователя')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full max-w-[340px]" style={{ gap: '20px' }}>
      {/* Номер телефона с иконкой */}
      <div
        className="flex flex-row items-center bg-[#F5F8FB] rounded-[12px]"
        style={{ padding: '16px 24px', gap: '10px', height: '52px' }}
      >
        <div className="flex items-center justify-center w-[30px] h-[30px] rounded-full bg-[#EC1C24]">
          <User className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
        </div>
        <span
          className="text-[#424F60]"
          style={{
            fontFamily: 'Onest, sans-serif',
            fontSize: '16px',
            fontWeight: 500,
            lineHeight: '100%'
          }}
        >
          {formatPhoneForDisplay(phone)}
        </span>
      </div>

      {/* Имя */}
      <input
        type="text"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        placeholder="Имя"
        className="w-full bg-[#F5F8FB] rounded-[12px] outline-none"
        style={{
          padding: '16px 24px',
          height: '52px',
          fontFamily: 'Onest, sans-serif',
          fontSize: '16px',
          fontWeight: 500,
          lineHeight: '100%',
          color: '#424F60'
        }}
        disabled={isLoading}
        required
      />

      {/* Фамилия */}
      <input
        type="text"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        placeholder="Фамилия"
        className="w-full bg-[#F5F8FB] rounded-[12px] outline-none"
        style={{
          padding: '16px 24px',
          height: '52px',
          fontFamily: 'Onest, sans-serif',
          fontSize: '16px',
          fontWeight: 500,
          lineHeight: '100%',
          color: '#424F60'
        }}
        disabled={isLoading}
        required
      />

      {/* Email */}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full bg-[#F5F8FB] rounded-[12px] outline-none"
        style={{
          padding: '16px 24px',
          height: '52px',
          fontFamily: 'Onest, sans-serif',
          fontSize: '16px',
          fontWeight: 500,
          lineHeight: '100%',
          color: '#424F60'
        }}
        disabled={isLoading}
        autoComplete="email"
        required
      />

      {/* Подсказка */}
      <div
        className="w-full text-[#8893A2]"
        style={{
          fontFamily: 'Onest, sans-serif',
          fontSize: '14px',
          fontWeight: 500,
          lineHeight: '130%'
        }}
      >
        Логин и пароль будут автоматически созданы и отправлены на ваш email
      </div>

      {/* Кнопка */}
      <button
        type="submit"
        disabled={isLoading || !firstName.trim() || !lastName.trim() || !email.trim()}
        className="flex items-center justify-center w-full bg-[#EC1C24] rounded-[12px] transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
        style={{
          padding: '14px 20px',
          height: '50px',
          fontFamily: 'Onest, sans-serif',
          fontSize: '16px',
          fontWeight: 500,
          lineHeight: '120%',
          textAlign: 'center',
          color: '#FFFFFF'
        }}
      >
        {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
      </button>

      {/* Текст внизу */}
      <div
        className="w-full text-[#8893A2]"
        style={{
          fontFamily: 'Onest, sans-serif',
          fontSize: '14px',
          fontWeight: 500,
          lineHeight: '130%'
        }}
      >
        Используйте реальные данные для корректной работы заказов и доставки
      </div>

      {/* Модальное окно с логином и паролем */}
      {showCredentials && credentials && registrationData && (
        <CredentialsModal
          login={credentials.login}
          password={credentials.password}
          onClose={() => {
            setShowCredentials(false)
            onSuccess(registrationData)
          }}
        />
      )}
    </form>
  )
}

export default UserRegistration
