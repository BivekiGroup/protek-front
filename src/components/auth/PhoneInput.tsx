import React, { useState } from 'react'
import { useMutation } from '@apollo/client'
import { CHECK_CLIENT_BY_PHONE, SEND_SMS_CODE } from '@/lib/graphql'
import type { ClientAuthResponse, SMSCodeResponse } from '@/types/auth'
import { Check, UserRound } from 'lucide-react'

interface PhoneInputProps {
  onSuccess: (data: ClientAuthResponse, phone: string) => void
  onError: (error: string) => void
  onRegister: () => void
  onSwitchToLoginPassword?: () => void
}

const PhoneInput: React.FC<PhoneInputProps> = ({ onSuccess, onError, onRegister, onSwitchToLoginPassword }) => {
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isConsentGiven, setIsConsentGiven] = useState(true)

  const [checkClient] = useMutation<{ checkClientByPhone: ClientAuthResponse }>(CHECK_CLIENT_BY_PHONE)
  const [sendSMSCode] = useMutation<{ sendSMSCode: SMSCodeResponse }>(SEND_SMS_CODE)

  void onRegister

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Получаем значение из инпута без "+7 "
    const inputValue = event.target.value.replace(/^\+7\s*/, '')
    // Убираем все нецифровые символы
    const digitsOnly = inputValue.replace(/\D/g, '')
    // Ограничиваем до 10 цифр
    const trimmed = digitsOnly.slice(0, 10)

    // Форматируем: XXX XXX XX XX
    let formatted = ''
    if (trimmed.length > 0) {
      formatted = trimmed.slice(0, 3)
    }
    if (trimmed.length > 3) {
      formatted += ` ${trimmed.slice(3, 6)}`
    }
    if (trimmed.length > 6) {
      formatted += ` ${trimmed.slice(6, 8)}`
    }
    if (trimmed.length > 8) {
      formatted += ` ${trimmed.slice(8, 10)}`
    }

    setPhone(formatted)
    onError('')
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!isConsentGiven) {
      return
    }

    const digits = phone.replace(/\D/g, '')
    if (digits.length !== 10) {
      onError('Введите корректный номер телефона')
      return
    }

    setIsLoading(true)
    const cleanPhone = `+7${digits}`

    try {
      const { data: clientData } = await checkClient({ variables: { phone: cleanPhone } })

      if (clientData?.checkClientByPhone) {
        // Просто переходим к следующему шагу, БЕЗ отправки SMS
        onSuccess(clientData.checkClientByPhone, cleanPhone)
      }
    } catch (error) {
      console.error('Ошибка проверки телефона:', error)
      onError('Произошла ошибка при проверке номера')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col items-start gap-[30px]">
      <div className="flex w-full max-w-[340px] flex-col gap-5">
        <div className="flex h-[48px] w-full items-center gap-[10px] rounded-[12px] bg-[#F5F8FB] px-5">
          <span className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full bg-[#EC1C24] text-white">
            <UserRound className="h-[18px] w-[18px]" strokeWidth={1.6} />
          </span>
          <input
            type="tel"
            value={phone ? `+7 ${phone}` : '+7 '}
            onChange={handlePhoneChange}
            onKeyDown={(e) => {
              if (e.key === 'Backspace') {
                e.preventDefault()

                // Получаем только цифры
                const digitsOnly = phone.replace(/\D/g, '')

                // Если есть цифры для удаления
                if (digitsOnly.length > 0) {
                  const newDigits = digitsOnly.slice(0, -1)

                  // Форматируем заново
                  let formatted = ''
                  if (newDigits.length > 0) {
                    formatted = newDigits.slice(0, 3)
                  }
                  if (newDigits.length > 3) {
                    formatted += ` ${newDigits.slice(3, 6)}`
                  }
                  if (newDigits.length > 6) {
                    formatted += ` ${newDigits.slice(6, 8)}`
                  }
                  if (newDigits.length > 8) {
                    formatted += ` ${newDigits.slice(8, 10)}`
                  }

                  setPhone(formatted)
                }
              }
            }}
            placeholder="+7 909 797 66 45"
            className="w-full border-none bg-transparent text-[16px] font-medium leading-none text-[#424F60] placeholder:text-[#424F60] focus:outline-none"
            disabled={isLoading}
            aria-label="Введите номер телефона"
            inputMode="tel"
            autoComplete="tel"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || phone.replace(/\D/g, '').length !== 10 || !isConsentGiven}
          className="flex h-[50px] w-full items-center justify-center rounded-[12px] bg-[#EC1C24] px-5 text-center text-[16px] font-medium leading-[19px] text-white transition-colors duration-200 hover:bg-[#d9151d] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EC1C24]/60 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          style={{ color: '#ffffff' }}
        >
          {isLoading ? 'Проверяем...' : 'Войти'}
        </button>
        {onSwitchToLoginPassword && (
          <button
            type="button"
            onClick={onSwitchToLoginPassword}
            disabled={isLoading}
            className="w-full text-center text-[14px] font-medium leading-[18px] text-[#0A84FF] transition-colors hover:text-[#0066CC] disabled:opacity-60"
          >
            Войти по логину и паролю
          </button>
        )}
      </div>
      <label
        className="flex w-full max-w-[340px] items-start gap-[10px]"
        style={{ display: 'flex' }}
      >
        <input
          type="checkbox"
          className="sr-only"
          checked={isConsentGiven}
          onChange={(event) => setIsConsentGiven(event.target.checked)}
        />
        <span
          className={`mt-[2px] flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-[4px] border transition-colors duration-150 ${
            isConsentGiven ? 'border-[#EC1C24] bg-[#EC1C24]' : 'border-[#D7DEE9] bg-white'
          }`}
        >
          {isConsentGiven ? <Check className="h-[11px] w-[11px] text-white" strokeWidth={3} /> : null}
        </span>
        <span className="flex-1 text-[14px] font-medium leading-[18px] text-[#8893A2]">
          Соглашаюсь с{' '}
          <a
            href="/privacy-policy"
            className="text-[#424F60] no-underline hover:text-[#EC1C24]"
          >
            правилами пользования торговой площадкой
          </a>{' '}
          и{' '}
          <a
            href="/guarantee"
            className="text-[#424F60] no-underline hover:text-[#EC1C24]"
          >
            возврата
          </a>
        </span>
      </label>
    </form>
  )
}

export default PhoneInput
