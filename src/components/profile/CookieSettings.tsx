import React, { useState, useEffect } from 'react';
import { 
  getCookiePreferences, 
  CookiePreferences, 
  initializeAnalytics, 
  initializeMarketing,
  resetCookieConsent 
} from '@/lib/cookie-utils';

const CookieSettings: React.FC = () => {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    // Загружаем текущие настройки
    const currentPreferences = getCookiePreferences();
    if (currentPreferences) {
      setPreferences(currentPreferences);
    }
    setIsLoading(false);
  }, []);

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return; // Необходимые cookies нельзя отключить
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      // Сохраняем настройки
      localStorage.setItem('cookieConsent', 'configured');
      localStorage.setItem('cookiePreferences', JSON.stringify(preferences));

      // Инициализируем сервисы согласно настройкам
      if (preferences.analytics) {
        initializeAnalytics();
      }
      if (preferences.marketing) {
        initializeMarketing();
      }

      setSaveMessage('Настройки успешно сохранены');
      
      // Убираем сообщение через 3 секунды
      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
    } catch (error) {
      setSaveMessage('Ошибка при сохранении настроек');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    resetCookieConsent();
    setPreferences({
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    });
    setSaveMessage('Настройки сброшены. Перезагрузите страницу для повторного отображения уведомления о cookies.');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-8 max-md:px-5">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-950 mb-2">
          Настройки файлов cookie
        </h2>
        <p className="text-gray-600">
          Управляйте тем, как мы используем файлы cookie на нашем сайте.
        </p>
      </div>

      {saveMessage && (
        <div className={`mb-6 p-4 rounded-lg ${
          saveMessage.includes('Ошибка') 
            ? 'bg-red-50 border border-red-200 text-red-800' 
            : 'bg-green-50 border border-green-200 text-green-800'
        }`}>
          {saveMessage}
        </div>
      )}

      <div className="space-y-6">
        {/* Необходимые cookies */}
        <div className="flex items-start justify-between p-6 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-gray-950">Необходимые cookies</h3>
              <span className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded">
                Обязательные
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Эти файлы cookie необходимы для работы сайта и не могут быть отключены. 
              Они обеспечивают базовую функциональность, включая корзину покупок, авторизацию и безопасность.
            </p>
            <div className="text-xs text-gray-500">
              Включает: сессии, корзина, авторизация, безопасность
            </div>
          </div>
          <div className="flex-shrink-0 ml-6">
            <div className="w-12 h-6 bg-red-600 rounded-full flex items-center justify-end px-1">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Аналитические cookies */}
        <div className="flex items-start justify-between p-6 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-950 mb-2">Аналитические cookies</h3>
            <p className="text-sm text-gray-600 mb-3">
              Помогают нам понять, как посетители взаимодействуют с сайтом, чтобы улучшить его работу и пользовательский опыт.
            </p>
            <div className="text-xs text-gray-500">
              Включает: Google Analytics, статистика посещений, анализ поведения
            </div>
          </div>
          <div className="flex-shrink-0 ml-6">
            <button
              onClick={() => togglePreference('analytics')}
              className={`w-12 h-6 rounded-full flex items-center transition-colors duration-200 ${
                preferences.analytics ? 'bg-red-600 justify-end' : 'bg-gray-300 justify-start'
              } px-1`}
            >
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </button>
          </div>
        </div>

        {/* Маркетинговые cookies */}
        <div className="flex items-start justify-between p-6 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-950 mb-2">Маркетинговые cookies</h3>
            <p className="text-sm text-gray-600 mb-3">
              Используются для отслеживания посетителей и показа релевантной рекламы. 
              Помогают измерить эффективность рекламных кампаний.
            </p>
            <div className="text-xs text-gray-500">
              Включает: рекламные пиксели, ретаргетинг, социальные сети
            </div>
          </div>
          <div className="flex-shrink-0 ml-6">
            <button
              onClick={() => togglePreference('marketing')}
              className={`w-12 h-6 rounded-full flex items-center transition-colors duration-200 ${
                preferences.marketing ? 'bg-red-600 justify-end' : 'bg-gray-300 justify-start'
              } px-1`}
            >
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </button>
          </div>
        </div>

        {/* Функциональные cookies */}
        <div className="flex items-start justify-between p-6 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-950 mb-2">Функциональные cookies</h3>
            <p className="text-sm text-gray-600 mb-3">
              Обеспечивают расширенную функциональность и персонализацию сайта, 
              включая предпочтения и настройки пользователя.
            </p>
            <div className="text-xs text-gray-500">
              Включает: языковые настройки, персонализация, чат-боты
            </div>
          </div>
          <div className="flex-shrink-0 ml-6">
            <button
              onClick={() => togglePreference('functional')}
              className={`w-12 h-6 rounded-full flex items-center transition-colors duration-200 ${
                preferences.functional ? 'bg-red-600 justify-end' : 'bg-gray-300 justify-start'
              } px-1`}
            >
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Кнопки действий */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-200 flex-1 sm:flex-initial min-w-[140px]"
        >
          {isSaving ? 'Сохранение...' : 'Сохранить настройки'}
        </button>
        
        <button
          onClick={handleReset}
          className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 flex-1 sm:flex-initial min-w-[140px]"
        >
          Сбросить настройки
        </button>
      </div>

      {/* Дополнительная информация */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-blue-600">
              <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 15h-2v-2h2v2zm0-4h-2V5h2v6z" fill="currentColor"/>
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Информация о cookies</h4>
            <p className="text-sm text-blue-800">
              Изменения настроек cookies вступают в силу немедленно. Некоторые функции сайта могут работать некорректно при отключении определенных типов cookies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieSettings; 