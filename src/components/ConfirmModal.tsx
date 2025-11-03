import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDangerous?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  onConfirm,
  onCancel,
  isDangerous = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '440px',
          width: '100%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          animation: 'modalFadeIn 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: isDangerous ? '#FEE2E2' : '#DBEAFE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
          }}
        >
          {isDangerous ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 9V13M12 17H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56995 17.3333 3.53223 19 5.07183 19Z"
                stroke="#DC2626"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="#2563EB"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#111827',
            margin: '0 0 8px 0',
            fontFamily: 'Onest, sans-serif',
          }}
        >
          {title}
        </h3>

        {/* Message */}
        <p
          style={{
            fontSize: '15px',
            color: '#6B7280',
            margin: '0 0 24px 0',
            lineHeight: '1.6',
            fontFamily: 'Onest, sans-serif',
          }}
        >
          {message}
        </p>

        {/* Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: '1px solid #E5E7EB',
              background: '#fff',
              color: '#374151',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Onest, sans-serif',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F9FAFB';
              e.currentTarget.style.borderColor = '#D1D5DB';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#fff';
              e.currentTarget.style.borderColor = '#E5E7EB';
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              background: isDangerous ? '#DC2626' : '#EC1C24',
              color: '#fff',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Onest, sans-serif',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDangerous ? '#B91C1C' : '#D11920';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDangerous ? '#DC2626' : '#EC1C24';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {confirmText}
          </button>
        </div>

        <style jsx>{`
          @keyframes modalFadeIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default ConfirmModal;
