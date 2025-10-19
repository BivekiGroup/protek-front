import React, { useState } from 'react'
import { ApolloProvider } from '@apollo/client'
import { apolloClient } from '@/lib/apollo'
import PhoneInput from './PhoneInput'
import CodeVerification from './CodeVerification'
import UserRegistration from './UserRegistration'
import LoginByCredentials from './LoginByCredentials'
import { X } from 'lucide-react'
import type { AuthState, ClientAuthResponse, VerificationResponse } from '@/types/auth'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (client: any, token?: string) => void
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [authState, setAuthState] = useState<AuthState>({
    step: 'phone',
    phone: '',
    sessionId: '',
    isExistingClient: false
  })
  const [error, setError] = useState('')

  const handlePhoneSuccess = (data: ClientAuthResponse) => {
    setError('')
    // Всегда переходим к вводу кода, независимо от того, существует клиент или нет
    setAuthState(prev => ({
      ...prev,
      step: 'code',
      sessionId: data.sessionId,
      client: data.client,
      isExistingClient: data.exists
    }))
  }

  const handleCodeSuccess = (data: VerificationResponse) => {
    if (data.success && data.client) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastAuthExistingClient', authState.isExistingClient ? '1' : '0')
      }
      onSuccess(data.client, data.token)
      onClose()
    }
  }

  const handleRegistrationSuccess = (data: VerificationResponse) => {
    if (data.success && data.client) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastAuthExistingClient', '0')
      }
      onSuccess(data.client, data.token)
      onClose()
    }
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
  }

  const handleBack = () => {
    setAuthState(prev => ({
      ...prev,
      step: 'phone'
    }))
    setError('')
  }

  const handleGoToRegistration = () => {
    setAuthState(prev => ({
      ...prev,
      step: 'registration'
    }))
    setError('')
  }

  const handleGoToLoginPassword = () => {
    setAuthState(prev => ({
      ...prev,
      step: 'loginPassword'
    }))
    setError('')
  }

  const handleGoToPhone = () => {
    setAuthState(prev => ({
      ...prev,
      step: 'phone'
    }))
    setError('')
  }

  const handleClose = () => {
    setAuthState({
      step: 'phone',
      phone: '',
      sessionId: '',
      isExistingClient: false
    })
    setError('')
    onClose()
  }

  if (!isOpen) return null

  const renderStep = () => {
    switch (authState.step) {
      case 'phone':
        return (
          <PhoneInput
            onSuccess={(data, phone) => {
              setAuthState(prev => ({
                ...prev,
                phone: phone,
                sessionId: data.sessionId,
                client: data.client,
                isExistingClient: data.exists
              }))
              handlePhoneSuccess(data)
            }}
            onError={handleError}
            onRegister={handleGoToRegistration}
            onSwitchToLoginPassword={handleGoToLoginPassword}
          />
        )
      case 'code':
        return (
          <CodeVerification
            phone={authState.phone}
            sessionId={authState.sessionId}
            isExistingClient={authState.isExistingClient}
            onSuccess={handleCodeSuccess}
            onError={handleError}
            onBack={handleBack}
            onRegister={handleGoToRegistration}
          />
        )
      case 'registration':
        return (
          <UserRegistration
            phone={authState.phone}
            sessionId={authState.sessionId}
            onSuccess={handleRegistrationSuccess}
            onError={handleError}
          />
        )
      case 'loginPassword':
        return (
          <LoginByCredentials
            onSuccess={handleCodeSuccess}
            onError={handleError}
            onSwitchToPhone={handleGoToPhone}
          />
        )
      default:
        return null
    }
  }

  const isPhoneStep = authState.step === 'phone'
  const isCodeStep = authState.step === 'code'
  const isLoginPasswordStep = authState.step === 'loginPassword'
  const isRegistrationStep = authState.step === 'registration'
  const isModernStep = isPhoneStep || isCodeStep || isLoginPasswordStep || isRegistrationStep

  const title = (() => {
    switch (authState.step) {
      case 'phone':
        return 'Войти по номеру'
      case 'code':
        return 'Код из SMS'
      case 'registration':
        return 'Регистрация'
      case 'loginPassword':
        return 'Войти по логину и паролю'
      default:
        return 'Авторизация'
    }
  })()

  const formatPhoneForDisplay = (value: string) => {
    const digits = value.replace(/\D/g, '')
    const trimmed = digits.length >= 10 ? digits.slice(-10) : digits
    if (trimmed.length !== 10) {
      return value || '+7'
    }
    const part1 = trimmed.slice(0, 3)
    const part2 = trimmed.slice(3, 6)
    const part3 = trimmed.slice(6, 8)
    const part4 = trimmed.slice(8, 10)
    return `+7 ${part1} ${part2}-${part3}-${part4}`
  }

  const subtitle = isCodeStep ? `Отправили на ${formatPhoneForDisplay(authState.phone)}` : null

  const containerClasses = isModernStep
    ? 'relative z-10 flex w-[440px] max-w-[92vw] flex-col items-start gap-[30px] rounded-[12px] bg-white px-[50px] py-[50px] shadow-[0_32px_80px_rgba(19,31,55,0.16)]'
    : 'relative z-10 flex flex-col gap-6 items-start bg-white rounded-3xl shadow-xl w-[480px] max-w-[90vw] min-h-[280px] px-8 py-8 max-md:px-6 max-md:py-6 max-sm:gap-6 max-sm:p-5'

  const titleWrapperClasses = isModernStep
    ? 'flex w-full max-w-[340px] flex-col gap-2 text-left'
    : 'flex relative justify-between items-start w-full max-sm:flex-col max-sm:gap-4'

  const titleTextClasses = isModernStep
    ? 'text-[30px] font-extrabold leading-[36px] text-[#000814]'
    : 'relative text-[32px] font-semibold leading-[38px] text-gray-950 max-sm:self-start max-sm:text-[26px] max-sm:leading-[32px]'

  const errorClasses = isModernStep
    ? 'mb-1 w-full max-w-[340px] rounded-[12px] border border-red-200 bg-red-50 px-4 py-3'
    : 'mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded'

  const contentWrapperClasses = isModernStep
    ? 'flex w-full max-w-[340px] flex-col gap-5 items-start'
    : 'flex relative flex-col gap-5 items-start self-stretch w-full'

  return (
    <ApolloProvider client={apolloClient}>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        onClick={handleClose}
      >
        <div
          className="absolute inset-0 bg-black/30 transition-opacity duration-200"
          aria-label="Затемнение фона"
          tabIndex={-1}
        />
        <div
          className={containerClasses}
          style={{ marginTop: 0 }}
          onClick={(event) => event.stopPropagation()}
        >
          {/* Кнопка закрытия */}
          <button
            onClick={handleClose}
            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300"
            aria-label="Закрыть окно авторизации"
            tabIndex={0}
          >
            <X className="h-5 w-5 text-[#8893A2]" strokeWidth={1.8} />
          </button>
          {/* Заголовок */}
          <div className={titleWrapperClasses}>
            <div className={titleTextClasses}>{title}</div>
            {subtitle ? (
              <p className="m-0 text-[16px] font-medium leading-[19px] text-[#424F60]">
                {subtitle}
              </p>
            ) : null}
          </div>
          {/* Ошибка */}
          {error && !isModernStep && (
            <div className={errorClasses}>
              <p className="m-0 text-sm font-medium text-red-700">{error}</p>
            </div>
          )}
          {/* Контент */}
          <div className={contentWrapperClasses}>
            {renderStep()}
          </div>
        </div>
      </div>
    </ApolloProvider>
  )
}

export default AuthModal
