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
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <div
        layer-name="cookie"
        className="box-border flex gap-16 justify-between items-center px-16 py-10 mx-auto my-0 w-full bg-white rounded-3xl shadow-sm max-w-[1240px] max-md:flex-col max-md:gap-10 max-md:px-10 max-md:py-8 max-md:text-center max-sm:gap-5 max-sm:p-5 max-sm:rounded-2xl fixed bottom-6 left-1/2 -translate-x-1/2 z-5000"
      >
        <div
          layer-name="Мы используем cookie-файлы, чтобы получить статистику, которая помогает нам улучшать сайт для Вас. Нажимая Принять, вы даёте согласие на использование ваших cookie-файлов. Подробнее о том, как мы используем ваши персональные данные, в нашей Политике обработки персональных данных."
          className="flex-1 text-base font-medium leading-5 text-red-600 max-w-[933px] max-md:max-w-full max-sm:text-sm"
        >
          <span className="text-base text-gray-600">
            Мы используем cookie-файлы, чтобы получить статистику, которая
            помогает нам улучшать сайт для Вас. Нажимая Принять, вы даёте
            согласие на использование ваших cookie-файлов. Подробнее о том, как
            мы используем ваши персональные данные, в нашей{' '}
          </span>
          <a
            href="/privacy-policy"
            className="text-base text-red-600 underline hover:text-red-700"
            target="_blank"
            rel="noopener noreferrer"
          >
            Политике обработки персональных данных.
          </a>
        </div>
        <button
          onClick={handleAccept}
          className="box-border flex gap-5 justify-center items-center px-8 py-4 bg-red-600 hover:bg-red-700 rounded-xl h-[51px] min-w-[126px] max-md:w-full max-md:max-w-[200px] max-sm:px-5 max-sm:py-3.5 max-sm:w-full max-sm:h-auto focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200"
        >
          <span
            layer-name="Принять"
            className="text-base font-semibold leading-5 text-center text-white max-sm:text-sm"
          >
            Принять
          </span>
        </button>
      </div>
    </>
  );
};

export default CookieConsent; 