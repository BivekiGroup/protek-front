import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/router";
import { useFavorites } from "@/contexts/FavoritesContext";
import { ChevronsUpDown, ChevronUp, ChevronDown } from "../icons";
import ProductItemCard from "./ProductItemCard";
import ProductListSkeleton from "./ProductListSkeleton";

// Custom Tooltip Component with Portal for better z-index handling
const CustomTooltip = ({ children, text }: { children: React.ReactNode; text: string }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showTooltip && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top + window.scrollY - 60, // 60px above the trigger
        left: rect.left + window.scrollX + rect.width / 2
      });
    }
  }, [showTooltip]);

  return (
    <>
      <div
        ref={triggerRef}
        style={{ position: 'relative', display: 'inline-block' }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {children}
      </div>
      {showTooltip && typeof window !== 'undefined' && createPortal(
        <div
          style={{
            position: 'absolute',
            top: `${position.top}px`,
            left: `${position.left}px`,
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.94))',
            color: '#f8fafc',
            padding: '10px 12px',
            borderRadius: '8px',
            fontSize: '13px',
            lineHeight: '1.4',
            zIndex: 999999,
            boxShadow: '0 16px 32px rgba(15, 23, 42, 0.25)',
            maxWidth: '320px',
            whiteSpace: 'normal' as any,
            wordWrap: 'break-word',
            textAlign: 'center' as any,
            pointerEvents: 'none'
          }}
        >
          {text}
        </div>,
        document.body
      )}
    </>
  );
};

// Sorting types
type SortKey = 'delivery' | 'stock' | 'price';
type SortDirection = 'asc' | 'desc';

// Default sort directions for each column
const DEFAULT_SORT_DIRECTION: Record<SortKey, SortDirection> = {
  delivery: 'asc',
  stock: 'desc',
  price: 'asc'
};

// Sort Icon Component
const SortIcon = ({ direction, active }: { direction: 'asc' | 'desc'; active: boolean }) => {
  if (!active) {
    return <ChevronsUpDown className="core-offers-table__header-icon" aria-hidden="true" />;
  }

  if (direction === 'asc') {
    return <ChevronUp className="core-offers-table__header-icon is-active" aria-hidden="true" />;
  }

  return <ChevronDown className="core-offers-table__header-icon is-active" aria-hidden="true" />;
};

interface ProductListProps {
  offers: any[];
  isLoading?: boolean;
  hasMoreOffers?: boolean;
  onShowMore?: () => void;
  remainingCount?: number;
}

