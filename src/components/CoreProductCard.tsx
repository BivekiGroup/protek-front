import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { isDeliveryDate } from "@/lib/utils";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import CartIcon from "./CartIcon";
import { ChevronDown, ChevronsUpDown, ChevronUp } from "./icons";

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
  quantity?: number; // Добавляем чистое число количества
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
  isSupplierOffer?: boolean;  // Новое поле для предложений поставщиков
  supplierCode?: string;       // Новое поле для кода поставщика
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
  const { addItem, updateQuantity, removeItem, state: cartState } = useCart();
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
  const [localInCart, setLocalInCart] = useState<{ [key: number]: boolean }>({});

  // Находим первый internal offer с productId для ссылки на карточку товара
  const internalOfferWithProductId = offers.find(offer => offer.productId && !offer.isExternal);

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
  const pluralizeDays = (count: number): string => {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
      return 'дней';
    }
    if (lastDigit === 1) {
      return 'день';
    }
    if (lastDigit >= 2 && lastDigit <= 4) {
      return 'дня';
    }
    return 'дней';
  };

  const parseDeliveryTime = (daysStr: string): string => {
    // Если это дата (содержит название месяца), возвращаем как есть
    if (isDeliveryDate(daysStr)) {
      return daysStr;
    }
    // Иначе парсим как количество дней (для обратной совместимости)
    const match = daysStr.match(/\d+/);
    if (match) {
      const count = parseInt(match[0], 10);
      return `${count} ${pluralizeDays(count)}`;
    }
    return daysStr;
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
      // Проверяем по offerKey (для внешних и уникальных офферов)
      if (offer.offerKey && item.offerKey) {
        return item.offerKey === offer.offerKey;
      }

      // Для внутренних офферов проверяем по productId + price (у разных офферов одного товара разные цены)
      if (offer.productId && item.productId) {
        const offerPrice = parsePrice(offer.price);
        const priceMatches = Math.abs(item.price - offerPrice) < 0.01;
        return item.productId === offer.productId && priceMatches;
      }

      // НЕТ fallback на article+brand - он слишком широкий и показывает количество для всех товаров
      return false;
    });

    return existingItem?.quantity ?? 0;
  };

  const getCartItemId = (offer: CoreProductCardOffer): string | null => {
    const existingItem = cartState.items.find(item => {
      // Проверяем по offerKey (для внешних и уникальных офферов)
      if (offer.offerKey && item.offerKey) {
        return item.offerKey === offer.offerKey;
      }

      // Для внутренних офферов проверяем по productId + price
      if (offer.productId && item.productId) {
        const offerPrice = parsePrice(offer.price);
        const priceMatches = Math.abs(item.price - offerPrice) < 0.01;
        return item.productId === offer.productId && priceMatches;
      }

      return false;
    });

    return existingItem?.id ?? null;
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
    if (val === "") {
      setInputValues(prev => ({ ...prev, [idx]: val }));
      return;
    }

    const requested = Math.max(1, parseInt(val, 10) || 1);

    // Просто устанавливаем введенное значение без валидации
    setInputValues(prev => ({ ...prev, [idx]: String(requested) }));
    setQuantities(prev => ({ ...prev, [idx]: requested }));
  };

  const handleInputFocus = (idx: number) => {
    if (inputValues[idx] === "1") {
      setInputValues(prev => ({ ...prev, [idx]: "" }));
    }
  };

  const handleInputBlur = (idx: number) => {
    if (inputValues[idx] === "") {
      setInputValues(prev => ({ ...prev, [idx]: "1" }));
      setQuantities(prev => ({ ...prev, [idx]: 1 }));
    }
  };

  const handleAddToCart = async (offer: CoreProductCardOffer, index: number, e?: React.MouseEvent) => {
    // Предотвращаем дефолтное поведение и всплытие события
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // Убрана проверка авторизации - теперь неавторизованные пользователи могут добавлять в корзину
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
        setLocalInCart(prev => ({ ...prev, [index]: false }));
        return;
      }

      if (quantity > remainingStock) {
        const clampedQuantity = Math.max(1, remainingStock);
        setQuantities(prev => ({ ...prev, [index]: clampedQuantity }));
        setInputValues(prev => ({ ...prev, [index]: String(clampedQuantity) }));
        const errorMessage = `Можно добавить не более ${remainingStock} шт.`;
        toast.error(errorMessage);
        setLocalInCart(prev => ({ ...prev, [index]: false }));
        return;
      }
    }

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
                  <CustomTooltip text="Оригинальные предложения Protek — выделены зеленым фоном. Рекомендуем для быстрого заказа">
                    <img
                      src="/images/icons/filter-icon.svg"
                      alt="Оригинальные предложения Protek — выделены зеленым фоном"
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
    // Если нет предложений и нет кнопки загрузки - не рендерим карточку вообще
    if (!onLoadOffers) {
      return null;
    }

    // Если есть кнопка загрузки - показываем карточку с кнопкой
    return (
        <div className={`w-layout-hflex core-product-search-s1 ${!hasStock ? 'out-of-stock-highlight' : ''}`} style={!hasStock ? { backgroundColor: '#fee', borderColor: '#f87171' } : {}}>
            <div className="w-layout-vflex core-product-s1">
                <div className="w-layout-vflex flex-block-47">
                    <div className="div-block-19">
                        <CustomTooltip text="Оригинальные предложения Protek — выделены зеленым фоном. Рекомендуем для быстрого заказа">
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
                <button
                    onClick={onLoadOffers}
                    className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Загрузить предложения
                </button>
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
      return withoutCurrency.replace(/\s+/g, ' ').trim() + ' ₽';
    }

    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericValue) + ' ₽';
  };

  const renderOfferRow = (offer: CoreProductCardOffer, idx: number) => {
    const isLast = idx === displayedOffers.length - 1;
    const remainingStock = getRemainingStock(offer);
    // Используем offer.quantity если есть, иначе парсим pcs
    const maxCountRaw = typeof offer.quantity === 'number' ? offer.quantity : parseStock(offer.pcs);
    // Для поля ввода используем полное количество со склада, а не остаток
    const maxCount = maxCountRaw;
    const inCart = offer.isInCart || false;
    const isLocallyInCart = !!localInCart[idx];
    const cannotAddMore = typeof remainingStock === 'number' && remainingStock <= 0;

    // Проверяем, что цена не равна 0
    const priceValue = parseFloat(offer.price.replace(/[^\d.]/g, '')) || 0;
    const isPriceZero = priceValue === 0;

    const addDisabled = inCart || isLocallyInCart || cannotAddMore || isPriceZero;
    const buttonTitle = isPriceZero
      ? 'Товар недоступен для заказа (цена не указана)'
      : cannotAddMore
        ? 'Добавление недоступно — нет свободного остатка'
        : inCart || isLocallyInCart
          ? 'Товар уже в корзине - нажмите для добавления еще'
          : 'Добавить в корзину';
    const buttonAriaLabel = isPriceZero
      ? 'Товар недоступен для заказа'
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
      offer.isSupplierOffer ? 'core-offers-table__row--supplier' : '',  // Новый класс для предложений поставщиков
      isLast ? 'core-offers-table__row--last' : ''
    ].filter(Boolean).join(' ');
    const rowKey = offer.offerKey || offer.productId || `${brandDisplay}-${articleDisplay}-${idx}`;


    return (
      <div className={rowClasses} key={rowKey}>
        <div className="core-offers-table__cell core-offers-table__cell--name">
          <div className="core-offers-table__name-wrapper">
            <div
              className={`core-offers-table__product-name${showTooltip ? ' has-tooltip' : ''}`}
              data-fullname={showTooltip ? nameDisplay : undefined}
            >
              <span className="core-offers-table__product-name-text">{nameDisplay}</span>
              {offer.isSupplierOffer && (
                <span className="supplier-badge" style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '600',
                  marginLeft: '8px',
                  display: 'inline-block',
                  verticalAlign: 'middle'
                }}>
                  НАШ СКЛАД
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="core-offers-table__cell core-offers-table__cell--article">{articleDisplay}</div>
        <div className="core-offers-table__cell core-offers-table__cell--brand">
          {brandDisplay}
        </div>
        <div className="core-offers-table__cell core-offers-table__cell--delivery">{formatDeliveryDisplay(offer.days)}</div>
        <div className="core-offers-table__cell core-offers-table__cell--stock">{offer.pcs}</div>
        <div className="core-offers-table__cell core-offers-table__cell--price">
          <span className="core-offers-table__price-value">{priceDisplay}</span>
        </div>
        <div className="core-offers-table__cell core-offers-table__cell--actions" style={{ minHeight: '36px' }}>
          <div className="w-layout-hflex add-to-cart-block-s1" style={{ minHeight: '36px' }}>
            {(() => {
              const existingQty = getExistingCartQuantity(offer);
              const isInCart = existingQty > 0;

              if (isInCart) {
                // Показываем контрол с минусом, числом и плюсом по дизайну из Figma
                const cartItemId = getCartItemId(offer);
                if (!cartItemId) return null;

                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* counter_pcs */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '2px',
                      gap: '2px',
                      width: '100px',
                      height: '30px',
                      background: '#E6EDF6',
                      borderRadius: '5px'
                    }}>
                      {/* Кнопка минус */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.nativeEvent?.stopImmediatePropagation?.();
                          const newQty = Math.max(1, existingQty - 1);
                          updateQuantity(cartItemId, newQty);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '6px',
                          width: '26px',
                          height: '26px',
                          background: '#FFFFFF',
                          borderRadius: '4px',
                          border: 'none',
                          cursor: 'pointer',
                          flexShrink: 0
                        }}
                      >
                        <div style={{ width: '8px', height: '1px', background: '#000814' }} />
                      </button>

                      {/* Инпут */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '40px',
                        height: '26px',
                        borderRadius: '4px',
                        flexShrink: 0
                      }}>
                        <input
                          type="number"
                          min={1}
                          max={maxCount && maxCount > 0 ? maxCount : undefined}
                          value={existingQty}
                          onChange={e => {
                            const newQty = parseInt(e.target.value) || 1;
                            updateQuantity(cartItemId, newQty);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                            }
                          }}
                          style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            background: 'transparent',
                            textAlign: 'center',
                            fontFamily: 'Onest',
                            fontWeight: 600,
                            fontSize: '14px',
                            lineHeight: '140%',
                            color: '#000000',
                            outline: 'none'
                          }}
                          aria-label="Количество"
                        />
                      </div>

                      {/* Кнопка плюс */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.nativeEvent?.stopImmediatePropagation?.();
                          const newQty = existingQty + 1;
                          updateQuantity(cartItemId, newQty);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '6px',
                          width: '26px',
                          height: '26px',
                          background: '#FFFFFF',
                          borderRadius: '4px',
                          border: 'none',
                          cursor: 'pointer',
                          flexShrink: 0
                        }}
                      >
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path d="M4 0V8M0 4H8" stroke="#000814" strokeWidth="1"/>
                        </svg>
                      </button>
                    </div>

                    {/* Кнопка удаления */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.nativeEvent?.stopImmediatePropagation?.();
                        removeItem(cartItemId);
                      }}
                      onMouseEnter={(e) => {
                        const img = e.currentTarget.querySelector('img');
                        if (img) img.style.filter = 'invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)';
                      }}
                      onMouseLeave={(e) => {
                        const img = e.currentTarget.querySelector('img');
                        if (img) img.style.filter = 'invert(82%) sepia(0%) saturate(0%) hue-rotate(169deg) brightness(94%) contrast(88%)';
                      }}
                      style={{
                        width: '18px',
                        height: '18px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                      title="Удалить из корзины"
                    >
                      <img
                        loading="lazy"
                        src="/images/delete.svg"
                        alt="Удалить"
                        style={{
                          width: '14px',
                          height: '16px',
                          filter: 'invert(82%) sepia(0%) saturate(0%) hue-rotate(169deg) brightness(94%) contrast(88%)',
                          transition: 'filter 0.2s'
                        }}
                      />
                    </button>
                  </div>
                );
              }

              // Показываем обычный инпут и кнопку корзины
              return (
                <div className="w-layout-hflex flex-block-82">
                  <div className="input-pcs input-pcs--standalone">
                    <input
                      type="number"
                      min={1}
                      max={maxCount && maxCount > 0 ? maxCount : undefined}
                      value={inputValues[idx] || ""}
                      onChange={e => handleInputChange(idx, e.target.value)}
                      onClick={() => setInputValues(prev => ({ ...prev, [idx]: "" }))}
                      onBlur={() => handleInputBlur(idx)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                        }
                      }}
                      className="text-block-26 w-full text-center outline-none"
                      aria-label="Количество"
                    />
                  </div>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.nativeEvent?.stopImmediatePropagation?.();
                        handleAddToCart(offer, idx, e);
                        return false;
                      }}
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
                  </div>
                </div>
              );
            })()}
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
                  <CustomTooltip text="Оригинальные предложения Protek — выделены зеленым фоном. Рекомендуем для быстрого заказа">
                    <img
                      src="/images/icons/filter-icon.svg"
                      alt="Оригинальные предложения Protek — выделены зеленым фоном"
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
                  <div className="text-block-21 mt-1" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span>{name}</span>
                    {internalOfferWithProductId && (
                      <Link
                        href={`/card?article=${article}&brand=${brand}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          backgroundColor: '#2563eb',
                          color: 'white',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '500',
                          textDecoration: 'none',
                          transition: 'all 0.2s',
                          whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#1d4ed8';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#2563eb';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                        title="Перейти на карточку товара"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M13 7H7v10h10v-6m-5.75 5.75l8-8M15 5h4v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Подробнее
                      </Link>
                    )}
                  </div>
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
                {renderStaticHeader('Наименование', 'core-offers-table__cell--name')}
                {renderStaticHeader('Артикул', 'core-offers-table__cell--article')}
                {renderStaticHeader('Производитель', 'core-offers-table__cell--brand')}
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
