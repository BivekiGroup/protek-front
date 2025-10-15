import * as React from "react";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onRequestLogin?: () => void;
}

const featureItems = [
  {
    image: "/images/auth/auth-garage.png",
    title: "Добавляйте авто в гараж",
    subtitle: "Для быстрого подбора"
  },
  {
    image: "/images/auth/auth-favorites.png", 
    title: "Сохраняйте в избранное",
    subtitle: "Не теряйте важные товары"
  },
  {
    image: "/images/auth/auth-orders.png",
    title: "Отслеживайте заказы", 
    subtitle: "Статусы, история и покупки"
  }
];

export const AuthModal: React.FC<AuthModalProps> = ({ open, onClose, onRequestLogin }) => {
  if (!open) return null;
  
  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 transition-opacity"
        onClick={onClose}
        style={{ animation: "fadeIn 0.2s" }}
      >
        <div
          className="relative flex flex-col gap-8 p-12 max-w-full bg-white rounded-[20px] w-[640px] max-md:w-[95vw] max-md:p-6 max-md:gap-6 max-md:rounded-2xl max-md:max-h-[90vh] max-md:overflow-y-auto"
          onClick={e => e.stopPropagation()}
          style={{
            fontFamily: 'Onest, sans-serif'
          }}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 flex items-center justify-center w-6 h-6"
            style={{ zIndex: 10 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.8 4.8L19.2 19.2" stroke="#8893A1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19.2 4.8L4.8 19.2" stroke="#8893A1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Header section */}
          <div className="flex flex-col gap-[10px]">
            <div>
              <h1 style={{
                fontSize: '30px',
                fontWeight: 800,
                lineHeight: '1.4em',
                color: '#000814',
                margin: 0,
                width: '600px'
              }}
              className="max-md:!text-2xl max-md:!w-full max-sm:!text-xl"
              >
                Войдите, чтобы продолжить
              </h1>
            </div>
            <p style={{
              fontSize: '16px',
              fontWeight: 400,
              lineHeight: '1.399999976158142em',
              color: '#424F60',
              margin: 0
            }}
            className="max-md:text-sm"
            >
              Эта страница <span className="text-[#EC1C24]">доступна только авторизованным пользователям.</span> После входа вы сможете пользоваться всеми возможностями:
            </p>
          </div>

          {/* Login button */}
          <div style={{ height: '50px' }} className="max-md:h-auto">
            <button
              onClick={onRequestLogin}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '20px 30px',
                backgroundColor: '#EC1C24',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                height: '100%'
              }}
              className="max-md:!px-6 max-md:!py-4 max-md:!h-auto max-md:!gap-3 max-md:w-full max-md:justify-center"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 17L15 12L10 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 12H3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{
                fontSize: '16px',
                fontWeight: 500,
                lineHeight: '1.2em',
                color: 'white'
              }}
              className="max-md:text-sm"
              >
                Войти
              </span>
            </button>
          </div>

          {/* Feature cards */}
          <div className="flex gap-4 w-full max-md:flex-col max-md:gap-3">
            {featureItems.map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '20px',
                  backgroundColor: '#F5F8FB',
                  borderRadius: '32px',
                  flex: '1'
                }}
                className="max-md:!p-4 max-md:!rounded-2xl"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  style={{
                    width: '100px',
                    height: '100px',
                    objectFit: 'cover'
                  }}
                  className="max-md:!w-20 max-md:!h-20"
                />
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignSelf: 'stretch',
                  gap: '8px'
                }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 800,
                    lineHeight: '1.2em',
                    textAlign: 'center',
                    color: '#000814'
                  }}
                  className="max-md:text-sm"
                  >
                    {item.title}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    lineHeight: '1.2em',
                    textAlign: 'center',
                    color: '#8893A1'
                  }}
                  className="max-md:text-xs"
                  >
                    {item.subtitle}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default AuthModal;
