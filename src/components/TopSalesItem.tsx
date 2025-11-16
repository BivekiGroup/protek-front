import Link from "next/link";
import React, { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import toast from "react-hot-toast";

interface TopSalesItemProps {
  image: string;
  price: string;
  title: string;
  brand: string;
  article?: string;
  productId?: string;
  onAddToCart?: (e: React.MouseEvent) => void;
  salePercent?: number;
  oldPrice?: string;
  isNew?: boolean;
  isInCart?: boolean;
  outOfStock?: boolean;
  offerKey?: string;
  isExternal?: boolean;
  numericPrice?: number;
  supplier?: string;
  deliveryTime?: number;
  stock?: number;
}

const TopSalesItem: React.FC<TopSalesItemProps> = ({
  image,
  price,
  title,
  brand,
  article,
  productId,
  onAddToCart,
  salePercent,
  oldPrice,
  isNew = false,
  isInCart: propIsInCart = false,
  outOfStock = false,
  offerKey,
  isExternal = false,
  numericPrice,
  supplier,
  deliveryTime,
  stock,
}) => {
  const { addItem, isInCart: isItemInCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite, favorites } = useFavorites();
  const [localInCart, setLocalInCart] = useState(false);

  const isItemFavorite = isFavorite(productId, undefined, article, brand);

  const isInCart = isItemInCart(productId, undefined, article, brand);

  const parsePrice = (priceStr: string): number => {
    const cleanPrice = priceStr.replace(/[^\d.,]/g, '').replace(',', '.');
    return parseFloat(cleanPrice) || 0;
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (outOfStock) {
      return; // Не делаем ничего для товаров без наличия
    }

    if (onAddToCart) {
      onAddToCart(e);
      return;
    }
    try {
      if (!article || !brand) {
        toast.error('Недостаточно данных для добавления товара в корзину');
        return;
      }
      const finalPrice = numericPrice !== undefined ? numericPrice : parsePrice(price);

      addItem({
        productId: isExternal ? undefined : productId,
        offerKey: isExternal ? offerKey : undefined,
        name: title,
        brand: brand,
        article: article,
        description: title,
        price: finalPrice,
        quantity: 1,
        currency: 'RUB',
        image: image,
        stock: stock,
        supplier: supplier,
        deliveryTime: deliveryTime ? String(deliveryTime) : undefined,
        isExternal: isExternal
      });
      toast.success('Товар добавлен в корзину');
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error);
      toast.error('Ошибка добавления товара в корзину');
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isItemFavorite) {
      const favoriteItem = favorites.find((fav: any) => {
        if (productId && fav.productId === productId) return true;
        if (fav.article === article && fav.brand === brand) return true;
        return false;
      });
      if (favoriteItem) {
        removeFromFavorites(favoriteItem.id);
      }
    } else {
      const numericPrice = parsePrice(price);
      addToFavorites({
        productId,
        name: title,
        brand: brand,
        article: article || '',
        price: numericPrice,
        currency: 'RUB',
        image: image
      });
    }
  };

  // Ссылка на карточку товара
  const cardUrl = article && brand
    ? `/card?article=${encodeURIComponent(article)}&brand=${encodeURIComponent(brand)}`
    : '/card';

  const handleOpenCard = () => {
    window.location.href = cardUrl;
  };

  const favoriteLabel = isItemFavorite ? 'Удалить из избранного' : 'Добавить в избранное';
  const cartLabel = 'Добавить в корзину';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOpenCard();
    }
  };

  return (
    <div
      className="best-price-card top-sales-item"
      onClick={handleOpenCard}
      onKeyDown={handleKeyDown}
      role="link"
      tabIndex={0}
      style={{ cursor: "pointer", position: "relative" }}
    >
      <div 
        className={`favcardcat${isItemFavorite ? ' favorite-active' : ''}`}
        onClick={handleFavoriteClick}
        style={{ 
          position: "absolute", 
          top: 15, 
          right: 15, 
          cursor: 'pointer', 
          color: isItemFavorite ? '#EC1C24' : '#D0D0D0',
          border: "none", 
          padding: 0 
        }}
        aria-label={favoriteLabel}
        title={favoriteLabel}
      >
        <div className="icon-setting w-embed">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.5996 3.5C15.8107 3.5 17.5 5.1376 17.5 7.19629C17.5 8.46211 16.9057 9.65758 15.7451 11.0117C14.8712 12.0314 13.7092 13.1034 12.3096 14.3311L10.833 15.6143L10.832 15.6152L10 16.3369L9.16797 15.6152L9.16699 15.6143L7.69043 14.3311C6.29084 13.1034 5.12883 12.0314 4.25488 11.0117C3.09428 9.65758 2.50003 8.46211 2.5 7.19629C2.5 5.1376 4.18931 3.5 6.40039 3.5C7.6497 3.50012 8.85029 4.05779 9.62793 4.92188L10 5.33398L10.3721 4.92188C11.1497 4.05779 12.3503 3.50012 13.5996 3.5Z" fill="currentColor" />
          </svg>
        </div>
      </div>
      <div className="div-block-4">
        <img
          src={image}
          loading="lazy"
          width="Auto"
          height="Auto"
          alt={title}
          className="image-5"
        />
        {typeof salePercent === "number" && salePercent > 0 ? (
          <div className="text-block-7 best-price-discount">-{salePercent}%</div>
        ) : null}
        {isNew ? (
          <div className="best-price-new-tag">NEW</div>
        ) : null}
      </div>
      <div className="div-block-3">
        <div className="w-layout-hflex flex-block-16 best-price-price-row">
          <div className="text-block-8">{price}</div>
          {oldPrice ? <div className="text-block-9 best-price-old-price">{oldPrice}</div> : null}
        </div>
        <div className="w-layout-hflex flex-block-122">
          <div className="w-layout-vflex">
            <div className="text-block-10">{title}</div>
            <div className="text-block-11">{brand}</div>
          </div>
          <button
            type="button"
            className="button-icon w-inline-block"
            onClick={outOfStock ? undefined : handleAddToCart}
            aria-label={outOfStock ? 'Нет в наличии' : cartLabel}
            title={outOfStock ? 'Нет в наличии' : cartLabel}
            disabled={outOfStock}
            style={{
              cursor: outOfStock ? "not-allowed" : "pointer",
              border: "none",
              padding: 0,
              opacity: outOfStock ? 0.5 : 1,
              backgroundColor: outOfStock ? '#94A3B8' : undefined,
            }}
          >
            <div className="div-block-26" style={{
              backgroundColor: outOfStock ? '#94A3B8' : undefined
            }}>
              <div className="icon-setting w-embed">
                <svg width="currentWidht" height="currentHeight" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.1998 22.2C8.8798 22.2 7.81184 23.28 7.81184 24.6C7.81184 25.92 8.8798 27 10.1998 27C11.5197 27 12.5997 25.92 12.5997 24.6C12.5997 23.28 11.5197 22.2 10.1998 22.2ZM3 3V5.4H5.39992L9.71977 14.508L8.09982 17.448C7.90783 17.784 7.79984 18.18 7.79984 18.6C7.79984 19.92 8.8798 21 10.1998 21H24.5993V18.6H10.7037C10.5357 18.6 10.4037 18.468 10.4037 18.3L10.4397 18.156L11.5197 16.2H20.4594C21.3594 16.2 22.1513 15.708 22.5593 14.964L26.8552 7.176C26.9542 6.99286 27.004 6.78718 26.9997 6.57904C26.9955 6.37089 26.9373 6.16741 26.8309 5.98847C26.7245 5.80952 26.5736 5.66124 26.3927 5.55809C26.2119 5.45495 26.0074 5.40048 25.7992 5.4H8.05183L6.92387 3H3ZM22.1993 22.2C20.8794 22.2 19.8114 23.28 19.8114 24.6C19.8114 25.92 20.8794 27 22.1993 27C23.5193 27 24.5993 25.92 24.5993 24.6C24.5993 23.28 23.5193 22.2 22.1993 22.2Z" fill="currentColor" />
                </svg>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopSalesItem; 
