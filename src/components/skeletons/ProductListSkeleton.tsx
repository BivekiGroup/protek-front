/**
 * ProductListSkeleton
 * Скелетон для отображения списка товаров во время загрузки.
 * Используйте этот компонент вместо списка товаров, когда данные еще не получены.
 *
 * @param {number} [count=4] - Количество скелетон-элементов для отображения.
 * @example
 * <ProductListSkeleton count={6} />
 */
import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface ProductListSkeletonProps {
  count?: number;
}

const ProductListSkeleton: React.FC<ProductListSkeletonProps> = ({ count = 8 }) => {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="w-layout-vflex flex-block-15-copy animate-pulse">
          {/* Избранное */}
          <div className="favcardcat">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
          </div>
          
          {/* Изображение товара */}
          <div className="div-block-4">
            <div className="w-full h-48 bg-gray-200 rounded"></div>
            <div className="absolute top-2 right-2 w-12 h-6 bg-gray-200 rounded"></div>
          </div>
          
          {/* Информация о товаре */}
          <div className="div-block-3">
            {/* Цена */}
            <div className="w-layout-hflex flex-block-16">
              <div className="w-20 h-6 bg-gray-200 rounded"></div>
              <div className="w-16 h-4 bg-gray-200 rounded"></div>
            </div>
            
            {/* Название товара */}
            <div className="space-y-2 mt-2">
              <div className="w-full h-4 bg-gray-200 rounded"></div>
              <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
            </div>
            
            {/* Бренд */}
            <div className="w-1/2 h-4 bg-gray-200 rounded mt-2"></div>
          </div>
          
          {/* Кнопка "Купить" */}
          <div className="catc w-inline-block">
            <div className="div-block-25">
              <div className="w-6 h-6 bg-gray-200 rounded"></div>
            </div>
            <div className="w-12 h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </>
  );
};

// Улучшенный компонент скелетона только для цены
export const PriceSkeleton: React.FC = () => {
  return (
    <div className="inline-flex items-center">
      <div className="animate-pulse">
        <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded" style={{ 
          width: '80px',
          backgroundImage: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
          animation: 'shimmer 1.5s ease-in-out infinite'
        }}></div>
      </div>
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductListSkeleton; 