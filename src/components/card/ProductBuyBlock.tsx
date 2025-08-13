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
    const newQuantity = Math.max(1, Math.min(offer.quantity || 999, quantity + delta));
    setQuantity(newQuantity);
  };

  // Обработчик добавления в корзину
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
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
        stock: offer.quantity, // передаем информацию о наличии
        image: offer.image || undefined,
        brand: offer.brand,
        article: offer.articleNumber,
        supplier: offer.supplier || (offer.type === 'external' ? 'AutoEuro' : 'Внутренний'),
        deliveryTime: offer.deliveryTime ? (typeof offer.deliveryTime === 'string' && isDeliveryDate(offer.deliveryTime)
          ? offer.deliveryTime 
          : String(offer.deliveryTime) + ' дней') : '1 день',
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

  const totalPrice = offer.price * quantity;

  return (
    <div className="w-layout-hflex add-to-cart-block-copy">
      <div className="pcs-card">{offer.quantity || 0} шт</div>
      <div className="price opencard">{totalPrice.toLocaleString('ru-RU')} ₽</div>
      <div className="w-layout-hflex pcs-copy">
        <div className="minus-plus" onClick={() => handleQuantityChange(-1)}>
          <img loading="lazy" src="images/minus_icon.svg" alt="" />
        </div>
        <div className="input-pcs">
          <div className="text-block-26">{quantity}</div>
        </div>
        <div className="minus-plus" onClick={() => handleQuantityChange(1)}>
          <img loading="lazy" src="images/plus_icon.svg" alt="" />
        </div>
      </div>
      <div 
        className="button-icon w-inline-block" 
        onClick={handleAddToCart}
        style={{ 
          cursor: 'pointer',
          transition: 'transform 0.2s ease',
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <img loading="lazy" src="images/cart_icon.svg" alt="" className="image-11" />
      </div>
    </div>
  );
};

export default ProductBuyBlock; 