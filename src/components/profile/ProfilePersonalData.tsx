import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { getCookiePreferences, CookiePreferences } from '@/lib/cookie-utils';
import toast from 'react-hot-toast';

interface ProfilePersonalDataProps {
  firstName: string;
  setFirstName: (v: string) => void;
  lastName: string;
  setLastName: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  emailNotifications: boolean;
  setEmailNotifications: (v: boolean) => void;
  hasChanges: boolean;
  onSave?: () => void;
}

const ProfilePersonalData: React.FC<ProfilePersonalDataProps> = ({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  phone,
  setPhone,
  email,
  setEmail,
  password,
  setPassword,
  emailNotifications,
  setEmailNotifications,
  hasChanges,
  onSave,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [cookiePreferences, setCookiePreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    const prefs = getCookiePreferences();
    if (prefs) {
      setCookiePreferences(prefs);
    }
  }, []);

  const toggleCookie = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return;
    const newPrefs = { ...cookiePreferences, [key]: !cookiePreferences[key] };
    setCookiePreferences(newPrefs);
    localStorage.setItem('cookieConsent', 'configured');
    localStorage.setItem('cookiePreferences', JSON.stringify(newPrefs));
    toast.success('Настройки cookies сохранены');
  };

  return (
    <div
      className="flex flex-col items-start w-full bg-white rounded-[16px]"
      style={{ padding: '40px', gap: '30px' }}
    >
      {/* Заголовок */}
      <h2
        className="font-bold text-[#000814]"
        style={{
          fontFamily: 'Onest, sans-serif',
          fontSize: '30px',
          lineHeight: '100%',
          fontWeight: 700
        }}
      >
        Персональные данные
      </h2>

      {/* Основной контент */}
      <div className="flex flex-col items-start w-full" style={{ gap: '30px' }}>
        {/* Строка 1: Номер телефона, Имя, Фамилия, Email */}
        <div className="flex flex-row items-start w-full" style={{ gap: '20px' }}>
          {/* Номер телефона */}
          <div
            className="flex flex-row items-center bg-[#F5F8FB] rounded-[12px] flex-1"
            style={{ padding: '16px 24px', gap: '10px', height: '52px' }}
          >
            <input
              type="text"
              placeholder="Номер телефона"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled
              className="w-full bg-transparent outline-none text-[#424F60]"
              style={{
                fontFamily: 'Onest, sans-serif',
                fontSize: '16px',
                fontWeight: 500,
                lineHeight: '100%'
              }}
            />
          </div>

          {/* Имя */}
          <div
            className="flex flex-row items-center bg-[#F5F8FB] rounded-[12px] flex-1"
            style={{ padding: '16px 24px', gap: '10px', height: '52px' }}
          >
            <input
              type="text"
              placeholder="Имя"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full bg-transparent outline-none text-[#424F60]"
              style={{
                fontFamily: 'Onest, sans-serif',
                fontSize: '16px',
                fontWeight: 500,
                lineHeight: '100%'
              }}
            />
          </div>

          {/* Фамилия */}
          <div
            className="flex flex-row items-center bg-[#F5F8FB] rounded-[12px] flex-1"
            style={{ padding: '16px 24px', gap: '10px', height: '52px' }}
          >
            <input
              type="text"
              placeholder="Фамилия"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full bg-transparent outline-none text-[#424F60]"
              style={{
                fontFamily: 'Onest, sans-serif',
                fontSize: '16px',
                fontWeight: 500,
                lineHeight: '100%'
              }}
            />
          </div>

          {/* Email */}
          <div
            className="flex flex-row items-center bg-[#F5F8FB] rounded-[12px] flex-1"
            style={{ padding: '16px 24px', gap: '10px', height: '52px' }}
          >
            <input
              type="email"
              placeholder="Адрес электронной почты"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent outline-none text-[#424F60]"
              style={{
                fontFamily: 'Onest, sans-serif',
                fontSize: '16px',
                fontWeight: 500,
                lineHeight: '100%'
              }}
            />
          </div>
        </div>

        {/* Подсказка */}
        <div
          className="w-full text-[#8893A2]"
          style={{
            fontFamily: 'Onest, sans-serif',
            fontSize: '16px',
            fontWeight: 500,
            lineHeight: '130%'
          }}
        >
          Вы можете изменить пароль для входа (необязательно)
        </div>

        {/* Строка 2: Пароль */}
        <div className="flex flex-row items-start w-full" style={{ gap: '20px' }}>
          {/* Пароль */}
          <div
            className="flex flex-row items-center bg-[#F5F8FB] rounded-[12px] flex-1"
            style={{ padding: '16px 24px', gap: '10px', height: '52px' }}
          >
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent outline-none text-[#424F60]"
              style={{
                fontFamily: 'Onest, sans-serif',
                fontSize: '16px',
                fontWeight: 500,
                lineHeight: '100%'
              }}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="flex-shrink-0 text-[#000000] hover:text-gray-700 focus:outline-none"
              aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
              style={{ width: '20px', height: '20px' }}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Switch для уведомлений */}
        <div
          className="flex flex-row items-center w-full"
          style={{ gap: '14px', height: '26px' }}
        >
          {/* Switch */}
          <button
            type="button"
            onClick={() => setEmailNotifications(!emailNotifications)}
            className="relative flex-shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            style={{ width: '44px', height: '26px' }}
            role="switch"
            aria-checked={emailNotifications}
          >
            <div
              className="absolute inset-0 rounded-full transition-colors"
              style={{
                background: emailNotifications ? '#EC1C24' : '#CBD5E3',
                borderRadius: '100px'
              }}
            />
            <div
              className="absolute bg-white rounded-full transition-transform"
              style={{
                width: '22px',
                height: '22px',
                top: '2px',
                left: emailNotifications ? '20px' : '2px',
              }}
            />
          </button>

          {/* Текст */}
          <span
            className="text-[#424F60]"
            style={{
              fontFamily: 'Onest, sans-serif',
              fontSize: '16px',
              fontWeight: 400,
              lineHeight: '140%'
            }}
          >
            Получать уведомления об акциях и новостях компании
          </span>
        </div>

        {/* Кнопка сохранения */}
        {onSave && (
          <button
            onClick={onSave}
            disabled={!hasChanges}
            className={`flex flex-row justify-center items-center rounded-[12px] transition-all focus:outline-none ${
              hasChanges ? 'hover:brightness-110' : ''
            }`}
            style={{
              padding: '14px 30px',
              gap: '10px',
              height: '50px',
              fontFamily: 'Onest, sans-serif',
              fontSize: '16px',
              fontWeight: 600,
              lineHeight: '120%',
              textAlign: 'center',
              backgroundColor: hasChanges ? '#EC1C24' : '#CBD5E3',
              color: '#FFFFFF',
              cursor: hasChanges ? 'pointer' : 'not-allowed',
              opacity: hasChanges ? 1 : 0.7
            }}
          >
            Сохранить изменения
          </button>
        )}

        {/* Настройки Cookies - компактный блок */}
        <div className="flex flex-col w-full pt-4 border-t border-gray-200" style={{ gap: '12px' }}>
          <h3 className="text-[#424F60] text-sm font-semibold">Настройки Cookies</h3>

          {/* Аналитические cookies */}
          <div className="flex flex-row items-center justify-between w-full">
            <span className="text-[#424F60] text-sm">Аналитические cookies</span>
            <button
              type="button"
              onClick={() => toggleCookie('analytics')}
              className="relative flex-shrink-0 rounded-full focus:outline-none"
              style={{ width: '36px', height: '20px' }}
              role="switch"
              aria-checked={cookiePreferences.analytics}
            >
              <div
                className="absolute inset-0 rounded-full transition-colors"
                style={{
                  background: cookiePreferences.analytics ? '#EC1C24' : '#CBD5E3',
                  borderRadius: '100px'
                }}
              />
              <div
                className="absolute bg-white rounded-full transition-transform"
                style={{
                  width: '16px',
                  height: '16px',
                  top: '2px',
                  left: cookiePreferences.analytics ? '18px' : '2px',
                }}
              />
            </button>
          </div>

          {/* Маркетинговые cookies */}
          <div className="flex flex-row items-center justify-between w-full">
            <span className="text-[#424F60] text-sm">Маркетинговые cookies</span>
            <button
              type="button"
              onClick={() => toggleCookie('marketing')}
              className="relative flex-shrink-0 rounded-full focus:outline-none"
              style={{ width: '36px', height: '20px' }}
              role="switch"
              aria-checked={cookiePreferences.marketing}
            >
              <div
                className="absolute inset-0 rounded-full transition-colors"
                style={{
                  background: cookiePreferences.marketing ? '#EC1C24' : '#CBD5E3',
                  borderRadius: '100px'
                }}
              />
              <div
                className="absolute bg-white rounded-full transition-transform"
                style={{
                  width: '16px',
                  height: '16px',
                  top: '2px',
                  left: cookiePreferences.marketing ? '18px' : '2px',
                }}
              />
            </button>
          </div>

          {/* Функциональные cookies */}
          <div className="flex flex-row items-center justify-between w-full">
            <span className="text-[#424F60] text-sm">Функциональные cookies</span>
            <button
              type="button"
              onClick={() => toggleCookie('functional')}
              className="relative flex-shrink-0 rounded-full focus:outline-none"
              style={{ width: '36px', height: '20px' }}
              role="switch"
              aria-checked={cookiePreferences.functional}
            >
              <div
                className="absolute inset-0 rounded-full transition-colors"
                style={{
                  background: cookiePreferences.functional ? '#EC1C24' : '#CBD5E3',
                  borderRadius: '100px'
                }}
              />
              <div
                className="absolute bg-white rounded-full transition-transform"
                style={{
                  width: '16px',
                  height: '16px',
                  top: '2px',
                  left: cookiePreferences.functional ? '18px' : '2px',
                }}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePersonalData;
