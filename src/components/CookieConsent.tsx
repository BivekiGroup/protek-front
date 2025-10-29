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
      className="fixed bottom-4 right-4 z-[5000] max-w-[320px] bg-white rounded-lg shadow-md border border-gray-200 p-3 text-xs"
    >
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <p className="text-gray-600 leading-tight mb-2">
            Мы используем cookies.{' '}
            <a
              href="/profile-set"
              className="text-red-600 underline hover:text-red-700"
            >
              Настройки
            </a>
          </p>
          <button
            onClick={handleAccept}
            className="w-full px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-white text-xs font-medium transition-colors duration-200"
          >
            Принять
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent; 