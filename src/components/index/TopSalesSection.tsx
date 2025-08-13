import React, { useRef } from "react";
import { useQuery } from "@apollo/client";
import TopSalesItem from "../TopSalesItem";
import { GET_TOP_SALES_PRODUCTS } from "../../lib/graphql";
import { useCart } from "@/contexts/CartContext";

interface TopSalesProductData {
  id: string;
  productId: string;
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

const TopSalesSection: React.FC = () => {
  const { data, loading, error } = useQuery(GET_TOP_SALES_PRODUCTS);
  const { isInCart: isItemInCart } = useCart();
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
          <div className="w-layout-vflex inbt">
            <div className="w-layout-hflex flex-block-31">
              <h2 className="heading-4">Топ продаж</h2>
            </div>
            <div className="carousel-row">
              <button className="carousel-arrow carousel-arrow-left" onClick={scrollLeft} aria-label="Прокрутить влево">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="16" fill="#F3F4F6"/>
                  <path d="M19.5 24L12.5 16L19.5 8" stroke="#222" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <div className="w-layout-hflex core-product-search carousel-scroll" ref={scrollRef}>
                <div className="text-block-58">Загрузка...</div>
              </div>
              <button className="carousel-arrow carousel-arrow-right" onClick={scrollRight} aria-label="Прокрутить вправо">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="16" fill="#F3F4F6"/>
                  <path d="M12.5 8L19.5 16L12.5 24" stroke="#222" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    console.error('Ошибка загрузки топ продаж:', error);
    return (
      <section className="main">
        <div className="w-layout-blockcontainer container w-container">
          <div className="w-layout-vflex inbt">
            <div className="w-layout-hflex flex-block-31">
              <h2 className="heading-4">Топ продаж</h2>
            </div>
            <div className="carousel-row">
              <button className="carousel-arrow carousel-arrow-left" onClick={scrollLeft} aria-label="Прокрутить влево">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="16" fill="#F3F4F6"/>
                  <path d="M19.5 24L12.5 16L19.5 8" stroke="#222" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <div className="w-layout-hflex core-product-search carousel-scroll" ref={scrollRef}>
                <div className="text-block-58">Ошибка загрузки</div>
              </div>
              <button className="carousel-arrow carousel-arrow-right" onClick={scrollRight} aria-label="Прокрутить вправо">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="16" fill="#F3F4F6"/>
                  <path d="M12.5 8L19.5 16L12.5 24" stroke="#222" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Фильтруем активные товары и сортируем по sortOrder
  const activeTopSalesProducts = (data?.topSalesProducts || [])
    .filter((item: TopSalesProductData) => item.isActive)
    .sort((a: TopSalesProductData, b: TopSalesProductData) => a.sortOrder - b.sortOrder)
    .slice(0, 8); // Ограничиваем до 8 товаров

  if (activeTopSalesProducts.length === 0) {
    return (
      <section className="main">
        <div className="w-layout-blockcontainer container w-container">
          <div className="w-layout-vflex inbt">
            <div className="w-layout-hflex flex-block-31">
              <h2 className="heading-4">Топ продаж</h2>
            </div>
            <div className="carousel-row">
              <button className="carousel-arrow carousel-arrow-left" onClick={scrollLeft} aria-label="Прокрутить влево">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="16" fill="#F3F4F6"/>
                  <path d="M19.5 24L12.5 16L19.5 8" stroke="#222" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <div className="w-layout-hflex core-product-search carousel-scroll" ref={scrollRef}>
                <div className="text-block-58">Нет товаров в топ продаж</div>
              </div>
              <button className="carousel-arrow carousel-arrow-right" onClick={scrollRight} aria-label="Прокрутить вправо">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="16" fill="#F3F4F6"/>
                  <path d="M12.5 8L19.5 16L12.5 24" stroke="#222" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="main">
      <div className="w-layout-blockcontainer container w-container">
        <div className="w-layout-vflex inbt">
          <div className="w-layout-hflex flex-block-31">
            <h2 className="heading-4">Топ продаж</h2>
          </div>
          <div className="carousel-row">
            {/* Стили для стрелок как в BestPriceSection */}
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
            <div className="w-layout-hflex core-product-search carousel-scroll" ref={scrollRef}>
              {activeTopSalesProducts.map((item: TopSalesProductData) => {
                const product = item.product;
                const price = product.retailPrice 
                  ? `от ${product.retailPrice.toLocaleString('ru-RU')} ₽`
                  : 'По запросу';
                
                const image = product.images && product.images.length > 0 
                  ? product.images[0].url 
                  : '/images/162615.webp'; // Fallback изображение

                const title = product.name;
                const brand = product.brand || 'Неизвестный бренд';
                const isInCart = isItemInCart(product.id, undefined, product.article, brand);

                return (
                  <TopSalesItem
                    key={item.id}
                    image={image}
                    price={price}
                    title={title}
                    brand={brand}
                    article={product.article}
                    productId={product.id}
                    isInCart={isInCart}
                  />
                );
              })}
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

export default TopSalesSection; 