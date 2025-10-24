import React, { useState } from "react";
import { useFavorites } from "@/contexts/FavoritesContext";

interface CatalogProductCardProps {
  image: string;
  discount: string;
  price: string;
  oldPrice: string;
  title: string;
  brand: string;
  articleNumber?: string;
  brandName?: string;
  artId?: string;
  productId?: string;
  offerKey?: string;
  currency?: string;
  priceElement?: React.ReactNode;
  onAddToCart?: (e: React.MouseEvent) => void | Promise<void>;
  isInCart?: boolean;
  outOfStock?: boolean; // Новый флаг для товаров без наличия
}

const CatalogProductCard: React.FC<CatalogProductCardProps> = ({
  image,
  discount,
  price,
  oldPrice,
  title,
  brand,
  articleNumber,
  brandName,
  artId,
  productId,
  offerKey,
  currency = 'RUB',
  priceElement,
  onAddToCart,
  isInCart = false,
  outOfStock = false,
}) => {
  const { addToFavorites, removeFromFavorites, isFavorite, favorites } = useFavorites();
  const [localInCart, setLocalInCart] = useState(false);
  const [isCartButtonHovered, setIsCartButtonHovered] = useState(false);
  const [isCardHovered, setIsCardHovered] = useState(false);

  const displayImage = image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjEwIiBoZWlnaHQ9IjE5MCIgdmlld0JveD0iMCAwIDIxMCAxOTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMTAiIGhlaWdodD0iMTkwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NSA5NUw5NSA4NUwxMjUgMTE1TDE0MCA5NUwxNjUgMTIwSDE2NVY5MEg0NVY5MEw4NSA5NVoiIGZpbGw9IiNEMUQ1REIiLz4KPGNpcmNsZSBjeD0iNzUiIGN5PSI3NSIgcj0iMTAiIGZpbGw9IiNEMUQ1REIiLz4KPHRleHQgeD0iMTA1IiB5PSIxNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gaW1hZ2U8L3RleHQ+Cjwvc3ZnPgo=';

  const cardUrl = articleNumber && brandName 
    ? `/card?article=${encodeURIComponent(articleNumber)}&brand=${encodeURIComponent(brandName)}${artId ? `&artId=${artId}` : ''}`
    : '/card';

  const isItemFavorite = isFavorite(productId, offerKey, articleNumber, brandName || brand);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const numericPrice = parseFloat(price.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    if (isItemFavorite) {
      const favoriteItem = favorites.find((fav: any) => {
        if (productId && fav.productId === productId) return true;
        if (offerKey && fav.offerKey === offerKey) return true;
        if (fav.article === articleNumber && fav.brand === (brandName || brand)) return true;
        return false;
      });
      if (favoriteItem) {
        removeFromFavorites(favoriteItem.id);
      }
    } else {
      addToFavorites({
        productId,
        offerKey,
        name: title,
        brand: brandName || brand,
        article: articleNumber || '',
        price: numericPrice,
        currency,
        image
      });
    }
  };

  const handleBuyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (outOfStock) {
      return; // Не делаем ничего для товаров без наличия
    }

    if (onAddToCart) {
      onAddToCart(e);
    } else {
      window.location.href = cardUrl;
    }
  };

  const handleOpenCard = () => {
    window.location.href = cardUrl;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOpenCard();
    }
  };

  return (
    <div
      data-article-card="visible"
      itemScope
      itemType="https://schema.org/Product"
      onClick={handleOpenCard}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => setIsCardHovered(false)}
      role="link"
      tabIndex={0}
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
        cursor: 'pointer',
        boxSizing: 'border-box',
        boxShadow: isCardHovered ? '0 30px 54px rgba(15, 23, 42, 0.14)' : '0 20px 40px rgba(15, 23, 42, 0.08)',
        transform: isCardHovered ? 'translateY(-6px)' : 'translateY(0)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      {/* Favorite button - top right */}
      <div
        onClick={handleFavoriteClick}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '36px',
          height: '36px',
          background: '#F5F8FB',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 1,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.5996 3.5C15.8107 3.5 17.5 5.1376 17.5 7.19629C17.5 8.46211 16.9057 9.65758 15.7451 11.0117C14.8712 12.0314 13.7092 13.1034 12.3096 14.3311L10.833 15.6143L10.832 15.6152L10 16.3369L9.16797 15.6152L9.16699 15.6143L7.69043 14.3311C6.29084 13.1034 5.12883 12.0314 4.25488 11.0117C3.09428 9.65758 2.50003 8.46211 2.5 7.19629C2.5 5.1376 4.18931 3.5 6.40039 3.5C7.6497 3.50012 8.85029 4.05779 9.62793 4.92188L10 5.33398L10.3721 4.92188C11.1497 4.05779 12.3503 3.50012 13.5996 3.5Z" fill={isItemFavorite ? '#e53935' : '#9CA3AF'} />
        </svg>
      </div>

      {/* Image container with discount badge */}
      <div
        style={{
          position: 'relative',
          width: '210px',
          height: '190px',
          borderRadius: '12px',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <img
          src={displayImage}
          loading="lazy"
          alt={title}
          itemProp="image"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
        {/* Discount badge - top left of image */}
        {discount && (
          <div
            style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              padding: '4px 8px',
              background: '#4DB45E',
              borderRadius: '6px',
              fontFamily: 'Onest',
              fontWeight: 600,
              fontSize: '12px',
              lineHeight: '140%',
              color: '#FFFFFF',
            }}
          >
            {discount}
          </div>
        )}
      </div>

      {/* Price section */}
      <div style={{ display: 'flex', flexDirection: 'row', gap: '15px', alignItems: 'flex-end' }}>
        {priceElement ? (
          <div style={{
            fontFamily: 'Onest',
            fontWeight: 800,
            fontSize: '18px',
            lineHeight: '120%',
            color: '#000000',
          }}>
            {priceElement}
          </div>
        ) : (
          <div itemProp="offers" itemScope itemType="https://schema.org/Offer">
            <span
              itemProp="price"
              style={{
                fontFamily: 'Onest',
                fontWeight: 800,
                fontSize: '18px',
                lineHeight: '120%',
                color: '#000000',
              }}
            >
              {price}
            </span>
            <meta itemProp="priceCurrency" content={currency} />
          </div>
        )}
        {oldPrice && (
          <span
            style={{
              fontFamily: 'Onest',
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '120%',
              textDecoration: 'line-through',
              color: '#8893A2',
            }}
          >
            {oldPrice}
          </span>
        )}
      </div>

      {/* Product title */}
      <div
        itemProp="name"
        style={{
          fontFamily: 'Onest',
          fontWeight: 400,
          fontSize: '14px',
          lineHeight: '140%',
          color: '#000814',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          width: '100%',
        }}
      >
        {title}
      </div>

      {/* Brand */}
      <div
        itemProp="brand"
        itemScope
        itemType="https://schema.org/Brand"
        style={{
          fontFamily: 'Onest',
          fontWeight: 700,
          fontSize: '14px',
          lineHeight: '140%',
          color: '#000814',
        }}
      >
        <span itemProp="name">{brand}</span>
      </div>

      {/* Cart button - серая для товаров без наличия */}
      <div
        onClick={outOfStock ? undefined : handleBuyClick}
        onMouseEnter={() => !outOfStock && setIsCartButtonHovered(true)}
        onMouseLeave={() => !outOfStock && setIsCartButtonHovered(false)}
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          width: '32px',
          height: '32px',
          background: outOfStock ? '#94A3B8' : (isCartButtonHovered ? '#D81B21' : '#EC1C24'),
          border: `1px solid ${outOfStock ? '#94A3B8' : '#EC1C24'}`,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: outOfStock ? 'not-allowed' : 'pointer',
          opacity: outOfStock ? 0.5 : 1,
          transition: 'background 0.2s ease, transform 0.2s ease',
          transform: 'none',
        }}
        role="button"
        tabIndex={0}
        aria-label={outOfStock ? 'Нет в наличии' : 'Купить'}
        title={outOfStock ? 'Нет в наличии' : 'Добавить в корзину'}
      >
        <svg width="14" height="14" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.1998 22.2C8.8798 22.2 7.81184 23.28 7.81184 24.6C7.81184 25.92 8.8798 27 10.1998 27C11.5197 27 12.5997 25.92 12.5997 24.6C12.5997 23.28 11.5197 22.2 10.1998 22.2ZM3 3V5.4H5.39992L9.71977 14.508L8.09982 17.448C7.90783 17.784 7.79984 18.18 7.79984 18.6C7.79984 19.92 8.8798 21 10.1998 21H24.5993V18.6H10.7037C10.5357 18.6 10.4037 18.468 10.4037 18.3L10.4397 18.156L11.5197 16.2H20.4594C21.3594 16.2 22.1513 15.708 22.5593 14.964L26.8552 7.176C26.9542 6.99286 27.004 6.78718 26.9997 6.57904C26.9955 6.37089 26.9373 6.16741 26.8309 5.98847C26.7245 5.80952 26.5736 5.66124 26.3927 5.55809C26.2119 5.45495 26.0074 5.40048 25.7992 5.4H8.05183L6.92387 3H3ZM22.1993 22.2C20.8794 22.2 19.8114 23.28 19.8114 24.6C19.8114 25.92 20.8794 27 22.1993 27C23.5193 27 24.5993 25.92 24.5993 24.6C24.5993 23.28 23.5193 22.2 22.1993 22.2Z" fill="#FFFFFF" />
        </svg>
      </div>

      <meta itemProp="sku" content={articleNumber || ''} />
    </div>
  );
};

export default CatalogProductCard; 
