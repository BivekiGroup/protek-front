
import React from "react";
import { useFavorites } from "@/contexts/FavoritesContext";

interface InfoCardProps {
  brand?: string;
  articleNumber?: string;
  name?: string;
  productId?: string;
  offerKey?: string;
  price?: number;
  currency?: string;
  image?: string;
}

export default function InfoCard({ 
  brand, 
  articleNumber, 
  name, 
  productId, 
  offerKey, 
  price = 0, 
  currency = 'RUB', 
  image 
}: InfoCardProps) {
  const { addToFavorites, removeFromFavorites, isFavorite, favorites } = useFavorites();

  // Проверяем, есть ли товар в избранном
  const isItemFavorite = isFavorite(productId, offerKey, articleNumber, brand);

  // Обработчик клика по сердечку
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isItemFavorite) {
      // Находим товар в избранном по правильному ID
      const favoriteItem = favorites.find((fav: any) => {
        // Проверяем по разным комбинациям идентификаторов
        if (productId && fav.productId === productId) return true;
        if (offerKey && fav.offerKey === offerKey) return true;
        if (fav.article === articleNumber && fav.brand === brand) return true;
        return false;
      });
      
      if (favoriteItem) {
        removeFromFavorites(favoriteItem.id);
      }
    } else {
      // Добавляем в избранное
      addToFavorites({
        productId,
        offerKey,
        name: name || "Название товара",
        brand: brand || "БРЕНД",
        article: articleNumber || "АРТИКУЛ",
        price,
        currency,
        image
      });
    }
  };

  return (
    <section className="section-info">
      <div className="w-layout-blockcontainer container info w-container">
        <div className="w-layout-vflex flex-block-9">
          <div className="w-layout-hflex flex-block-7">
            <a href="/" className="link-block w-inline-block">
              <div>Главная</div>
            </a>
            <div className="text-block-3">→</div>
            <a href="/catalog" className="link-block w-inline-block">
              <div>Каталог</div>
            </a>
            <div className="text-block-3">→</div>
            <a href="#" className="link-block w-inline-block">
              <div>Автозапчасти</div>
            </a>
            <div className="text-block-3">→</div>
            <a href="#" className="link-block-2 w-inline-block">
              <div>{name || "Деталь"} </div>
            </a>
          </div>
          <div className="w-layout-hflex flex-block-bi">
            <div className="w-layout-hflex headingbi" style={{ alignItems: 'center' }}>
              <h1 className="heading-bi">{name || "Название товара"}</h1>
              <div className="w-layout-hflex" style={{ alignItems: 'center', gap: '12px' }}>
                <div className="text-block-5-copy">
                  <span className="brand-name">{brand || "БРЕНД"}</span> 
                  <strong className="bold-text">{articleNumber || "АРТИКУЛ"}</strong>
                </div>
                <div 
                  className="heart-icon-only" 
                  onClick={handleFavoriteClick}
                  style={{ 
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path 
                      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                      fill={isItemFavorite ? "#e53935" : "#D0D0D0"}
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 