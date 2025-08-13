import React, { useState, useEffect } from "react";
import { useQuery } from '@apollo/client';
import { GET_DAILY_PRODUCTS } from '@/lib/graphql';
import Link from 'next/link';
import ProductOfDayBanner from './ProductOfDayBanner';

interface DailyProduct {
  id: string;
  discount?: number;
  isActive: boolean;
  sortOrder: number;
  product: {
    id: string;
    name: string;
    slug: string;
    article?: string;
    brand?: string;
    retailPrice?: number;
    wholesalePrice?: number;
    images: Array<{
      id: string;
      url: string;
      alt?: string;
      order: number;
    }>;
  };
}

const ProductOfDaySection: React.FC = () => {
  // Получаем текущую дату в формате YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];
  
  // Состояние для текущего слайда
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const { data, loading, error } = useQuery<{ dailyProducts: DailyProduct[] }>(
    GET_DAILY_PRODUCTS,
    {
      variables: { displayDate: today },
      errorPolicy: 'all'
    }
  );

  // Фильтруем только активные товары и сортируем по sortOrder
  const activeProducts = React.useMemo(() => {
    if (!data?.dailyProducts) return [];
    return data.dailyProducts
      .filter(item => item.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [data]);

  // Корректный сброс currentSlide только если индекс вне диапазона
  useEffect(() => {
    if (currentSlide > activeProducts.length - 1) {
      setCurrentSlide(activeProducts.length > 0 ? activeProducts.length - 1 : 0);
    }
    // Если товаров стало больше и текущий слайд = 0, ничего не делаем
    // Если товаров стало меньше и текущий слайд в диапазоне, ничего не делаем
    // Если товаров стало меньше и текущий слайд вне диапазона, сбрасываем на последний
  }, [activeProducts.length]);

  // Текущий товар для отображения
  const currentProduct = activeProducts[currentSlide];

  // Функция для расчета цены со скидкой
  const calculateDiscountedPrice = (price: number, discount?: number) => {
    if (!discount) return price;
    return price * (1 - discount / 100);
  };

  // Функция для форматирования цены
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(Math.round(price));
  };

  // Функция для получения изображения товара (без обращений к PartsIndex на главной)
  const getProductImage = (product: DailyProduct['product']) => {
    // Сначала пытаемся использовать собственные изображения товара
    const productImage = product.images
      ?.sort((a, b) => a.order - b.order)
      ?.[0];
    
    if (productImage) {
      return {
        url: productImage.url,
        alt: productImage.alt || product.name,
        source: 'internal'
      };
    }

    // Если нет ни одной картинки, возвращаем noimage.png
    return {
      url: '/images/noimage.png',
      alt: product.name,
      source: 'noimage'
    };
  };

  // Обработчики для навигации по товарам дня
  const handlePrevSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentSlide(prev => prev === 0 ? activeProducts.length - 1 : prev - 1);
  };

  const handleNextSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentSlide(prev => prev === activeProducts.length - 1 ? 0 : prev + 1);
  };

  const handlePrevSlideTouch = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentSlide(prev => prev === 0 ? activeProducts.length - 1 : prev - 1);
  };

  const handleNextSlideTouch = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentSlide(prev => prev === activeProducts.length - 1 ? 0 : prev + 1);
  };

  const handleSlideIndicator = (index: number) => {
    setCurrentSlide(index);
  };

  // Если нет активных товаров дня, не показываем секцию
  if (loading || error || activeProducts.length === 0) {
    return null;
  }

  const product = currentProduct.product;
  const productImage = getProductImage(product);
  
  const originalPrice = product.retailPrice || product.wholesalePrice || 0;
  const discountedPrice = calculateDiscountedPrice(originalPrice, currentProduct.discount);
  const hasDiscount = currentProduct.discount && currentProduct.discount > 0;

  return (
    <section className="main">
      <div className="w-layout-blockcontainer batd w-container">
        <div className="w-layout-hflex flex-block-108">
          <ProductOfDayBanner />
          
          <div className="div-block-129">
            <div className="w-layout-hflex flex-block-109">
              <h1 className="heading-18">ТОВАРЫ ДНЯ</h1>
              {hasDiscount && (
                <div className="saletag">-{currentProduct.discount}%</div>
              )}
            </div>
            
            <div className="w-layout-hflex flex-block-110">
              <div className="w-layout-vflex flex-block-111">
                <div className="w-layout-hflex flex-block-16">
                  <div className="text-block-8">
                    от {formatPrice(discountedPrice)} ₽
                  </div>
                  {hasDiscount && (
                    <div className="text-block-9">
                      {formatPrice(originalPrice)} ₽
                    </div>
                  )}
                </div>
                <div className="text-block-10" title={product.name}>
                  {product.brand && `${product.brand} `}
                  {product.name}
                </div>
                {/* Счетчик товаров если их больше одного */}
                {/* {activeProducts.length > 1 && (
                  <div className="text-xs text-gray-500 mt-2">
                    {currentSlide + 1} из {activeProducts.length}
                  </div>
                )} */}
              </div>
              
              {productImage && (
                <div className="">
                  <img 
                    width="Auto" 
                    height="Auto" 
                    alt={productImage.alt} 
                    src={productImage.url} 
                    loading="lazy" 
                    className="image-5-copy"
                    style={{ cursor: 'pointer' }}
                  />
                  {productImage.source === 'noimage' && (
                    <div className="absolute bottom-0 right-0 bg-gray-400 text-white text-xs px-2 py-1 rounded-tl">
                      Нет изображения
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="w-layout-hflex flex-block-125">
              {/* Левая стрелка - предыдущий товар */}
              {activeProducts.length > 1 ? (
                <div 
                  className="div-block-134"
                  onClick={handlePrevSlide}
                  onMouseDown={(e) => e.preventDefault()}
                  onTouchStart={handlePrevSlideTouch}
                  style={{ cursor: 'pointer' }}
                  title="Предыдущий товар"
                >
                  <div className="code-embed-17 w-embed">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16.6673 10H3.33398M3.33398 10L8.33398 5M3.33398 10L8.33398 15" stroke="currentcolor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                </div>
              ) : (
                <div className="div-block-134" style={{ opacity: 0.3 }}>
                  <div className="code-embed-17 w-embed">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16.6673 10H3.33398M3.33398 10L8.33398 5M3.33398 10L8.33398 15" stroke="currentcolor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                </div>
              )}
              
              {/* Правая стрелка - следующий товар */}
              {activeProducts.length > 1 ? (
                <div 
                  className="div-block-134-copy"
                  onClick={handleNextSlide}
                  onMouseDown={(e) => e.preventDefault()}
                  onTouchStart={handleNextSlideTouch}
                  style={{ cursor: 'pointer' }}
                  title="Следующий товар"
                >
                  <div className="code-embed-17 w-embed">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16.6673 10H3.33398M3.33398 10L8.33398 5M3.33398 10L8.33398 15" stroke="currentcolor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                </div>
              ) : (
                <div className="div-block-134-copy" style={{ opacity: 0.3 }}>
                  <div className="code-embed-17 w-embed">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16.6673 10H3.33398M3.33398 10L8.33398 5M3.33398 10L8.33398 15" stroke="currentcolor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                </div>
              )}
              
              {/* Индикаторы точки */}
              <div className="w-layout-hflex flex-block-126">
                {activeProducts.length > 1 ? (
                  activeProducts.map((_, index) => (
                    <div
                      key={index}
                      className="div-block-135"
                      onClick={() => handleSlideIndicator(index)}
                      style={{ 
                        cursor: 'pointer',
                        opacity: index === currentSlide ? 1 : 0.5,
                        backgroundColor: index === currentSlide ? 'currentColor' : 'rgba(128,128,128,0.5)'
                      }}
                      title={`Товар ${index + 1}`}
                    />
                  ))
                ) : (
                  <>
                    <div className="div-block-135" style={{ backgroundColor: 'currentColor' }}></div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductOfDaySection; 
