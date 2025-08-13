import React, { useRef } from "react";
import { useQuery } from "@apollo/client";
import BestPriceItem from "../BestPriceItem";
import { GET_BEST_PRICE_PRODUCTS } from "../../lib/graphql";

interface BestPriceProductData {
  id: string;
  productId: string;
  discount: number;
  isActive: boolean;
  sortOrder: number;
  product: {
    id: string;
    name: string;
    article?: string;
    brand?: string;
    retailPrice?: number;
    images: { url: string; alt?: string }[];
  };
}

const SCROLL_AMOUNT = 340; // px, ширина одной карточки + отступ

const BestPriceSection: React.FC = () => {
  const { data, loading, error } = useQuery(GET_BEST_PRICE_PRODUCTS);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -SCROLL_AMOUNT, behavior: 'smooth' });
    }
  };
  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: SCROLL_AMOUNT, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <section className="main">
        <div className="w-layout-blockcontainer container w-container">
          <div className="w-layout-hflex flex-block-118">
            <div className="w-layout-vflex flex-block-119">
              <h1 className="heading-20">ЛУЧШАЯ ЦЕНА!</h1>
              <div className="text-block-58">Загрузка...</div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    console.error('Ошибка загрузки товаров с лучшей ценой:', error);
    return (
      <section className="main">
        <div className="w-layout-blockcontainer container w-container">
          <div className="w-layout-hflex flex-block-118">
            <div className="w-layout-vflex flex-block-119">
              <h1 className="heading-20">ЛУЧШАЯ ЦЕНА!</h1>
              <div className="text-block-58">Ошибка загрузки данных</div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const bestPriceProducts: BestPriceProductData[] = data?.bestPriceProducts || [];

  // Функция для форматирования цены
  const formatPrice = (price?: number) => {
    if (!price) return '—';
    return `от ${price.toLocaleString('ru-RU')} ₽`;
  };

  // Функция для расчета цены со скидкой
  const calculateDiscountedPrice = (price?: number, discount?: number) => {
    if (!price || !discount) return price;
    return price * (1 - discount / 100);
  };

  // Преобразование данных для компонента BestPriceItem
  const bestPriceItems = bestPriceProducts
    .filter(item => item.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 8) // Ограничиваем до 8 товаров
    .map(item => ({
      image: item.product.images?.[0]?.url || "images/162615.webp", // Fallback изображение
      discount: `-${item.discount}%`,
      price: formatPrice(calculateDiscountedPrice(item.product.retailPrice, item.discount)),
      oldPrice: formatPrice(item.product.retailPrice),
      title: item.product.name,
      brand: item.product.brand || "",
      article: item.product.article,
      productId: item.product.id,
    }));

  // Если нет товаров, не показываем секцию
  if (bestPriceItems.length === 0) {
    return null;
  }

  return (
    <section className="main">
      <div className="w-layout-blockcontainer container w-container">
        <div className="w-layout-hflex flex-block-118">
          <div className="w-layout-vflex flex-block-119">
            <h1 className="heading-20">ЛУЧШАЯ ЦЕНА!</h1>
            <div className="text-block-58">Подборка лучших предложенийпо цене</div>
            <a href="#" className="button-24 w-button">Показать все</a>
          </div>
          <div className="carousel-row" style={{ position: 'relative' }}>
            {/* Стили для стрелок как в ProductOfDayBanner, но без абсолютного позиционирования */}
            <style>{`
              .carousel-arrow {
                width: 40px;
                height: 40px;
                border: none;
                background: none;
                padding: 0;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                opacity: 1;
                transition: opacity 0.2s;
                cursor: pointer;
                margin: 0 8px;
              }
              .carousel-arrow-left {}
              .carousel-arrow-right {}
              .carousel-arrow .arrow-circle {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: rgba(255,255,255,0.85);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s;
              }
              .carousel-arrow:hover .arrow-circle,
              .carousel-arrow:focus .arrow-circle {
                background: #ec1c24;
              }
              .carousel-arrow .arrow-svg {
                width: 20px;
                height: 20px;
                display: block;
                transition: stroke 0.2s;
                stroke: #222;
              }
              .carousel-arrow:hover .arrow-svg,
              .carousel-arrow:focus .arrow-svg {
                stroke: #fff;
              }
              .carousel-row {
                display: flex;
                align-items: center;
                justify-content: flex-start;
              }
            `}</style>
            <button className="carousel-arrow carousel-arrow-left" onClick={scrollLeft} aria-label="Прокрутить влево">
              <span className="arrow-circle">
                <svg className="arrow-svg" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.6673 10H3.33398M3.33398 10L8.33398 5M3.33398 10L8.33398 15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
            <div className="w-layout-hflex flex-block-121 carousel-scroll" ref={scrollRef}>
              {bestPriceItems.map((item, i) => (
                <BestPriceItem key={i} {...item} />
              ))}
            </div>
            <button className="carousel-arrow carousel-arrow-right" onClick={scrollRight} aria-label="Прокрутить вправо">
              <span className="arrow-circle">
                <svg className="arrow-svg" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.33398 10H16.6673M16.6673 10L11.6673 5M16.6673 10L11.6673 15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BestPriceSection; 