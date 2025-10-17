import React, { useState, useEffect } from "react";
import { ChevronsUpDown, ChevronUp, ChevronDown } from "./icons";
import { BadgeCheck } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import toast from "react-hot-toast";
import CartIcon from "./CartIcon";
import { isDeliveryDate } from "@/lib/utils";

// Custom Tooltip Component
const CustomTooltip = ({ children, text }: { children: React.ReactNode; text: string }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div 
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      {showTooltip && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: '8px',
            backgroundColor: '#333',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            zIndex: 1000,
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            maxWidth: '250px',
            whiteSpace: 'normal' as any,
            wordWrap: 'break-word',
            textAlign: 'center' as any
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
};

const INITIAL_OFFERS_LIMIT = 5;

type SortKey = 'stock' | 'delivery' | 'price';

const DEFAULT_SORT_DIRECTION: Record<SortKey, 'asc' | 'desc'> = {
  stock: 'desc',
  delivery: 'asc',
  price: 'asc'
};

const SortIcon = ({ direction, active }: { direction: 'asc' | 'desc'; active: boolean }) => {
  if (!active) {
    return <ChevronsUpDown className="core-offers-table__header-icon" aria-hidden="true" />;
  }

  if (direction === 'asc') {
    return <ChevronUp className="core-offers-table__header-icon is-active" aria-hidden="true" />;
  }

  return <ChevronDown className="core-offers-table__header-icon is-active" aria-hidden="true" />;
};

interface CoreProductCardOffer {
  id?: string;
  productId?: string;
  offerKey?: string;
  pcs: string;
  days: string;
  recommended?: boolean;
  price: string;
  count: string;
  isExternal?: boolean;
  currency?: string;
  warehouse?: string;
  supplier?: string;
  deliveryTime?: number;
  hasStock?: boolean;
  isInCart?: boolean;
  brandName?: string;
  articleNumber?: string;
  productName?: string;
  region?: string;
}

interface CoreProductCardProps {
  brand: string;
  article: string;
  name: string;
  image?: string;
  offers: CoreProductCardOffer[];
  showMoreText?: string;
  isAnalog?: boolean;
  isLoadingOffers?: boolean;
  onLoadOffers?: () => void;
  partsIndexPowered?: boolean;
  hasStock?: boolean;
}

const CoreProductCard: React.FC<CoreProductCardProps> = ({ 
  brand, 
  article, 
  name, 
  image, 
  offers, 
  showMoreText, 
  isAnalog = false,
  isLoadingOffers = false,
  onLoadOffers,
  partsIndexPowered = false,
  hasStock = true
}) => {
  const { addItem, state: cartState } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite, favorites } = useFavorites();
  const [visibleOffersCount, setVisibleOffersCount] = useState(INITIAL_OFFERS_LIMIT);
  const [sortBy, setSortBy] = useState<SortKey>('price'); // Локальная сортировка для каждого товара
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(DEFAULT_SORT_DIRECTION.price);
  const [quantities, setQuantities] = useState<{ [key: number]: number }>(
    offers.reduce((acc, _, index) => ({ ...acc, [index]: 1 }), {})
  );
  const [inputValues, setInputValues] = useState<{ [key: number]: string }>(
    offers.reduce((acc, _, index) => ({ ...acc, [index]: "1" }), {})
  );
  const [quantityErrors, setQuantityErrors] = useState<{ [key: number]: string }>({});
  const [localInCart, setLocalInCart] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    setInputValues(offers.reduce((acc, _, index) => ({ ...acc, [index]: "1" }), {}));
    setQuantities(offers.reduce((acc, _, index) => ({ ...acc, [index]: 1 }), {}));
  }, [offers.length]);

  // Функция для парсинга цены из строки
  const parsePrice = (priceStr: string): number => {
    const cleanPrice = priceStr.replace(/[^\d.,]/g, '').replace(',', '.');
    return parseFloat(cleanPrice) || 0;
  };

  // Функция для парсинга количества в наличии
  const parseStock = (stockStr: string): number => {
    const match = stockStr.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  // Функция для парсинга времени доставки
  const parseDeliveryTime = (daysStr: string): string => {
    // Если это дата (содержит название месяца), возвращаем как есть
    if (isDeliveryDate(daysStr)) {
      return daysStr;
    }
    // Иначе парсим как количество дней (для обратной совместимости)
    const match = daysStr.match(/\d+/);
    return match ? `${match[0]} дней` : daysStr;
  };

  const formatDeliveryDisplay = (value?: string): string => {
    if (!value) return '';
    const trimmed = value.trim();
    return trimmed.toLowerCase() === 'в день заказа' ? '1 день' : trimmed;
  };

  // Функция сортировки предложений
  const sortOffers = (offers: CoreProductCardOffer[]) => {
    const sorted = [...offers];

    const compareBySort = (a: CoreProductCardOffer, b: CoreProductCardOffer) => {
      let result = 0;

      if (sortBy === 'stock') {
        const aStock = parseStock(a.pcs);
        const bStock = parseStock(b.pcs);
        const normalizedA = Number.isNaN(aStock) ? -Infinity : aStock;
        const normalizedB = Number.isNaN(bStock) ? -Infinity : bStock;
        result = normalizedA - normalizedB;
      } else if (sortBy === 'delivery') {
        const aDelivery = typeof a.deliveryTime === 'number' ? a.deliveryTime : 999;
        const bDelivery = typeof b.deliveryTime === 'number' ? b.deliveryTime : 999;
        result = aDelivery - bDelivery;
      } else if (sortBy === 'price') {
        result = parsePrice(a.price) - parsePrice(b.price);
      }

      if (result === 0) return 0;

      return sortDirection === 'asc' ? result : -result;
    };

    sorted.sort((a, b) => {
      if (a.recommended && !b.recommended) return -1;
      if (!a.recommended && b.recommended) return 1;
      if (!a.isExternal && b.isExternal) return -1;
      if (a.isExternal && !b.isExternal) return 1;
      return compareBySort(a, b);
    });

    return sorted;
  };

  const sortedOffers = sortOffers(offers);
  const displayedOffers = sortedOffers.slice(0, visibleOffersCount);
  const hasMoreOffers = visibleOffersCount < sortedOffers.length;

  // Проверяем, есть ли товар в избранном
  const isItemFavorite = isFavorite(
    offers[0]?.productId, 
    offers[0]?.offerKey, 
    article, 
    brand
  );

  // Теперь используем isInCart флаг из backend вместо frontend проверки

  const getExistingCartQuantity = (offer: CoreProductCardOffer): number => {
    const existingItem = cartState.items.find(item => {
      if (offer.offerKey && item.offerKey) return item.offerKey === offer.offerKey;
      if (offer.productId && item.productId) return item.productId === offer.productId;
      if (item.article && item.brand) {
        return item.article === article && item.brand === brand;
      }
      return false;
    });

    return existingItem?.quantity ?? 0;
  };

  const getRemainingStock = (offer: CoreProductCardOffer): number | undefined => {
    const parsedStock = parseStock(offer.pcs);

    if (parsedStock === null || parsedStock === undefined || Number.isNaN(parsedStock)) {
      return undefined;
    }

    if (parsedStock <= 0) {
      return 0;
    }

    const existingQuantity = getExistingCartQuantity(offer);
    return Math.max(parsedStock - existingQuantity, 0);
  };

  const handleInputChange = (idx: number, val: string) => {
    setInputValues(prev => ({ ...prev, [idx]: val }));
    if (val === "") return;

    const offer = offers[idx];
    const requested = Math.max(1, parseInt(val, 10) || 1);
    const remainingStock = getRemainingStock(offer);

    let finalQuantity = requested;
    if (typeof remainingStock === 'number') {
      finalQuantity = Math.min(requested, Math.max(remainingStock, 0));
    }

    if (finalQuantity < 1) {
      finalQuantity = 1;
    }

    setQuantities(prev => ({ ...prev, [idx]: finalQuantity }));

    if (typeof remainingStock === 'number' && requested > remainingStock) {
      setQuantityErrors(prev => ({ ...prev, [idx]: `Доступно не более ${remainingStock} шт.` }));
      setInputValues(prev => ({ ...prev, [idx]: String(finalQuantity) }));
    } else {
      setQuantityErrors(prev => {
        if (!prev[idx]) return prev;
        const { [idx]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleInputBlur = (idx: number) => {
    if (inputValues[idx] === "") {
      setInputValues(prev => ({ ...prev, [idx]: "1" }));
      setQuantities(prev => ({ ...prev, [idx]: 1 }));
    }
  };

  const handleAddToCart = async (offer: CoreProductCardOffer, index: number) => {
    const isAuthenticated = typeof window !== 'undefined' ? Boolean(localStorage.getItem('authToken')) : true;

    if (!isAuthenticated) {
      toast.error('Авторизуйтесь, чтобы добавить товар в корзину');
      return;
    }

    setLocalInCart(prev => ({ ...prev, [index]: true }));
    const quantity = quantities[index] || 1;
    const availableStock = parseStock(offer.pcs);
    const existingQuantity = getExistingCartQuantity(offer);
    const remainingStock = typeof availableStock === 'number'
      ? Math.max(availableStock - existingQuantity, 0)
      : undefined;
    const inCart = offer.isInCart || false; // Use backend flag
    
    const numericPrice = parsePrice(offer.price);

    if (typeof remainingStock === 'number') {
      if (remainingStock !== undefined && remainingStock <= 0) {
        const errorMessage = availableStock !== undefined && availableStock <= 0
          ? 'Товара нет в наличии'
          : 'В корзине уже максимальное количество этого товара';
        toast.error(errorMessage);
        setQuantityErrors(prev => ({ ...prev, [index]: errorMessage }));
        setLocalInCart(prev => ({ ...prev, [index]: false }));
        return;
      }

      if (quantity > remainingStock) {
        const clampedQuantity = Math.max(1, remainingStock);
        setQuantities(prev => ({ ...prev, [index]: clampedQuantity }));
        setInputValues(prev => ({ ...prev, [index]: String(clampedQuantity) }));
        const errorMessage = `Можно добавить не более ${remainingStock} шт.`;
        setQuantityErrors(prev => ({ ...prev, [index]: errorMessage }));
        toast.error(errorMessage);
        setLocalInCart(prev => ({ ...prev, [index]: false }));
        return;
      }
    }

    setQuantityErrors(prev => {
      if (!prev[index]) return prev;
      const { [index]: _, ...rest } = prev;
      return rest;
    });

    const result = await addItem({
      productId: offer.productId,
      offerKey: offer.offerKey,
      name: name,
      description: `${brand} ${article} - ${name}`,
      brand: brand,
      article: article,
      price: numericPrice,
      currency: offer.currency || 'RUB',
      quantity: quantity,
      stock: availableStock, // передаем информацию о наличии
      deliveryTime: parseDeliveryTime(offer.days),
      warehouse: offer.warehouse || 'Склад',
      supplier: offer.supplier || (offer.isExternal ? 'AutoEuro' : 'Protek'),
      isExternal: offer.isExternal || false,
      image: image,
    });

    if (result.success) {
      // Показываем тоастер с разным текстом в зависимости от того, был ли товар уже в корзине
      const toastMessage = inCart 
        ? `Количество увеличено (+${quantity} шт.)`
        : 'Товар добавлен в корзину!';
      
      toast.success(
        <div>
          <div className="font-semibold" style={{ color: '#fff' }}>{toastMessage}</div>
          <div className="text-sm" style={{ color: '#fff', opacity: 0.9 }}>{`${brand} ${article} (${quantity} шт.)`}</div>
        </div>,
        {
          duration: 3000,
          icon: <CartIcon size={20} color="#fff" />,
        }
      );

      setLocalInCart(prev => ({ ...prev, [index]: false }));
    } else {
      // Показываем ошибку
      toast.error(result.error || 'Ошибка при добавлении товара в корзину');
      setLocalInCart(prev => ({ ...prev, [index]: false }));
    }
  };

  // Обработчик клика по сердечку
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isItemFavorite) {
      // Находим товар в избранном и удаляем по правильному ID
      const favoriteItem = favorites.find((item: any) => {
        // Проверяем по разным комбинациям идентификаторов
        if (offers[0]?.productId && item.productId === offers[0].productId) return true;
        if (offers[0]?.offerKey && item.offerKey === offers[0].offerKey) return true;
        if (item.article === article && item.brand === brand) return true;
        return false;
      });
      
      if (favoriteItem) {
        removeFromFavorites(favoriteItem.id);
      }
    } else {
      // Добавляем в избранное
      const bestOffer = offers[0]; // Берем первое предложение как лучшее
      const numericPrice = bestOffer ? parsePrice(bestOffer.price) : 0;
      
      addToFavorites({
        productId: bestOffer?.productId,
        offerKey: bestOffer?.offerKey,
        name: name,
        brand: brand,
        article: article,
        price: numericPrice,
        currency: bestOffer?.currency || 'RUB',
        image: image
      });
    }
  };

  if (isLoadingOffers) {
    return (
      <div className="w-layout-hflex core-product-search-s1">
        <div className="w-layout-vflex core-product-s1">
          <div className="w-layout-vflex flex-block-47">
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
              <div className="w-layout-hflex flex-block-79">
                <h3 className="heading-10 name">{brand}</h3>
                <h3 className="heading-10">{article}</h3>
              </div>
              <div className="text-block-21">{name}</div>
            </div>
          </div>
        </div>
        <div className="w-layout-vflex flex-block-48-copy items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p className="mt-2 text-gray-500">Загрузка предложений...</p>
        </div>
      </div>
    );
  }

  if (!offers || offers.length === 0) {
    return (
        <div className={`w-layout-hflex core-product-search-s1 ${!hasStock ? 'out-of-stock-highlight' : ''}`} style={!hasStock ? { backgroundColor: '#fee', borderColor: '#f87171' } : {}}>
            <div className="w-layout-vflex core-product-s1">
                <div className="w-layout-vflex flex-block-47">
                    <div className="div-block-19">
                        <CustomTooltip text="Оригинальные предложения Protek — рекомендуем для быстрого заказа">
                          <img src="/images/icons/filter-icon.svg" loading="lazy" alt="Оригинальные предложения Protek — рекомендуем для быстрого заказа" className="image-9" width="32" height="32" style={{ background: 'none', border: 'none', display: 'block', cursor: 'help' }} />
                        </CustomTooltip>
                    </div>
                    <div className="w-layout-vflex flex-block-50">
                        <div className="w-layout-hflex flex-block-79">
                            <h3 className="heading-10 name">{brand}</h3>
                            <h3 className="heading-10">{article}</h3>
                            {!hasStock && (
                              <span className="out-of-stock-badge" style={{
                                backgroundColor: '#dc2626',
                                color: 'white',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '500',
                                marginLeft: '8px'
                              }}>
                                Нет в наличии
                              </span>
                            )}
                        </div>
                        <div className="text-block-21">{name}</div>
                    </div>
                </div>
                {image && (
                    <div className="div-block-20">
                        <img src={image} loading="lazy" alt={name} className="image-10" />
                        {/* PartsIndex attribution hidden */}
                    </div>
                )}
            </div>
            <div className="w-layout-vflex flex-block-48-copy items-center justify-center">
                {onLoadOffers ? (
                     <button
                        onClick={onLoadOffers}
                        className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Загрузить предложения
                    </button>
                ) : (
                    <p className="text-gray-500">Предложений не найдено.</p>
                )}
            </div>
        </div>
    );
  }

  const handleSortChange = (key: SortKey) => {
    if (sortBy === key) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortDirection(DEFAULT_SORT_DIRECTION[key]);
    }
  };

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
        className={`core-offers-table__cell core-offers-table__cell--header core-offers-table__cell--sortable${isActive ? ' is-active' : ''}${extraClass ? ` ${extraClass}` : ''}`}
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-sort={isActive ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
      >
        <span className="core-offers-table__header-content">
          <span className="core-offers-table__header-label">{label}</span>
          <SortIcon direction={currentDirection} active={isActive} />
        </span>
      </div>
    );
  };

  const renderStaticHeader = (label: string, extraClass?: string) => (
    <div className={`core-offers-table__cell core-offers-table__cell--header${extraClass ? ` ${extraClass}` : ''}`}>
      <span className="core-offers-table__header-content">
        <span className="core-offers-table__header-label">{label}</span>
      </span>
    </div>
  );

  const formatPriceDisplay = (value: string): string => {
    if (!value) return value;
    const withoutCurrency = value.replace(/(₽|руб\.?|р\.?|RUB)/gi, '').trim();
    if (!withoutCurrency) return value.trim();

    let numericCandidate = withoutCurrency.replace(/\s+/g, '');
    const lastComma = numericCandidate.lastIndexOf(',');
    const lastDot = numericCandidate.lastIndexOf('.');

    if (lastComma !== -1 || lastDot !== -1) {
      if (lastComma > lastDot) {
        numericCandidate = numericCandidate.replace(/\./g, '');
        numericCandidate = numericCandidate.replace(',', '.');
      } else if (lastDot > lastComma) {
        numericCandidate = numericCandidate.replace(/,/g, '');
      } else {
        numericCandidate = numericCandidate.replace(/[.,]/g, '');
      }
    }

    const numericValue = parseFloat(numericCandidate);
    if (Number.isNaN(numericValue)) {
      return withoutCurrency.replace(/\s+/g, ' ').trim();
    }

    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericValue);
  };

  const renderOfferRow = (offer: CoreProductCardOffer, idx: number) => {
    const isLast = idx === displayedOffers.length - 1;
    const remainingStock = getRemainingStock(offer);
    const maxCountRaw = parseStock(offer.pcs);
    const maxCount = typeof remainingStock === 'number' ? remainingStock : maxCountRaw;
    const isAuthenticated = typeof window !== 'undefined' ? Boolean(localStorage.getItem('authToken')) : true;
    const inCart = offer.isInCart || false;
    const isLocallyInCart = !!localInCart[idx];
    const cannotAddMore = typeof remainingStock === 'number' && remainingStock <= 0;
    const addDisabled = !isAuthenticated || inCart || isLocallyInCart || cannotAddMore;
    const buttonTitle = !isAuthenticated
      ? 'Только для авторизованных пользователей'
      : cannotAddMore
        ? 'Добавление недоступно — нет свободного остатка'
        : inCart || isLocallyInCart
          ? 'Товар уже в корзине - нажмите для добавления еще'
          : 'Добавить в корзину';
    const buttonAriaLabel = !isAuthenticated
      ? 'Только для авторизованных пользователей'
      : cannotAddMore
        ? 'Добавление недоступно — нет свободного остатка'
        : inCart || isLocallyInCart
          ? 'Товар уже в корзине'
          : 'Добавить в корзину';

    const region = offer.region || 'Москва';
    const brandDisplay = offer.brandName || brand;
    const articleDisplay = offer.articleNumber || article;
    const nameDisplay = offer.productName || name;
    const warehouseDisplay = offer.warehouse;
    const priceDisplay = formatPriceDisplay(offer.price);
    const showTooltip = nameDisplay && nameDisplay.length > 26;
    const rowClasses = [
      'core-offers-table__row',
      'core-offers-table__row--data',
      offer.recommended ? 'core-offers-table__row--own' : '',
      isLast ? 'core-offers-table__row--last' : ''
    ].filter(Boolean).join(' ');
    const rowKey = offer.offerKey || offer.productId || `${brandDisplay}-${articleDisplay}-${idx}`;

    return (
      <div className={rowClasses} key={rowKey}>
        <div className="core-offers-table__cell core-offers-table__cell--brand">
          {brandDisplay}
        </div>
        <div className="core-offers-table__cell core-offers-table__cell--article">{articleDisplay}</div>
        <div className="core-offers-table__cell core-offers-table__cell--name">
          <div className="core-offers-table__name-wrapper">
            <div
              className={`core-offers-table__product-name${showTooltip ? ' has-tooltip' : ''}`}
              data-fullname={showTooltip ? nameDisplay : undefined}
            >
              <span className="core-offers-table__product-name-text">{nameDisplay}</span>
            </div>
          </div>
        </div>
        <div className="core-offers-table__cell core-offers-table__cell--delivery">{formatDeliveryDisplay(offer.days)}</div>
        <div className="core-offers-table__cell core-offers-table__cell--stock">{offer.pcs}</div>
        <div className="core-offers-table__cell core-offers-table__cell--price">
          <span className="core-offers-table__price-value">{priceDisplay}</span>
        </div>
        <div className="core-offers-table__cell core-offers-table__cell--actions">
          <div className="w-layout-hflex add-to-cart-block-s1">
            <div className="w-layout-hflex flex-block-82">
      <div className="input-pcs input-pcs--standalone">
        <input
          type="number"
          min={1}
          max={maxCount && maxCount > 0 ? maxCount : undefined}
          value={inputValues[idx]}
          onChange={e => handleInputChange(idx, e.target.value)}
          onBlur={() => handleInputBlur(idx)}
          className="text-block-26 w-full text-center outline-none"
          aria-label="Количество"
        />
      </div>
              {quantityErrors[idx] && (
                <div className="core-offers-table__error">
                  {quantityErrors[idx]}
                </div>
              )}
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <button
                  type="button"
                  onClick={() => handleAddToCart(offer, idx)}
                  className={`button-icon w-inline-block ${inCart || isLocallyInCart ? 'in-cart' : ''}`}
                  style={{
                    cursor: addDisabled ? 'not-allowed' : 'pointer',
                    opacity: addDisabled ? 0.5 : 1
                  }}
                  aria-label={buttonAriaLabel}
                  title={buttonTitle}
                  disabled={addDisabled}
                >
                  <div className="div-block-26">
                    <img
                      loading="lazy"
                      src="/images/cart_icon.svg"
                      alt={addDisabled ? 'Недоступно' : (inCart || isLocallyInCart ? 'В корзине' : 'В корзину')}
                      className="image-11"
                      style={{
                        filter: inCart || isLocallyInCart ? 'brightness(0.7)' : undefined
                      }}
                    />
                  </div>
                </button>
                {inCart && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      backgroundColor: '#22c55e',
                      color: 'white',
                      borderRadius: '50%',
                      width: '16px',
                      height: '16px',
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      zIndex: 1
                    }}
                    title="В корзине"
                  >
                    ✓
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const offerRows = displayedOffers.map(renderOfferRow);

  return (
    <>
      <div className={`w-layout-hflex core-product-search-s1 ${!hasStock ? 'out-of-stock-highlight' : ''}`} style={!hasStock ? { backgroundColor: '#fee', borderColor: '#f87171' } : {}}>
        <div className="w-layout-vflex flex-block-48-copy">
          <div className="w-layout-vflex product-list-search-s1">
            <div className="w-layout-vflex core-product-s1">
              <div className="w-layout-vflex flex-block-47">
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
                  <div className="core-product-header-line">
                    <h3 className="heading-10 name core-product-brand" style={{ marginRight: 8 }}>{brand}</h3>
                    <h3 className="heading-10 core-product-article" style={{ marginRight: 8 }}>{article}</h3>
                    {!hasStock && (
                      <span
                        className="out-of-stock-badge"
                        style={{
                          backgroundColor: '#dc2626',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          marginLeft: '8px'
                        }}
                      >
                        Нет в наличии
                      </span>
                    )}
                    <div
                      className="favorite-icon w-embed"
                      onClick={handleFavoriteClick}
                      style={{ cursor: 'pointer', marginLeft: '10px', color: isItemFavorite ? '#e53935' : undefined }}
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
              {image && (
                <div className="div-block-20">
                  <img src={image} loading="lazy" alt={name} className="image-10" />
                  {/* PartsIndex attribution hidden */}
                </div>
              )}
            </div>

            <div className="core-offers-table">
              <div className="core-offers-table__row core-offers-table__row--head">
                {renderStaticHeader('Производитель', 'core-offers-table__cell--brand')}
                {renderStaticHeader('Артикул', 'core-offers-table__cell--article')}
                {renderStaticHeader('Наименование', 'core-offers-table__cell--name')}
                {renderSortHeader('Доставка', 'delivery', 'core-offers-table__cell--delivery')}
                {renderSortHeader('Наличие', 'stock', 'core-offers-table__cell--stock')}
                {renderSortHeader('Цена, ₽', 'price', 'core-offers-table__cell--price core-offers-table__cell--header-right')}
                {renderStaticHeader('Кол-во', 'core-offers-table__cell--qty')}
              </div>
              {offerRows}
            </div>

            {hasMoreOffers || visibleOffersCount > INITIAL_OFFERS_LIMIT ? (
              <div
                className="w-layout-hflex show-more-search"
                onClick={() => {
                  if (hasMoreOffers) {
                    setVisibleOffersCount(prev => Math.min(prev + 10, sortedOffers.length));
                  } else {
                    setVisibleOffersCount(INITIAL_OFFERS_LIMIT);
                  }
                }}
                style={{ cursor: 'pointer' }}
                tabIndex={0}
                role="button"
                aria-label={hasMoreOffers ? `Еще ${sortedOffers.length - visibleOffersCount} предложений` : 'Скрыть предложения'}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    if (hasMoreOffers) {
                      setVisibleOffersCount(prev => Math.min(prev + 10, sortedOffers.length));
                    } else {
                      setVisibleOffersCount(INITIAL_OFFERS_LIMIT);
                    }
                  }
                }}
              >
                <div className="text-block-27">
                  {hasMoreOffers ? `Еще ${sortedOffers.length - visibleOffersCount} предложений` : 'Скрыть'}
                </div>
                <img
                  src="/images/arrow_drop_down.svg"
                  loading="lazy"
                  alt=""
                  className={`transition-transform duration-200 ${!hasMoreOffers ? 'rotate-180' : ''}`}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};

export default CoreProductCard; 
