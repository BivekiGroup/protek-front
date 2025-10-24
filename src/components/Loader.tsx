import React from 'react';

interface LoaderProps {
  text?: string;
  fullScreen?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const Loader: React.FC<LoaderProps> = ({
  text = 'Загрузка...',
  fullScreen = false,
  size = 'large'
}) => {
  const sizeMap = {
    small: { spinner: 'h-12 w-12', text: 'text-sm', logo: 'h-8 w-8' },
    medium: { spinner: 'h-20 w-20', text: 'text-base', logo: 'h-12 w-12' },
    large: { spinner: 'h-32 w-32', text: 'text-lg', logo: 'h-16 w-16' }
  };

  const sizes = sizeMap[size];

  const loaderContent = (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* Outer spinning ring */}
      <div className="relative">
        <div
          className={`${sizes.spinner} rounded-full border-4 border-gray-200`}
          style={{
            borderTopColor: '#EC1C24',
            borderRightColor: '#EC1C24',
            animation: 'spin 1s linear infinite'
          }}
        />

        {/* Inner pulsing logo */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ animation: 'pulse 2s ease-in-out infinite' }}
        >
          <div
            className={`${sizes.logo} bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center shadow-lg`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-2/3 h-2/3"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                fill="white"
                opacity="0.9"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.9"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.9"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Loading text with animated dots */}
      <div className={`${sizes.text} font-medium text-gray-700 flex items-center gap-1`}>
        <span>{text}</span>
        <span className="flex gap-1">
          <span style={{ animation: 'bounce 1.4s infinite 0s' }}>.</span>
          <span style={{ animation: 'bounce 1.4s infinite 0.2s' }}>.</span>
          <span style={{ animation: 'bounce 1.4s infinite 0.4s' }}>.</span>
        </span>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: translateY(0);
            opacity: 0.5;
          }
          40% {
            transform: translateY(-8px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center min-h-screen"
        style={{
          background: 'rgba(249, 250, 251, 0.95)',
          backdropFilter: 'blur(8px)'
        }}
        aria-live="polite"
      >
        {loaderContent}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-20" aria-live="polite">
      {loaderContent}
    </div>
  );
};

export default Loader;
