import * as React from "react";

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-[5000] max-w-[380px] bg-white rounded-2xl shadow-2xl border-2 border-gray-100 p-5 animate-slide-up"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Мы используем cookies
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Для улучшения работы сайта и персонализации вашего опыта.
            </p>
          </div>
        </div>
        <button
          onClick={handleAccept}
          className="w-full px-4 py-2.5 bg-[#EC1C24] hover:bg-[#d9151d] rounded-xl text-white text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
          style={{ color: '#ffffff' }}
        >
          Принять и продолжить
        </button>
      </div>
    </div>
  );
};

export default CookieConsent; 