import React from 'react'
import { Clock, Mail, CheckCircle } from 'lucide-react'

interface PendingVerificationProps {
  email: string
  phone: string
  onClose?: () => void
}

const PendingVerification: React.FC<PendingVerificationProps> = ({ email, phone, onClose }) => {
  return (
    <div className="flex w-full max-w-[340px] flex-col items-center gap-5">
      {/* Иконка успеха */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <CheckCircle className="h-12 w-12 text-green-600" strokeWidth={2.5} />
      </div>

      {/* Заголовок */}
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="text-2xl font-bold text-slate-900">
          Заявка отправлена
        </h2>
        <p className="text-sm text-slate-600">
          Мы проверим ваши данные и отправим пароль на email в течение рабочего дня
        </p>
      </div>

      {/* Контактная информация */}
      <div className="w-full flex flex-col gap-2">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500 mb-1">Email</p>
          <p className="text-sm font-medium text-slate-900 truncate">{email}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500 mb-1">Телефон</p>
          <p className="text-sm font-medium text-slate-900">{phone}</p>
        </div>
      </div>

      {/* Кнопка закрытия */}
      {onClose && (
        <button
          onClick={onClose}
          className="w-full h-12 rounded-xl bg-[#EC1C24] !text-white font-semibold transition-colors hover:bg-[#D01920]"
        >
          Понятно
        </button>
      )}
    </div>
  )
}

export default PendingVerification
