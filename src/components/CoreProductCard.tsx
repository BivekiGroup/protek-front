import React, { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import toast from "react-hot-toast";
import CartIcon from "./CartIcon";
import { isDeliveryDate } from "@/lib/utils";

const INITIAL_OFFERS_LIMIT = 5;

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
  const { addItem } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite, favorites } = useFavorites();
  const [visibleOffersCount, setVisibleOffersCount] = useState(INITIAL_OFFERS_LIMIT);
  const [sortBy, setSortBy] = useState<'stock' | 'delivery' | 'price'>('price'); // Локальная сортировка для каждого товара
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

  // Функция сортировки предложений
  const sortOffers = (offers: CoreProductCardOffer[]) => {
    const sorted = [...offers];
    
    switch (sortBy) {
      case 'stock':
        return sorted.sort((a, b) => parseStock(b.pcs) - parseStock(a.pcs));
      case 'delivery':
        return sorted.sort((a, b) => {
          const aDelivery = a.deliveryTime || 999;
          const bDelivery = b.deliveryTime || 999;
          return aDelivery - bDelivery;
        });
      case 'price':
        return sorted.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
      default:
        return sorted;
    }
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

  const handleInputChange = (idx: number, val: string) => {
    setInputValues(prev => ({ ...prev, [idx]: val }));
    if (val === "") return;
    const valueNum = Math.max(1, parseInt(val, 10) || 1);
    setQuantities(prev => ({ ...prev, [idx]: valueNum }));
  };

  const handleInputBlur = (idx: number) => {
    if (inputValues[idx] === "") {
      setInputValues(prev => ({ ...prev, [idx]: "1" }));
      setQuantities(prev => ({ ...prev, [idx]: 1 }));
    }
  };

  const handleMinus = (idx: number) => {
    setQuantities(prev => {
      const newVal = Math.max(1, (prev[idx] || 1) - 1);
      setInputValues(vals => ({ ...vals, [idx]: newVal.toString() }));
      return { ...prev, [idx]: newVal };
    });
  };

  const handlePlus = (idx: number, maxCount?: number) => {
    setQuantities(prev => {
      let newVal = (prev[idx] || 1) + 1;
      if (maxCount !== undefined) newVal = Math.min(newVal, maxCount);
      setInputValues(vals => ({ ...vals, [idx]: newVal.toString() }));
      return { ...prev, [idx]: newVal };
    });
  };

  const handleAddToCart = async (offer: CoreProductCardOffer, index: number) => {
    setLocalInCart(prev => ({ ...prev, [index]: true }));
    const quantity = quantities[index] || 1;
    const availableStock = parseStock(offer.pcs);
    const inCart = offer.isInCart || false; // Use backend flag
    
    const numericPrice = parsePrice(offer.price);

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
    } else {
      // Показываем ошибку
      toast.error(result.error || 'Ошибка при добавлении товара в корзину');
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
              <img src="/images/info.svg" loading="lazy" alt="info" className="image-9" />
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
                        <img src="/images/info.svg" loading="lazy" alt="info" className="image-9" />
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

  return (
    <>
      <div className={`w-layout-hflex core-product-search-s1 ${!hasStock ? 'out-of-stock-highlight' : ''}`} style={!hasStock ? { backgroundColor: '#fee', borderColor: '#f87171' } : {}}>
        <div className="w-layout-vflex flex-block-48-copy">
          <div className="w-layout-vflex product-list-search-s1">

            <div className="w-layout-vflex flex-block-48-copy">
              
              <div className="w-layout-vflex product-list-search-s1">
              <div className="w-layout-vflex core-product-s1">
              <div className="w-layout-vflex flex-block-47">
                <div className="div-block-19">
                  <img src="/images/info.svg" loading="lazy" alt="info" className="image-9" />
                </div>
                <div className="w-layout-vflex flex-block-50">
                  <div className="flex flex-row flex-nowrap items-center gap-2">
                    <h3 className="heading-10 name" style={{marginRight: 8}}>{brand}</h3>
                    <h3 className="heading-10" style={{marginRight: 8}}>{article}</h3>
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
                <div className="w-layout-hflex sort-list-s1">
                  <div className="w-layout-hflex flex-block-49">
                    <div 
                      className={`sort-item first ${sortBy === 'stock' ? 'active' : ''}`}
                      onClick={() => setSortBy('stock')}
                      style={{ cursor: 'pointer' }}
                    >
                      Наличие
                    </div>
                    <div 
                      className={`sort-item ${sortBy === 'delivery' ? 'active' : ''}`}
                      onClick={() => setSortBy('delivery')}
                      style={{ cursor: 'pointer' }}
                    >
                      Доставим
                    </div>
                  </div>
                  <div 
                    className={`sort-item price ${sortBy === 'price' ? 'active' : ''}`}
                    onClick={() => setSortBy('price')}
                    style={{ cursor: 'pointer' }}
                  >
                    Цена
                  </div>
                </div>
                {displayedOffers.map((offer, idx) => {
                  const isLast = idx === displayedOffers.length - 1;
                  const maxCount = parseStock(offer.pcs);
                  const inCart = offer.isInCart || false;
                  const isLocallyInCart = !!localInCart[idx];
                  
                  // Backend now provides isInCart flag directly
                  
                  return (
                    <div 
                      className="w-layout-hflex product-item-search-s1"
                      key={idx}
                      style={isLast ? { borderBottom: 'none' } : undefined}
                    >
                      <div className="w-layout-hflex flex-block-81">
                        <div className="w-layout-hflex info-block-search-s1">
                          <div className="pcs-search-s1">{offer.pcs}</div>
                          <div className="pcs-search">{offer.days}</div>
                        </div>
                        <div className="w-layout-hflex info-block-product-card-search-s1">
                          {offer.recommended && (
                            <>
                              <div className="w-layout-hflex item-recommend">
                                <img src="/images/ri_refund-fill.svg" loading="lazy" alt="" />
                              </div>
                              <div className="text-block-25-s1">Рекомендуем</div>
                            </>
                          )}
                        </div>
                        <div className="price-s1">{offer.price}</div>
                      </div>
                      <div className="w-layout-hflex add-to-cart-block-s1">
                        <div className="w-layout-hflex flex-block-82">
                          <div className="w-layout-hflex pcs-cart-s1">
                            <div
                              className="minus-plus"
                              onClick={() => handleMinus(idx)}
                              style={{ cursor: 'pointer' }}
                              aria-label="Уменьшить количество"
                              tabIndex={0}
                              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleMinus(idx)}
                              role="button"
                            >
                              <div className="pluspcs w-embed">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M6 10.5V9.5H14V10.5H6Z" fill="currentColor" />
                                </svg>
                              </div>
                            </div>
                            <div className="input-pcs">
                              <input
                                type="number"
                                min={1}
                                max={maxCount}
                                value={inputValues[idx]}
                                onChange={e => handleInputChange(idx, e.target.value)}
                                onBlur={() => handleInputBlur(idx)}
                                className="text-block-26 w-full text-center outline-none"
                                aria-label="Количество"
                              />
                            </div>
                            <div
                              className="minus-plus"
                              onClick={() => handlePlus(idx, maxCount)}
                              style={{ cursor: 'pointer' }}
                              aria-label="Увеличить количество"
                              tabIndex={0}
                              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handlePlus(idx, maxCount)}
                              role="button"
                            >
                              <div className="pluspcs w-embed">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M6 10.5V9.5H14V10.5H6ZM9.5 6H10.5V14H9.5V6Z" fill="currentColor" />
                                </svg>
                              </div>
                            </div>
                          </div>
                          <div style={{ position: 'relative', display: 'inline-block' }}>
                            <button
                              type="button"
                              onClick={() => handleAddToCart(offer, idx)}
                              className={`button-icon w-inline-block ${inCart || isLocallyInCart ? 'in-cart' : ''}`}
                              style={{ 
                                cursor: 'pointer',
                                opacity: inCart || isLocallyInCart ? 0.5 : 1,
                                backgroundColor: inCart || isLocallyInCart ? '#2563eb' : undefined
                              }}
                              aria-label={inCart || isLocallyInCart ? "Товар уже в корзине" : "Добавить в корзину"}
                              title={inCart || isLocallyInCart ? "Товар уже в корзине - нажмите для добавления еще" : "Добавить в корзину"}
                            >
                              <div className="div-block-26">
                                <img 
                                  loading="lazy" 
                                  src="/images/cart_icon.svg" 
                                  alt={inCart || isLocallyInCart ? "В корзине" : "В корзину"} 
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
                  );
                })}
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
        </div>
      </div>

    </>
  );
};

export default CoreProductCard; 
