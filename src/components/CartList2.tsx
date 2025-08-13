import React from "react";
import { useCart } from "@/contexts/CartContext";

const CartList2: React.FC = () => {
  const { state, updateComment } = useCart();
  const { items } = state;

  const handleComment = (id: string, comment: string) => {
    updateComment(id, comment);
  };

  // Функция для форматирования цены
  const formatPrice = (price: number, currency: string = 'RUB') => {
    return `${price.toLocaleString('ru-RU')} ${currency === 'RUB' ? '₽' : currency}`;
  };

  // Показываем только выбранные товары на втором этапе
  const selectedItems = items.filter(item => item.selected);

  return (
    <div className="w-layout-vflex flex-block-48">
      <div className="w-layout-vflex product-list-cart-check">
        {selectedItems.length === 0 ? (
          <div className="empty-cart-message" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            <p>Не выбрано товаров для заказа</p>
            <p>Вернитесь на предыдущий шаг и выберите товары</p>
          </div>
        ) : (
          selectedItems.map((item, index) => (
            <div
              className={
                "div-block-21-copy" +
                (index === 0 ? " border-t-0" : "")
              }
              style={
                index === 0 ? { borderTop: 'none' } : undefined
              }
              key={item.id}
            >
              <div className="w-layout-hflex cart-item-check">
                <div className="w-layout-hflex info-block-search">
                  <div className="text-block-35">{item.quantity}</div>
                  <div className="w-layout-hflex block-name">
                    <h4 className="heading-9-copy">{item.name}</h4>
                    <div className="text-block-21-copy">{item.description}</div>
                  </div>
                  <div className="form-block-copy w-form">
                    <form className="form-copy" onSubmit={e => e.preventDefault()}>
                      <input
                        className="text-field-copy w-input"
                        maxLength={256}
                        name="Search-5"
                        data-name="Search 5"
                        placeholder="Комментарий"
                        type="text"
                        id={`Search-${item.id}`}
                        value={item.comment || ''}
                        onChange={e => handleComment(item.id, e.target.value)}
                      />
                    </form>
                    <div className="success-message w-form-done">
                      <div>Thank you! Your submission has been received!</div>
                    </div>
                    <div className="error-message w-form-fail">
                      <div>Oops! Something went wrong while submitting the form.</div>
                    </div>
                  </div>
                </div>
                <div className="w-layout-hflex add-to-cart-block">
                  <div className="w-layout-hflex flex-block-39-copy">
                    <h4 className="heading-9-copy">{item.deliveryTime || 'Уточняется'}</h4>
                    <div className="text-block-21-copy">{item.deliveryDate || ''}</div>
                  </div>
                  <div className="w-layout-hflex pcs">
                    <div className="pcs-text">{item.quantity} шт.</div>
                  </div>
                  <div className="w-layout-hflex flex-block-39-copy-copy">
                    <h4 className="heading-9-copy-copy">{formatPrice(item.price * item.quantity, item.currency)}</h4>
                    <div className="text-block-21-copy-copy">{formatPrice(item.price, item.currency)}/шт</div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CartList2; 