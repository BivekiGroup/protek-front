import React, { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "react-hot-toast";
import CartIcon from "../CartIcon";
import { isDeliveryDate } from "@/lib/utils";

interface ProductBuyBlockProps {
  offer?: any;
}

const ProductBuyBlock = ({ offer }: ProductBuyBlockProps) => {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const parseStock = (stock: any): number | undefined => {
    if (stock === null || stock === undefined) return undefined;
    if (typeof stock === 'number') return stock;
    const match = String(stock).match(/\d+/);
    return match ? parseInt(match[0], 10) : undefined;
  };

  const availableStock = parseStock(offer?.quantity);
  const isOutOfStock = typeof availableStock === 'number' && availableStock <= 0;

  if (!offer) {
    return (
      <div className="w-layout-hflex add-to-cart-block-copy">
        <div className="text-center py-4">
          <p className="text-gray-500">Загрузка...</p>
        </div>
      </div>
    );
  }

  const handleQuantityChange = (delta: number) => {
    if (isOutOfStock) {
      toast.error('Товара нет в наличии');
      return;
    }

    const maxAllowed = typeof availableStock === 'number' ? availableStock : 999;
    const newQuantity = Math.max(1, Math.min(maxAllowed, quantity + delta));

    // Проверка превышения доступного количества
    if (delta > 0 && newQuantity === quantity && typeof availableStock === 'number') {
      toast.error(`Нельзя добавить больше ${availableStock} шт`);
      return;
    }

    setQuantity(newQuantity);
  };

  // Обработчик добавления в корзину
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (isOutOfStock) {
        toast.error('Товара нет в наличии');
        return;
      }

      if (!offer.price || offer.price <= 0) {
        toast.error('Цена товара не найдена');
        return;
      }

      // Добавляем товар в корзину
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
        deliveryTime: offer.deliveryTime ? (typeof offer.deliveryTime === 'string' && isDeliveryDate(offer.deliveryTime)
          ? offer.deliveryTime
          : (() => {
              const days = Number(offer.deliveryTime);
              const pluralize = (count: number): string => {
                const lastDigit = count % 10;
                const lastTwoDigits = count % 100;
                if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return 'дней';
                if (lastDigit === 1) return 'день';
                if (lastDigit >= 2 && lastDigit <= 4) return 'дня';
                return 'дней';
              };
              return `${days} ${pluralize(days)}`;
            })()) : '1 день',
        isExternal: offer.type === 'external'
      });

      if (result.success) {
        // Показываем успешный тоастер
        toast.success(
          <div>
            <div className="font-semibold" style={{ color: '#fff' }}>Товар добавлен в корзину!</div>
            <div className="text-sm" style={{ color: '#fff', opacity: 0.9 }}>{offer.name || `${offer.brand} ${offer.articleNumber}`}</div>
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
      toast.error('Ошибка при добавлении товара в корзину');
    }
  };

  // Всегда показываем цену за 1 товар
  const unitPrice = offer.price;

  return (
    <div className="w-layout-hflex add-to-cart-block-copy">
      <div className="pcs-card">{typeof availableStock === 'number' ? `${Math.max(availableStock, 0)} шт` : '—'}</div>
      <div className="price opencard">{unitPrice.toLocaleString('ru-RU')} ₽</div>
      <div className="w-layout-hflex pcs-copy">
        <div
          className="minus-plus"
          onClick={() => handleQuantityChange(-1)}
          style={{ cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
        >
          <img loading="lazy" src="images/minus_icon.svg" alt="" />
        </div>
        <div className="input-pcs">
          <div className="text-block-26">{quantity}</div>
        </div>
        <div
          className="minus-plus"
          onClick={() => handleQuantityChange(1)}
          style={{ cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
        >
          <img loading="lazy" src="images/plus_icon.svg" alt="" />
        </div>
      </div>
      <div 
        className="button-icon w-inline-block" 
        onClick={handleAddToCart}
        style={{ 
          cursor: isOutOfStock ? 'not-allowed' : 'pointer',
          transition: 'transform 0.2s ease',
          opacity: isOutOfStock ? 0.6 : 1,
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        aria-disabled={isOutOfStock}
      >
        <img loading="lazy" src="images/cart_icon.svg" alt="" className="image-11" />
      </div>
    </div>
  );
};

export default ProductBuyBlock; 
