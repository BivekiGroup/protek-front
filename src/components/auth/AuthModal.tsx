import React, { useState } from 'react'
import { ApolloProvider } from '@apollo/client'
import { apolloClient } from '@/lib/apollo'
import PhoneInput from './PhoneInput'
import CodeVerification from './CodeVerification'
import UserRegistration from './UserRegistration'
import { X } from 'lucide-react'
import type { AuthState, AuthStep, ClientAuthResponse, VerificationResponse } from '@/types/auth'

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
      onSuccess(data.client, data.token)
      onClose()
    }
  }

  const handleRegistrationSuccess = (data: VerificationResponse) => {
    if (data.success && data.client) {
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
      default:
        return null
    }
  }

  return (
    <ApolloProvider client={apolloClient}>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        onClick={handleClose}
      >
        <div
          className="absolute inset-0 bg-black/10 transition-opacity duration-200"
          aria-label="Затемнение фона"
          tabIndex={-1}
        />
        <div
          className="relative z-10 flex flex-col gap-4 items-start bg-white rounded-3xl shadow-xl w-[650px] max-w-full min-h-[320px] px-12 py-10 max-md:px-6 max-md:py-8 max-sm:gap-8 max-sm:p-5"
          style={{ marginTop: 0 }}
          onClick={(event) => event.stopPropagation()}
        >
          {/* Кнопка закрытия */}
          <button
            onClick={handleClose}
            className="absolute right-5 top-5 inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
            aria-label="Закрыть окно авторизации"
            tabIndex={0}
          >
            <X className="h-5 w-5 text-gray-900" strokeWidth={1.8} />
          </button>
          {/* Заголовок */}
          <div className="flex relative justify-between items-start w-full max-sm:flex-col max-sm:gap-5">
            <div className="relative text-5xl font-bold  leading-[62.4px] text-gray-950 max-md:text-5xl max-sm:self-start max-sm:text-3xl">
              Вход или регистрация
            </div>
          </div>
          {/* Ошибка */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded">
              <p className="text-red-800 m-0">{error}</p>
            </div>
          )}
          {/* Контент */}
          <div className="flex relative flex-col gap-5 items-start self-stretch w-full">
            {renderStep()}
          </div>
        </div>
      </div>
    </ApolloProvider>
  )
}

export default AuthModal 
