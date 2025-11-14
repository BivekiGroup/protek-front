import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useCart } from "@/contexts/CartContext";
import { toast } from "react-hot-toast";
import CartIcon from "../CartIcon";
import { isDeliveryDate } from "@/lib/utils";

// Tooltip for truncated text - only shows when text is actually truncated
const TextWithTooltip = ({ text }: { text: string }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (showTooltip && textRef.current) {
      const rect = textRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top + window.scrollY - 45,
        left: rect.left + window.scrollX + rect.width / 2
      });
    }
  }, [showTooltip]);

  const handleMouseEnter = () => {
    if (textRef.current) {
      // Check if text is truncated by comparing scrollWidth with clientWidth
      const truncated = textRef.current.scrollWidth > textRef.current.clientWidth;
      setIsTruncated(truncated);
      if (truncated) {
        setShowTooltip(true);
      }
    }
  };

  return (
    <>
      <span
        ref={textRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowTooltip(false)}
        style={{
          cursor: 'default',
          display: 'block',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {text}
      </span>
      {showTooltip && isTruncated && typeof window !== 'undefined' && createPortal(
        <div
          style={{
            position: 'absolute',
            top: `${position.top}px`,
            left: `${position.left}px`,
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.94))',
            color: '#f8fafc',
            padding: '8px 12px',
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

interface ProductItemCardProps {
  isLast?: boolean;
  offer?: any;
  index: number;
}

const ProductItemCard = ({ isLast = false, offer, index }: ProductItemCardProps) => {
  const [quantity, setQuantity] = useState(1);
  const [inputValue, setInputValue] = useState("1");
  const [isLocallyInCart, setIsLocallyInCart] = useState(false);
  const { addItem, state: cartState } = useCart();

  if (!offer) return null;

  const parseStock = (stock: any): number | undefined => {
    if (stock === null || stock === undefined) return undefined;
    if (typeof stock === 'number') return stock;
    const match = String(stock).match(/\d+/);
    return match ? parseInt(match[0], 10) : undefined;
  };

  const availableStock = parseStock(offer?.quantity);

  const pluralizeDays = (count: number): string => {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return 'дней';
    if (lastDigit === 1) return 'день';
    if (lastDigit >= 2 && lastDigit <= 4) return 'дня';
    return 'дней';
  };

  const formatDeliveryTime = (deliveryTime: number | string) => {
    if (typeof deliveryTime === 'string' && isDeliveryDate(deliveryTime)) {
      return deliveryTime;
    }

    const days = typeof deliveryTime === 'string' ? parseInt(deliveryTime) : deliveryTime;

    if (!days || days === 0) return "Сегодня";
    return `${days} ${pluralizeDays(days)}`;
  };

  const getExistingCartQuantity = (): number => {
    const existingItem = cartState.items.find(item => {
      // For internal offers, prioritize productId over offerKey (since offerKey might be synthetic)
      if (offer.id && item.productId) {
        return item.productId === String(offer.id);
      }
      // For external offers, match by offerKey
      if (offer.offerKey && item.offerKey && !offer.id) {
        return item.offerKey === offer.offerKey;
      }
      // Don't fallback to article+brand match as it's too broad
      return false;
    });

    return existingItem?.quantity ?? 0;
  };

  const getRemainingStock = (): number | undefined => {
    // Используем remainingStock из backend, если он есть
    if (offer.remainingStock !== undefined && offer.remainingStock !== null) {
      return typeof offer.remainingStock === 'number' ? offer.remainingStock : parseStock(offer.remainingStock);
    }

    // Fallback на старую логику, если remainingStock не пришел с backend
    if (typeof availableStock !== 'number' || Number.isNaN(availableStock)) {
      return undefined;
    }

    if (availableStock <= 0) {
      return 0;
    }

    const existingQuantity = getExistingCartQuantity();
    return Math.max(availableStock - existingQuantity, 0);
  };

  const handleInputChange = (val: string) => {
    if (val === "") {
      setInputValue(val);
      return;
    }

    const requested = Math.max(1, parseInt(val, 10) || 1);

    // Просто устанавливаем введенное значение без валидации
    setInputValue(String(requested));
    setQuantity(requested);
  };

  const handleInputFocus = () => {
    if (inputValue === "1") {
      setInputValue("");
    }
  };

  const handleInputBlur = () => {
    if (inputValue === "") {
      setInputValue("1");
      setQuantity(1);
    }
  };

  const handleAddToCart = async (e?: React.MouseEvent) => {
    // Предотвращаем дефолтное поведение и всплытие события
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // Убрана проверка авторизации - теперь неавторизованные пользователи могут добавлять в корзину
    setIsLocallyInCart(true);
    const remainingStock = getRemainingStock();
    const inCart = offer.isInCart || false;
    
    if (typeof remainingStock === 'number') {
      if (remainingStock <= 0) {
        const errorMessage = availableStock !== undefined && availableStock <= 0
          ? 'Товара нет в наличии'
          : 'В корзине уже максимальное количество этого товара';
        toast.error(errorMessage);
        setIsLocallyInCart(false);
        return;
      }

      if (quantity > remainingStock) {
        const clampedQuantity = Math.max(1, remainingStock);
        setQuantity(clampedQuantity);
        setInputValue(String(clampedQuantity));
        const errorMessage = `Можно добавить не более ${remainingStock} шт.`;
        toast.error(errorMessage);
        setIsLocallyInCart(false);
        return;
      }
    }

    const result = await addItem({
      productId: offer.id ? String(offer.id) : undefined,
      offerKey: offer.offerKey || undefined,
      name: offer.name || `${offer.brand} ${offer.articleNumber}`,
      description: offer.name || `${offer.brand} ${offer.articleNumber}`,
      price: offer.price,
      currency: 'RUB',
      quantity: quantity,
      stock: availableStock,
      image: offer.image || undefined,
      brand: offer.brand,
      article: offer.articleNumber,
      supplier: offer.supplier || (offer.type === 'external' ? 'AutoEuro' : 'Внутренний'),
      deliveryTime: formatDeliveryTime(offer.deliveryTime || offer.deliveryDays || 0),
      isExternal: offer.type === 'external'
    });

    if (result.success) {
      const toastMessage = inCart 
        ? `Количество увеличено (+${quantity} шт.)`
        : 'Товар добавлен в корзину!';
      
      toast.success(
        <div>
          <div className="font-semibold" style={{ color: '#fff' }}>{toastMessage}</div>
          <div className="text-sm" style={{ color: '#fff', opacity: 0.9 }}>{`${offer.brand} ${offer.articleNumber} (${quantity} шт.)`}</div>
        </div>,
        {
          duration: 3000,
          icon: <CartIcon size={20} color="#fff" />,
        }
      );

      setIsLocallyInCart(false);
    } else {
      toast.error(result.error || 'Ошибка при добавлении товара в корзину');
      setIsLocallyInCart(false);
    }
  };

  const formatPriceDisplay = (price: number): string => {
    // Всегда показываем цену за 1 единицу товара
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price) + ' ₽';
  };

  const remainingStock = getRemainingStock();
  // Для поля ввода используем полное количество со склада, а не остаток
  const maxCount = availableStock;
  const inCart = offer.isInCart || false;
  const cannotAddMore = typeof remainingStock === 'number' && remainingStock <= 0;
  const addDisabled = isLocallyInCart || cannotAddMore;

  const buttonTitle = cannotAddMore
    ? 'Добавление недоступно — нет свободного остатка'
    : inCart || isLocallyInCart
      ? 'Товар уже в корзине - нажмите для добавления еще'
      : 'Добавить в корзину';

  // Use CoreProductCard styling pattern
  const rowClasses = [
    'core-offers-table__row',
    'core-offers-table__row--data',
    offer.recommended ? 'core-offers-table__row--own' : '',
    isLast ? 'core-offers-table__row--last' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={rowClasses}>
      <div className="core-offers-table__cell core-offers-table__cell--name">
        <div className="core-offers-table__name-wrapper">
          <div className="core-offers-table__product-name">
            <span className="core-offers-table__product-name-text">
              <TextWithTooltip text={offer.name || `${offer.brand} ${offer.articleNumber}`} />
            </span>
          </div>
          {offer.type === 'internal' && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                marginLeft: '8px',
                padding: '2px 8px',
                backgroundColor: 'var(--green)',
                color: 'white',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '600',
                whiteSpace: 'nowrap'
              }}
              title="Оригинальное предложение Protek"
            >
              Наше предложение
            </span>
          )}
        </div>
      </div>

      <div className="core-offers-table__cell core-offers-table__cell--article">
        <TextWithTooltip text={offer.articleNumber} />
      </div>

      <div className="core-offers-table__cell core-offers-table__cell--brand">
        <TextWithTooltip text={offer.brand} />
      </div>
      
      <div className="core-offers-table__cell core-offers-table__cell--delivery">
        {formatDeliveryTime(offer.deliveryTime || offer.deliveryDays || 0)}
      </div>
      
      <div className="core-offers-table__cell core-offers-table__cell--stock">
        {typeof availableStock === 'number' ? `${Math.max(availableStock, 0)} шт` : '—'}
      </div>
      
      <div className="core-offers-table__cell core-offers-table__cell--price">
        <span className="core-offers-table__price-value">
          {formatPriceDisplay(offer.price)}
        </span>
      </div>
      
      <div className="core-offers-table__cell core-offers-table__cell--actions">
        <div className="w-layout-hflex add-to-cart-block-s1">
          <div className="w-layout-hflex flex-block-82">
            <div className="input-pcs input-pcs--standalone">
              <input
                type="number"
                min={1}
                max={maxCount && maxCount > 0 ? maxCount : undefined}
                value={inputValue}
                onChange={e => handleInputChange(e.target.value)}
                onClick={() => setInputValue("")}
                onBlur={handleInputBlur}
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
                  handleAddToCart(e);
                  return false;
                }}
                className={`button-icon w-inline-block ${inCart || isLocallyInCart ? 'in-cart' : ''}`}
                style={{
                  cursor: addDisabled ? 'not-allowed' : 'pointer',
                  opacity: addDisabled ? 0.5 : 1
                }}
                title={buttonTitle}
                disabled={addDisabled}
              >
                <div className="div-block-26">
                  <img
                    loading="lazy"
                    src="/images/cart_icon.svg"
                    alt={addDisabled ? 'Недоступно' : (inCart || isLocallyInCart ? 'В корзине' : 'В корзину')}
                    className="image-11"
                  />
                </div>
              </button>
              {(() => {
                const existingQty = getExistingCartQuantity();
                if (existingQty > 0) {
                  return (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        backgroundColor: 'var(--green)',
                        color: 'white',
                        borderRadius: '50%',
                        minWidth: '20px',
                        height: '20px',
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        zIndex: 1,
                        padding: '0 4px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                      title={`В корзине: ${existingQty} шт.`}
                    >
                      {existingQty}
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductItemCard; 