import React, { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "react-hot-toast";
import CartIcon from "../CartIcon";
import { isDeliveryDate } from "@/lib/utils";

interface ProductItemCardProps {
  isLast?: boolean;
  offer?: any;
  index: number;
}

const ProductItemCard = ({ isLast = false, offer, index }: ProductItemCardProps) => {
  const [quantity, setQuantity] = useState(1);
  const [inputValue, setInputValue] = useState("1");
  const [quantityError, setQuantityError] = useState("");
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
    setInputValue(val);
    if (val === "") return;

    const requested = Math.max(1, parseInt(val, 10) || 1);
    const remainingStock = getRemainingStock();

    let finalQuantity = requested;
    if (typeof remainingStock === 'number') {
      finalQuantity = Math.min(requested, Math.max(remainingStock, 0));
    }

    if (finalQuantity < 1) {
      finalQuantity = 1;
    }

    setQuantity(finalQuantity);

    if (typeof remainingStock === 'number' && requested > remainingStock) {
      setQuantityError(`Доступно не более ${remainingStock} шт.`);
      setInputValue(String(finalQuantity));
    } else {
      setQuantityError("");
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
        setQuantityError(errorMessage);
        setIsLocallyInCart(false);
        return;
      }

      if (quantity > remainingStock) {
        const clampedQuantity = Math.max(1, remainingStock);
        setQuantity(clampedQuantity);
        setInputValue(String(clampedQuantity));
        const errorMessage = `Можно добавить не более ${remainingStock} шт.`;
        setQuantityError(errorMessage);
        toast.error(errorMessage);
        setIsLocallyInCart(false);
        return;
      }
    }

    setQuantityError("");

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
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price * quantity) + ' ₽';
  };

  const remainingStock = getRemainingStock();
  const maxCount = typeof remainingStock === 'number' ? remainingStock : availableStock;
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
              {offer.name || `${offer.brand} ${offer.articleNumber}`}
            </span>
          </div>
        </div>
      </div>
      
      <div className="core-offers-table__cell core-offers-table__cell--article">
        {offer.articleNumber}
      </div>
      
      <div className="core-offers-table__cell core-offers-table__cell--brand">
        {offer.brand}
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
                onBlur={handleInputBlur}
                className="text-block-26 w-full text-center outline-none"
                aria-label="Количество"
              />
            </div>
            {quantityError && (
              <div className="core-offers-table__error">
                {quantityError}
              </div>
            )}
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