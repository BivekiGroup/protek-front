import React, { useState } from 'react'
import { Copy, Check, X } from 'lucide-react'

interface CredentialsModalProps {
  login: string
  password: string
  onClose: () => void
}

const CredentialsModal: React.FC<CredentialsModalProps> = ({ login, password, onClose }) => {
  const [copiedLogin, setCopiedLogin] = useState(false)
  const [copiedPassword, setCopiedPassword] = useState(false)

  const copyToClipboard = async (text: string, type: 'login' | 'password') => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'login') {
        setCopiedLogin(true)
        setTimeout(() => setCopiedLogin(false), 2000)
      } else {
        setCopiedPassword(true)
        setTimeout(() => setCopiedPassword(false), 2000)
      }
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Закрыть"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Ваши данные для входа
        </h2>

        {/* Subtitle */}
        <p className="text-sm text-center text-gray-600 mb-6">
          Данные отправлены на вашу почту. Сохраните их в надежном месте.
        </p>

        {/* Login */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Логин</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-50 rounded-lg px-4 py-3 font-mono text-sm text-gray-900 border border-gray-200">
              {login}
            </div>
            <button
              onClick={() => copyToClipboard(login, 'login')}
              className="flex-shrink-0 p-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              aria-label="Копировать логин"
            >
              {copiedLogin ? <Check className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Пароль</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-50 rounded-lg px-4 py-3 font-mono text-sm text-gray-900 border border-gray-200">
              {password}
            </div>
            <button
              onClick={() => copyToClipboard(password, 'password')}
              className="flex-shrink-0 p-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              aria-label="Копировать пароль"
            >
              {copiedPassword ? <Check className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Важно:</strong> Это окно появится только один раз. Обязательно сохраните логин и пароль.
          </p>
        </div>

        {/* Info */}
        <p className="text-xs text-center text-gray-500 mb-6">
          Вы можете изменить логин и пароль в настройках аккаунта
        </p>

        {/* Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-red-600 hover:bg-red-700 font-semibold rounded-lg transition-colors"
          style={{ color: '#ffffff' }}
        >
          Понятно, продолжить
        </button>
      </div>
    </div>
  )
}

export default CredentialsModal
