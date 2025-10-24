import React from 'react';

const CatalogProductCardSkeleton: React.FC = () => {
  return (
    <div
      data-article-card="skeleton"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '20px',
        gap: '10px',
        width: '250px',
        height: '343px',
        background: '#FFFFFF',
        borderRadius: '12px',
        position: 'relative',
        boxSizing: 'border-box',
        boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)',
      }}
    >
      {/* Favorite button skeleton - top right */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '36px',
          height: '36px',
          background: '#F5F8FB',
          borderRadius: '50%',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }}
      />

      {/* Image skeleton */}
      <div
        style={{
          position: 'relative',
          width: '210px',
          height: '190px',
          borderRadius: '12px',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s infinite',
          flexShrink: 0,
        }}
      >
        {/* Discount badge skeleton */}
        <div
          style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            width: '70px',
            height: '24px',
            background: 'rgba(0, 0, 0, 0.1)',
            borderRadius: '6px',
          }}
        />
      </div>

      {/* Price skeleton */}
      <div
        style={{
          width: '120px',
          height: '22px',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s infinite',
          borderRadius: '4px',
        }}
      />

      {/* Title skeleton - 2 lines */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div
          style={{
            width: '100%',
            height: '16px',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s infinite',
            borderRadius: '4px',
          }}
        />
        <div
          style={{
            width: '75%',
            height: '16px',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s infinite',
            borderRadius: '4px',
          }}
        />
      </div>

      {/* Brand skeleton */}
      <div
        style={{
          width: '90px',
          height: '16px',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s infinite',
          borderRadius: '4px',
        }}
      />

      {/* Cart button skeleton - bottom right */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          width: '32px',
          height: '32px',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s infinite',
          borderRadius: '8px',
        }}
      />

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default CatalogProductCardSkeleton; 