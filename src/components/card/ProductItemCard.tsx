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

  const formatDeliveryTime = (deliveryTime: number | string) => {
    if (typeof deliveryTime === 'string' && isDeliveryDate(deliveryTime)) {
      return deliveryTime;
    }
    
    const days = typeof deliveryTime === 'string' ? parseInt(deliveryTime) : deliveryTime;
    
    if (!days || days === 0) return "Сегодня";
    if (days === 1) return "1 день";
    return `${days} дней`;
  };

  const getExistingCartQuantity = (): number => {
    const existingItem = cartState.items.find(item => {
      if (offer.offerKey && item.offerKey) return item.offerKey === offer.offerKey;
      if (offer.id && item.productId) return item.productId === String(offer.id);
      if (item.article && item.brand) {
        return item.article === offer.articleNumber && item.brand === offer.brand;
      }
      return false;
    });

    return existingItem?.quantity ?? 0;
  };

  const getRemainingStock = (): number | undefined => {
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

    // При вводе в поле разрешаем указать полное количество со склада
    let finalQuantity = requested;
    if (typeof availableStock === 'number') {
      finalQuantity = Math.min(requested, Math.max(availableStock, 0));
    }

    if (finalQuantity < 1) {
      finalQuantity = 1;
    }

    // Устанавливаем скорректированное значение
    setInputValue(String(finalQuantity));
    setQuantity(finalQuantity);

    // Показываем предупреждение если пытаются ввести больше чем есть на складе
    if (typeof availableStock === 'number' && requested > availableStock) {
      toast.error(`На складе доступно только ${availableStock} шт.`);
    }
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

  const handleAddToCart = async () => {
    const isAuthenticated = typeof window !== 'undefined' ? Boolean(localStorage.getItem('authToken')) : true;

    if (!isAuthenticated) {
      toast.error('Авторизуйтесь, чтобы добавить товар в корзину');
      return;
    }

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
  const isAuthenticated = typeof window !== 'undefined' ? Boolean(localStorage.getItem('authToken')) : true;
  const inCart = offer.isInCart || false;
  const cannotAddMore = typeof remainingStock === 'number' && remainingStock <= 0;
  const addDisabled = !isAuthenticated || isLocallyInCart || cannotAddMore;

  const buttonTitle = !isAuthenticated
    ? 'Только для авторизованных пользователей'
    : cannotAddMore
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
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                className="text-block-26 w-full text-center outline-none"
                aria-label="Количество"
              />
            </div>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button
                type="button"
                onClick={handleAddToCart}
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

export default ProductItemCard; 