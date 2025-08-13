import React, { useRef } from "react";
import { useQuery } from '@apollo/client';
import ArticleCard from "../ArticleCard";
import CatalogProductCardSkeleton from "../CatalogProductCardSkeleton";
import { GET_NEW_ARRIVALS } from "@/lib/graphql";
import { PartsAPIArticle } from "@/types/partsapi";

const SCROLL_AMOUNT = 340; // px, ширина одной карточки + отступ

// Интерфейс для товара из GraphQL
interface Product {
  id: string;
  name: string;
  slug: string;
  article?: string;
  brand?: string;
  retailPrice?: number;
  wholesalePrice?: number;
  createdAt: string;
  images: Array<{
    id: string;
    url: string;
    alt?: string;
    order: number;
  }>;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

// Функция для преобразования Product в PartsAPIArticle
const transformProductToArticle = (product: Product, index: number): PartsAPIArticle => {
  return {
    artId: product.id,
    artArticleNr: product.article || `PROD-${product.id}`,
    artSupBrand: product.brand || 'Unknown Brand',
    supBrand: product.brand || 'Unknown Brand',
    supId: index + 1,
    productGroup: product.categories?.[0]?.name || product.name,
    ptId: index + 1,
  };
};

const NewArrivalsSection: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Получаем новые поступления через GraphQL
  const { data, loading, error } = useQuery(GET_NEW_ARRIVALS, {
    variables: { limit: 8 }
  });

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

  // Преобразуем данные для ArticleCard
  const newArrivalsArticles = data?.newArrivals?.map((product: Product, index: number) => 
    transformProductToArticle(product, index)
  ) || [];

  // Получаем изображения для товаров
  const getProductImage = (product: Product): string => {
    if (product.images && product.images.length > 0) {
      return product.images[0].url;
    }
    return "/images/162615.webp"; // fallback изображение
  };

  return (
    <section className="main">
      <div className="w-layout-blockcontainer container w-container">
        <div className="w-layout-vflex inbt">
          <div className="w-layout-hflex flex-block-31">
            <h2 className="heading-4">Новое поступление</h2>
          </div>
          <div className="carousel-row">
            {/* Стили для стрелок как в BestPriceSection и TopSalesSection */}
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
            <button 
              className="carousel-arrow carousel-arrow-left" 
              onClick={scrollLeft} 
              aria-label="Прокрутить влево"
              style={{ cursor: 'pointer' }}
            >
              <span className="arrow-circle">
                <svg className="arrow-svg" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.6673 10H3.33398M3.33398 10L8.33398 5M3.33398 10L8.33398 15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
            
            <div className="w-layout-hflex core-product-search carousel-scroll" ref={scrollRef}>
              {loading ? (
                // Показываем скелетоны во время загрузки
                Array(8).fill(0).map((_, index) => (
                  <CatalogProductCardSkeleton key={`skeleton-${index}`} />
                ))
              ) : error ? (
                // Показываем сообщение об ошибке
                <div className="error-message" style={{ 
                  padding: '20px', 
                  textAlign: 'center', 
                  color: '#666',
                  minWidth: '300px'
                }}>
                  <p>Не удалось загрузить новые поступления</p>
                  <p style={{ fontSize: '14px', marginTop: '8px' }}>
                    {error.message}
                  </p>
                </div>
                             ) : newArrivalsArticles.length > 0 ? (
                 // Показываем товары
                 newArrivalsArticles.map((article: PartsAPIArticle, index: number) => {
                   const product = data.newArrivals[index];
                   const image = getProductImage(product);
                   
                   return (
                     <ArticleCard 
                       key={article.artId || `article-${index}`} 
                       article={article} 
                       index={index} 
                       image={image}
                     />
                   );
                 })
              ) : (
                // Показываем сообщение о том, что товаров нет
                <div className="no-products-message" style={{ 
                  padding: '20px', 
                  textAlign: 'center', 
                  color: '#666',
                  minWidth: '300px'
                }}>
                  <p>Пока нет новых поступлений</p>
                </div>
              )}
            </div>
            
            <button 
              className="carousel-arrow carousel-arrow-right" 
              onClick={scrollRight} 
              aria-label="Прокрутить вправо"
              style={{ cursor: 'pointer' }}
            >
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

export default NewArrivalsSection; 