import React, { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuthPrompt } from '@/contexts/AuthPromptContext';

interface UnauthenticatedCartProps {
  className?: string;
}

const UnauthenticatedCart: React.FC<UnauthenticatedCartProps> = ({ className = '' }) => {
  const { state } = useCart();
  const { summary } = state;
  const { openAuthPrompt } = useAuthPrompt();
  const [isAgreed, setIsAgreed] = useState(false);

  const formatPrice = (price: number): string => {
    return `${price.toLocaleString('ru-RU')} ₽`;
  };

  const deliveryPrice = 389; // Fixed delivery price as shown in Figma

  return (
    <div className={`unauthenticated-cart ${className}`}>
      {/* Authentication Required Section */}
      <div className="auth-requirement-section">
        {/* Background gradient circle */}
        <div className="gradient-circle" aria-hidden="true" />
        
        <div className="auth-content">
          <div className="auth-label">ТОЛЬКО ДЛЯ ЮРЛИЦ</div>
          
          <h2 className="auth-title">
            Авторизируйте для оформления заказа
          </h2>
          
          <p className="auth-subtitle">
            Заказы доступны только зарегистрированным пользователям
          </p>
          
          <button 
            type="button"
            className="auth-login-button"
            onClick={() => openAuthPrompt({ targetPath: '/cart' })}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.67 4.67L10 8L6.67 11.33" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 8H8" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 2H14V14H10" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Войти
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="cart-divider" />

      {/* Order Summary */}
      <div className="order-summary">
        <div className="summary-row">
          <span className="summary-label">Товары, {summary.totalItems} шт.</span>
          <span className="summary-value">{formatPrice(summary.totalPrice)}</span>
        </div>
        
        <div className="summary-row">
          <span className="summary-label">Доставка</span>
          <span className="summary-value">{formatPrice(deliveryPrice)}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="cart-divider" />

      {/* Total */}
      <div className="total-section">
        <div className="total-row">
          <span className="total-label">Итого</span>
          <span className="total-value">{formatPrice(summary.totalPrice + deliveryPrice)}</span>
        </div>
      </div>

      {/* Checkout Button - Disabled */}
      <button 
        type="button" 
        className="checkout-button checkout-button--disabled"
        disabled
      >
        Оформить заказ
      </button>

      {/* Terms Agreement */}
      <div className="terms-agreement">
        <div className="checkbox-wrapper" onClick={() => setIsAgreed(!isAgreed)}>
          <div className={`checkbox ${isAgreed ? 'checkbox--checked' : ''}`}>
            {isAgreed && (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.667 5L7.5 14.167L3.333 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <div className="terms-text">
            <span>Соглашаюсь с </span>
            <a href="#" className="terms-link">правилами пользования торговой площадкой</a>
            <span> и </span>
            <a href="#" className="terms-link">возврата</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthenticatedCart;