const ProductList = ({
  offers = [],
  isLoading = false,
  hasMoreOffers = false,
  onShowMore,
  remainingCount = 0
}: ProductListProps) => {
  const router = useRouter();

  // Sorting state
  const [sortBy, setSortBy] = useState<SortKey>('price');
  const [sortDirection, setSortDirection] = useState<SortDirection>(DEFAULT_SORT_DIRECTION['price']);
  // Показываем скелетон во время загрузки
  if (isLoading) {
    return <ProductListSkeleton count={4} />;
  }

  // Фильтруем предложения - показываем только те, у которых есть цена
  const validOffers = offers.filter(offer => offer && offer.price && offer.price > 0);

  // Sort offers based on current sort settings
  const sortedOffers = [...validOffers].sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case 'delivery':
        aValue = typeof a.deliveryTime === 'number' ? a.deliveryTime : (a.deliveryDays || 0);
        bValue = typeof b.deliveryTime === 'number' ? b.deliveryTime : (b.deliveryDays || 0);
        break;
      case 'stock':
        aValue = typeof a.quantity === 'number' ? a.quantity : 0;
        bValue = typeof b.quantity === 'number' ? b.quantity : 0;
        break;
      case 'price':
        aValue = a.price || 0;
        bValue = b.price || 0;
        break;
      default:
        return 0;
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });

  // Если нет валидных предложений
  if (validOffers.length === 0) {
    return (
      <div className="w-layout-vflex product-list-search">
        <div className="text-center py-8">
          <p className="text-gray-500">Предложения с ценами не найдены</p>
        </div>
      </div>
    );
  }

  // Sorting functions
  const handleSortChange = (key: SortKey) => {
    if (sortBy === key) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortDirection(DEFAULT_SORT_DIRECTION[key]);
    }
  };

  // Static header for non-sortable columns
  const renderStaticHeader = (label: string, extraClass?: string) => (
    <div className={`core-offers-table__cell core-offers-table__cell--header${extraClass ? ` ${extraClass}` : ''}`}>
      <span className="core-offers-table__header-content">
        <span className="core-offers-table__header-label">{label}</span>
      </span>
    </div>
  );

  // Sortable header for sortable columns
  const renderSortHeader = (label: string, key: SortKey, extraClass?: string) => {
    const isActive = sortBy === key;
    const currentDirection = isActive ? sortDirection : DEFAULT_SORT_DIRECTION[key];

    const handleClick = () => handleSortChange(key);
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleSortChange(key);
      }
    };

    return (
      <div 
        className={`core-offers-table__cell core-offers-table__cell--header${extraClass ? ` ${extraClass}` : ''} core-offers-table__cell--sortable${isActive ? ' is-active' : ''}`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`Сортировать по ${label} ${isActive && currentDirection === 'asc' ? 'по убыванию' : 'по возрастанию'}`}
      >
        <span className="core-offers-table__header-content">
          <span className="core-offers-table__header-label">{label}</span>
          <SortIcon direction={currentDirection} active={isActive} />
        </span>
      </div>
    );
  };

  // Get product info from the first offer for the header
  const firstOffer = validOffers[0];
  const brand = firstOffer?.brand || '';
  const articleNumber = firstOffer?.articleNumber || '';
  const name = firstOffer?.name || '';

  const { addToFavorites, removeFromFavorites, isFavorite, favorites } = useFavorites();

  // Check if item is favorite using first offer data
  const productId = firstOffer?.productId || firstOffer?.id;
  const offerKey = firstOffer?.offerKey;
  const isItemFavorite = isFavorite(productId, offerKey, articleNumber, brand);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isItemFavorite) {
      const favoriteItem = favorites.find((fav: any) => {
        if (productId && fav.productId === productId) return true;
        if (offerKey && fav.offerKey === offerKey) return true;
        if (fav.article === articleNumber && fav.brand === brand) return true;
        return false;
      });

      if (favoriteItem) {
        removeFromFavorites(favoriteItem.id);
      }
    } else {
      addToFavorites({
        productId: productId ? String(productId) : undefined,
        offerKey: offerKey || undefined,
        name: name || `${brand} ${articleNumber}`,
        brand: brand,
        article: articleNumber,
        price: firstOffer?.price || 0,
        currency: 'RUB',
        image: firstOffer?.image || undefined
      });
    }
  };

  return (
    <div 
      className="w-layout-vflex product-list-search" 
      style={{ 
        backgroundColor: '#FFFFFF', 
        borderRadius: '12px', 
        padding: '8px'
      } as React.CSSProperties}
    >
      {/* Product header section matching CoreProductCard exactly */}
      <div className="w-layout-vflex product-list-search-s1" style={{ paddingTop: 0, marginTop: 0 } as React.CSSProperties}>
        <div className="w-layout-vflex core-product-s1" style={{ paddingTop: 0, marginTop: 0 } as React.CSSProperties}>
          <div className="w-layout-vflex flex-block-47" style={{ paddingTop: 0, marginTop: 0 } as React.CSSProperties}>
            <div className="div-block-19">
              <CustomTooltip text="Оригинальные предложения Protek — рекомендуем для быстрого заказа">
                <img 
                  src="/images/icons/filter-icon.svg" 
                  alt="Оригинальные предложения Protek — рекомендуем для быстрого заказа"
                  width="32"
                  height="32"
                  style={{ background: 'none', border: 'none', display: 'block', cursor: 'help' }}
                />
              </CustomTooltip>
            </div>
            <div className="w-layout-vflex flex-block-50">
              <div className="core-product-header-line" style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' } as React.CSSProperties}>
                <h3 className="heading-10 name brand" style={{ marginTop: 0, marginBottom: 0, marginRight: 8, display: 'inline-block' } as React.CSSProperties}>{brand}</h3>
                <h3 className="heading-10" style={{ marginTop: 0, marginBottom: 0, marginRight: 8, display: 'inline-block' } as React.CSSProperties}>{articleNumber}</h3>
                <div
                  className="favorite-icon w-embed"
                  onClick={handleFavoriteClick}
                  style={{ cursor: 'pointer', marginLeft: 8, color: isItemFavorite ? '#e53935' : undefined, display: 'inline-flex', alignItems: 'center', marginTop: 0, marginBottom: 0 } as React.CSSProperties}
                >
                  <svg width="24" height="24" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M15 25L13.405 23.5613C7.74 18.4714 4 15.1035 4 10.9946C4 7.6267 6.662 5 10.05 5C11.964 5 13.801 5.88283 15 7.26703C16.199 5.88283 18.036 5 19.95 5C23.338 5 26 7.6267 26 10.9946C26 15.1035 22.26 18.4714 16.595 23.5613L15 25Z"
                      fill={isItemFavorite ? "#e53935" : "currentColor"}
                    />
                  </svg>
                </div>
              </div>
              <div className="text-block-21 mt-1">{name}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Table with headers and data */}
      <div className="core-offers-table">
        <div className="core-offers-table__row core-offers-table__row--head">
          {renderStaticHeader('Наименование', 'core-offers-table__cell--name')}
          {renderStaticHeader('Артикул', 'core-offers-table__cell--article')}
          {renderStaticHeader('Производитель', 'core-offers-table__cell--brand')}
          {renderSortHeader('Доставка', 'delivery', 'core-offers-table__cell--delivery')}
          {renderSortHeader('Наличие', 'stock', 'core-offers-table__cell--stock')}
          {renderSortHeader('Цена, ₽', 'price', 'core-offers-table__cell--price core-offers-table__cell--header-right')}
          {renderStaticHeader('Кол-во', 'core-offers-table__cell--qty')}
        </div>
        {sortedOffers.map((offer, idx) => (
          <ProductItemCard 
            key={`${offer.type}-${offer.id || idx}`} 
            offer={offer}
            index={idx}
            isLast={idx === sortedOffers.length - 1} 
          />
        ))}
      </div>

      {/* Bottom section with "Show more offers" and "Search analogs" button */}
      <div 
        className="w-full flex justify-between"
        style={{
          alignItems: 'center',
          padding: '15px 20px 10px',
          gap: '20px'
        } as React.CSSProperties}
      >
        {/* Show More Offers (moved from ShowMoreOffers component) */}
        {hasMoreOffers && remainingCount > 0 && (
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            } as React.CSSProperties}
            onClick={onShowMore}
          >
            <span
              style={{
                fontFamily: 'Onest',
                fontWeight: 600,
                fontSize: '14px',
                lineHeight: '1.2em',
                color: '#0D336C'
              } as React.CSSProperties}
            >
              Показать еще предложения ({remainingCount})
            </span>
            <svg 
              width="12" 
              height="6" 
              viewBox="0 0 12 6" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              style={{ flexShrink: 0 } as React.CSSProperties}
            >
              <path 
                d="M1 1L6 5L11 1" 
                stroke="#EC1414" 
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
        
        <button
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 20px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #EC1C24',
            borderRadius: '12px',
            cursor: 'pointer',
            fontFamily: 'Onest',
            fontWeight: 500,
            fontSize: '14px',
            lineHeight: '1.2em',
            color: '#000000'
          } as React.CSSProperties}
          onClick={() => {
            // Navigate to search page with brand and article number
            router.push(`/search-result?article=${encodeURIComponent(articleNumber)}&brand=${encodeURIComponent(brand)}`);
          }}
        >
          Поиск аналогов
        </button>
      </div>
    </div>
  );
};

export default ProductList; 