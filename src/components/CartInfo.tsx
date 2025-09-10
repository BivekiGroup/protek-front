import React, { useState, useRef, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";

const CartInfo: React.FC = () => {
  const { state } = useCart();
  const { summary } = state;
  const [showTip, setShowTip] = useState(false)
  const tipRef = useRef<HTMLDivElement>(null)

  // Функция для форматирования цены
  const formatPrice = (price: number) => {
    return `${price.toLocaleString('ru-RU')} ₽`;
  };

  return (
    <section className="section-info">
    <div className="w-layout-blockcontainer container info w-container">
      <div className="w-layout-vflex flex-block-9">
        <div className="w-layout-hflex flex-block-7">
          <a href="/" className="link-block w-inline-block">
            <div>Главная</div>
          </a>
          <div className="text-block-3">→</div>
          <a href="/catalog" className="link-block w-inline-block">
            <div>Каталог</div>
          </a>
          <div className="text-block-3">→</div>
          <a href="/cart" className="link-block-2 w-inline-block">
            <div>Корзина</div>
          </a>
        </div>
        <div className="w-layout-hflex flex-block-8">
          <div className="w-layout-hflex flex-block-10">
            <h1 className="heading">Корзина</h1>
            <div className="text-block-4">
              {summary.totalItems > 0 ? (
                <>В вашей корзине {summary.totalItems} товара на <strong>{formatPrice(summary.totalPrice - summary.totalDiscount)}</strong></>
              ) : (
                'Ваша корзина пуста'
              )}
            </div>
          </div>
          <div 
            className="w-layout-hflex flex-block-11 relative"
            onMouseEnter={() => setShowTip(true)}
            onMouseLeave={() => setShowTip(false)}
            onFocus={() => setShowTip(true)}
            onBlur={() => setShowTip(false)}
            tabIndex={0}
            aria-describedby="cart-howto-tooltip"
          >
            <img src="/images/qwestions.svg" loading="lazy" alt="Подсказка" className="image-4" />
            <div className="text-block-5">Как оформить заказ?</div>
            {showTip && (
              <div 
                id="cart-howto-tooltip"
                ref={tipRef}
                role="tooltip"
                className="absolute z-50 top-full mt-2 right-0 w-[280px] p-3 rounded-lg shadow-lg bg-white border border-gray-200 text-sm text-gray-700"
              >
                1) Выберите адрес доставки и подтвердите шаг 1. 2) Укажите данные получателя. 3) Выберите оплату и подтвердите заказ. 
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </section>
  );
};

export default CartInfo; 
