import React, { useState, useEffect, useMemo } from "react";
import { useCart } from "@/contexts/CartContext";
import toast from "react-hot-toast";
import CartIcon from "./CartIcon";

interface BestPriceCardProps {
  bestOfferType: string;
  title: string;
  description: string;
  price: string;
  delivery: string;
  stock: string;
  offer?: any; // Добавляем полный объект предложения для корзины
}

const BestPriceCard: React.FC<BestPriceCardProps> = ({
  bestOfferType,
  title,
  description,
  price,
  delivery,
  stock,
  offer
}) => {
  const { addItem, state: cartState } = useCart();

  // Парсим stock в число, если возможно
  const parsedStock = parseInt(stock.replace(/[^\d]/g, ""), 10);
  const maxCount = isNaN(parsedStock) ? undefined : parsedStock;
  const [count, setCount] = useState(1);
  const [inputValue, setInputValue] = useState("1");

  // Функция для получения количества товара уже добавленного в корзину
  const getExistingCartQuantity = (): number => {
    if (!offer) {
      console.log('❌ No offer');
      return 0;
    }

    if (!cartState || !cartState.items || cartState.items.length === 0) {
      console.log('❌ No cart items:', { hasCartState: !!cartState, itemsLength: cartState?.items?.length });
      return 0;
    }

    // Для отладки - логируем структуру offer (показываем ВСЕ поля)
    console.log('🔍 BestPriceCard offer (ALL FIELDS):', offer);
    console.log('🔍 BestPriceCard offer (KEY FIELDS):', {
      offerKey: offer.offerKey,
      productId: offer.productId,
      articleNumber: offer.articleNumber,
      code: offer.code,
      brand: offer.brand,
      type: offer.type
    });

    console.log('🛒 Cart items:', cartState.items.map(item => ({
      article: item.article,
      brand: item.brand,
      productId: item.productId,
      offerKey: item.offerKey,
      quantity: item.quantity
    })));

    const existingItem = cartState.items.find(item => {
      // Проверка по offerKey (приоритет)
      if (offer.offerKey && item.offerKey) {
        return item.offerKey === offer.offerKey;
      }

      // Проверка по productId
      if (offer.productId && item.productId) {
        return item.productId === offer.productId;
      }

      // Проверка по артикулу и бренду (нормализуем для сравнения)
      if (offer.articleNumber && offer.brand && item.article && item.brand) {
        const offerArticle = offer.articleNumber.toUpperCase().trim();
        const itemArticle = item.article.toUpperCase().trim();
        const offerBrand = offer.brand.toUpperCase().trim();
        const itemBrand = item.brand.toUpperCase().trim();

        const match = offerArticle === itemArticle && offerBrand === itemBrand;
        if (match) {
          console.log('✅ Found match:', { offerArticle, offerBrand, itemArticle, itemBrand, quantity: item.quantity });
        }
        return match;
      }

      return false;
    });

    const quantity = existingItem?.quantity ?? 0;
    console.log('📊 Cart quantity for offer:', quantity);
    return quantity;
  };

  // Вычисляем количество товара в корзине с использованием useMemo
  const existingCartQuantity = useMemo(() => {
    const qty = getExistingCartQuantity();
    console.log('🎯 BestPriceCard existingCartQuantity:', qty, 'for offer:', offer?.articleNumber, offer?.brand);
    return qty;
  }, [cartState, offer]);

  useEffect(() => {
    setInputValue(count.toString());
  }, [count]);

  const handleMinus = () => setCount(prev => Math.max(1, prev - 1));
  const handlePlus = () => {
    if (maxCount !== undefined) {
      setCount(prev => (prev < maxCount ? prev + 1 : prev));
    } else {
      setCount(prev => prev + 1);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (val === "") {
      // Не обновляем count, пока не будет blur
      return;
    }
    let value = parseInt(val, 10);
    if (isNaN(value) || value < 1) value = 1;
    if (maxCount !== undefined && value > maxCount) {
      toast.error(`Максимум ${maxCount} шт.`);
      return;
    }
    setCount(value);
  };

  const handleInputBlur = () => {
    if (inputValue === "") {
      setInputValue("1");
      setCount(1);
    }
  };

  // Функция для парсинга цены из строки
  const parsePrice = (priceStr: string): number => {
    const cleanPrice = priceStr.replace(/[^\d.,]/g, '').replace(',', '.');
    return parseFloat(cleanPrice) || 0;
  };

  // Note: BestPriceCard doesn't receive isInCart flags from backend
  // Since it's a summary component, we'll remove cart state checking for now
  const inCart = false; // Disabled for BestPriceCard

  // Обработчик добавления в корзину
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!offer) {
      toast.error('Информация о товаре недоступна');
      return;
    }

    const numericPrice = parsePrice(price);
    if (numericPrice <= 0) {
      toast.error('Цена товара не найдена');
      return;
    }

    // Убрана проверка авторизации - теперь неавторизованные пользователи могут добавлять в корзину

    try {
      const result = await addItem({
        productId: offer.productId,
        offerKey: offer.offerKey,
        name: description,
        description: `${offer.brand} ${offer.articleNumber} - ${description}`,
        brand: offer.brand,
        article: offer.articleNumber,
        price: numericPrice,
        currency: offer.currency || 'RUB',
        quantity: count,
        stock: maxCount, // передаем информацию о наличии
        deliveryTime: delivery,
        warehouse: offer.warehouse || 'Склад',
        supplier: offer.supplier || (offer.isExternal ? 'AutoEuro' : 'Protek'),
        isExternal: offer.isExternal || false,
        image: offer.image,
      });

      if (result.success) {
        // Показываем тоастер с разным текстом в зависимости от того, был ли товар уже в корзине
        const toastMessage = inCart 
          ? `Количество увеличено (+${count} шт.)`
          : 'Товар добавлен в корзину!';
        
        toast.success(
          <div>
            <div className="font-semibold" style={{ color: '#fff' }}>{toastMessage}</div>
            <div className="text-sm" style={{ color: '#fff', opacity: 0.9 }}>{`${offer.brand} ${offer.articleNumber} (${count} шт.)`}</div>
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
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error);
      toast.error('Ошибка добавления товара в корзину');
    }
  };

  return (
    <div className="w-layout-vflex flex-block-44">
      <h3 className="heading-8-copy line-clamp-2 md:line-clamp-1 min-h-[2.5em] md:min-h-0">{bestOfferType}</h3>
      <div className="w-layout-vflex flex-block-40">
        <div className="w-layout-hflex flex-block-45">
          <div className="w-layout-hflex flex-block-39 flex flex-col">
            <h4 className="heading-9 truncate overflow-hidden whitespace-nowrap max-w-[140px] md:max-w-full w-full">{title}</h4>
            <div className="text-block-21 truncate overflow-hidden whitespace-nowrap max-w-[140px] md:max-w-full w-full">{description}</div>
          </div>
        </div>
        <div className="heading-9-copy">{price}</div>
      </div>
      <div className="w-layout-vflex flex-block-37">
        <div className="w-layout-hflex flex-block-43">
          <div className="w-layout-hflex flex-block-78">
            <div className="w-layout-hflex flex-block-80">
              <div className="w-layout-vflex flex-block-106">
                <div className="text-block-23">Срок</div>
                <div className="text-block-24">{delivery === 'В день заказа' ? '1 день' : delivery}</div>
              </div>
              <div className="w-layout-vflex flex-block-105">
                <div className="text-block-23">Наличие</div>
                <div className="text-block-24">{stock}</div>
              </div>
            </div>
            <div className="w-layout-hflex pcs-cart-s1">
              <div className="input-pcs w-16">
                <input
                  type="number"
                  min={1}
                  max={maxCount}
                  value={inputValue}
                  onChange={handleInput}
                  onBlur={handleInputBlur}
                  className="text-block-26 w-full text-center outline-none"
                  aria-label="Количество"
                />
              </div>
            </div>
          </div>
          <div className="w-layout-hflex flex-block-42">
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button
                type="button"
                onClick={handleAddToCart}
                className={`button-icon w-inline-block ${inCart ? 'in-cart' : ''}`}
                style={{
                  cursor: 'pointer',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  opacity: inCart ? 0.5 : 1,
                  backgroundColor: inCart ? '#9ca3af' : undefined,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                aria-label={inCart ? "Товар уже в корзине" : "Добавить в корзину"}
                title={inCart ? "Товар уже в корзине - нажмите для добавления еще" : "Добавить в корзину"}
              >
                <svg width="20" height="20" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M10.1998 22.2C8.8798 22.2 7.81184 23.28 7.81184 24.6C7.81184 25.92 8.8798 27 10.1998 27C11.5197 27 12.5997 25.92 12.5997 24.6C12.5997 23.28 11.5197 22.2 10.1998 22.2ZM3 3V5.4H5.39992L9.71977 14.508L8.09982 17.448C7.90783 17.784 7.79984 18.18 7.79984 18.6C7.79984 19.92 8.8798 21 10.1998 21H24.5993V18.6H10.7037C10.5357 18.6 10.4037 18.468 10.4037 18.3L10.4397 18.156L11.5197 16.2H20.4594C21.3594 16.2 22.1513 15.708 22.5593 14.964L26.8552 7.176C26.9542 6.99286 27.004 6.78718 26.9997 6.57904C26.9955 6.37089 26.9373 6.16741 26.8309 5.98847C26.7245 5.80952 26.5736 5.66124 26.3927 5.55809C26.2119 5.45495 26.0074 5.40048 25.7992 5.4H8.05183L6.92387 3H3ZM22.1993 22.2C20.8794 22.2 19.8114 23.28 19.8114 24.6C19.8114 25.92 20.8794 27 22.1993 27C23.5193 27 24.5993 25.92 24.5993 24.6C24.5993 23.28 23.5193 22.2 22.1993 22.2Z"
                    fill="#FFFFFF"
                  />
                </svg>
                <span style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>Купить</span>
              </button>
              {existingCartQuantity > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    backgroundColor: '#16a34a',
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
                  title={`В корзине: ${existingCartQuantity} шт.`}
                >
                  {existingCartQuantity}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BestPriceCard; 
