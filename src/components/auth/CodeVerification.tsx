import React, { useEffect, useRef, useState } from 'react'
import { useMutation } from '@apollo/client'
import { SEND_SMS_CODE, VERIFY_CODE } from '@/lib/graphql'
import type { SMSCodeResponse, VerificationResponse } from '@/types/auth'
import { toast } from 'react-hot-toast'

const RESEND_TIMEOUT = 60
const CODE_LENGTH = 5

interface CodeVerificationProps {
  phone: string
  sessionId: string
  isExistingClient: boolean
  onSuccess: (data: VerificationResponse) => void
  onError: (error: string) => void
  onBack: () => void
  onRegister: () => void
}

const CodeVerification: React.FC<CodeVerificationProps> = ({
  phone,
  sessionId,
  isExistingClient,
  onSuccess,
  onError,
  onBack,
  onRegister
}) => {
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [resendSeconds, setResendSeconds] = useState(RESEND_TIMEOUT)
  const [resendLoading, setResendLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [sendSMS] = useMutation<{ sendSMSCode: SMSCodeResponse }>(SEND_SMS_CODE)
  const [verifyCode] = useMutation<{ verifyCode: VerificationResponse }>(VERIFY_CODE)

  useEffect(() => {
    console.log('CodeVerification mounted for', isExistingClient ? 'existing' : 'new', 'client')
  }, [isExistingClient])

  useEffect(() => {
    if (resendSeconds <= 0) {
      return undefined
    }
    const timer = window.setInterval(() => {
      setResendSeconds((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [resendSeconds])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleCodeChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, CODE_LENGTH)
    setCode(digitsOnly)
    onError('')

    if (digitsOnly.length === CODE_LENGTH && !isLoading) {
      void handleVerify(digitsOnly)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && code.length > 0) {
      const nextValue = code.slice(0, -1)
      setCode(nextValue)
      onError('')
      event.preventDefault()
    }
  }

  const handleVerify = async (codeString?: string) => {
    const finalCode = codeString ?? code

    if (finalCode.length !== CODE_LENGTH) {
      toast.error('Введите полный код')
      onError('Введите полный код')
      return
    }

    onError('')
    setIsLoading(true)

    try {
      const { data } = await verifyCode({
        variables: {
          phone,
          code: finalCode,
          sessionId
        }
      })

      if (data?.verifyCode?.success) {
        if (data.verifyCode.client) {
          onSuccess(data.verifyCode)
        } else {
          onRegister()
        }
      }
    } catch (error) {
      console.error('Ошибка верификации:', error)
      toast.error('Неверный код')
      onError('Неверный код')
      setCode('')
      inputRef.current?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendSeconds > 0 || resendLoading) {
      return
    }

    setResendLoading(true)
    onError('')
    try {
      const { data } = await sendSMS({
        variables: {
          phone,
          sessionId
        }
      })

      if (data?.sendSMSCode?.success) {
        setResendSeconds(RESEND_TIMEOUT)
        setCode('')
        inputRef.current?.focus()
        toast.success('Код отправлен повторно')
      } else {
        toast.error('Не удалось отправить SMS повторно')
        onError('Не удалось отправить SMS повторно')
      }
    } catch (error) {
      console.error('Ошибка повторной отправки SMS:', error)
      toast.error('Не удалось отправить SMS повторно')
      onError('Не удалось отправить SMS повторно')
    } finally {
      setResendLoading(false)
    }
  }

  const formatSeconds = (value: number) => {
    const minutes = Math.floor(value / 60)
    const seconds = value % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const resendLabel = resendSeconds > 0
    ? `Повторно отправить SMS через ${formatSeconds(resendSeconds)}`
    : 'Повторно отправить SMS'

  const allDigitsFilled = code.length === CODE_LENGTH

  return (
    <div className="flex w-full flex-col items-center gap-[16px]">
      <div className="flex w-full max-w-[340px] flex-col gap-[20px]">
        <div
          className="relative flex h-[52px] w-full items-center justify-center rounded-[12px] bg-[#F5F8FB] px-6"
          onClick={() => inputRef.current?.focus()}
        >
          <input
            ref={inputRef}
            type="tel"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(event) => handleCodeChange(event.target.value)}
            onKeyDown={handleKeyDown}
            className="absolute inset-0 h-full w-full cursor-text opacity-0"
            aria-label="Введите код из SMS"
          />
          <div className="flex items-center justify-center gap-[12px] text-[24px] font-bold leading-[24px]">
            {Array.from({ length: CODE_LENGTH }).map((_, index) => (
              <span
                key={index}
                className={index < code.length ? 'text-[#424F60]' : 'text-[#8893A2]'}
              >
                •
              </span>
            ))}
          </div>
        </div>
        <div className="flex w-full flex-col gap-[12px]">
          <button
            type="button"
            onClick={() => handleVerify()}
            disabled={isLoading || !allDigitsFilled}
            className="flex h-[50px] w-full items-center justify-center rounded-[12px] bg-[#EC1C24] px-5 text-center text-[16px] font-medium leading-[19px] text-white transition-colors duration-200 hover:bg-[#d9151d] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EC1C24]/60 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ color: '#FFFFFF' }}
          >
            {isLoading ? 'Проверяем...' : 'Войти'}
          </button>
          {resendSeconds <= 0 ? (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading}
              className={`flex h-[50px] w-full items-center justify-center rounded-[12px] bg-[#F5F8FB] px-5 text-center text-[16px] font-medium leading-[19px] text-[#000814] transition ${
                resendLoading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[#e6eefb]'
              }`}
            >
              {resendLoading ? 'Отправляем...' : 'Запросить код повторно'}
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex w-full max-w-[340px] flex-col gap-[8px]">
        {resendSeconds > 0 ? (
          <p className="m-0 text-center font-[Onest,sans-serif] text-[14px] font-medium leading-[120%] text-[#8893A2]">
            {resendLabel}
          </p>
        ) : null}
      </div>
    </div>
  )
}

export default CodeVerification
