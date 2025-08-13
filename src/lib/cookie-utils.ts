interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export const getCookieConsent = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('cookieConsent');
};

export const getCookiePreferences = (): CookiePreferences | null => {
  if (typeof window === 'undefined') return null;
  const preferences = localStorage.getItem('cookiePreferences');
  return preferences ? JSON.parse(preferences) : null;
};

export const hasConsentForAnalytics = (): boolean => {
  const preferences = getCookiePreferences();
  return preferences?.analytics || false;
};

export const hasConsentForMarketing = (): boolean => {
  const preferences = getCookiePreferences();
  return preferences?.marketing || false;
};

export const hasConsentForFunctional = (): boolean => {
  const preferences = getCookiePreferences();
  return preferences?.functional || false;
};

export const isConsentGiven = (): boolean => {
  const consent = getCookieConsent();
  return consent !== null && consent !== 'declined';
};

export const resetCookieConsent = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('cookieConsent');
  localStorage.removeItem('cookiePreferences');
};

// Функция для интеграции с аналитикой (например, Google Analytics)
export const initializeAnalytics = (): void => {
  if (!hasConsentForAnalytics()) return;
  
  // Здесь можно добавить инициализацию Google Analytics или других сервисов
  console.log('Analytics initialized with user consent');
};

// Функция для интеграции с маркетинговыми инструментами
export const initializeMarketing = (): void => {
  if (!hasConsentForMarketing()) return;
  
  // Здесь можно добавить инициализацию маркетинговых пикселей
  console.log('Marketing tools initialized with user consent');
};

export type { CookiePreferences }; 