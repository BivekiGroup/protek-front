import React, { useEffect } from "react";
import CartItem from "./CartItem";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";

interface CartListProps {
  isSummaryStep?: boolean;
}

const CartList: React.FC<CartListProps> = ({ isSummaryStep = false }) => {
  const { state, toggleSelect, updateComment, removeItem, selectAll, removeSelected, updateQuantity, clearError } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite, favorites } = useFavorites();
  const { items } = state;

  const allSelected = items.length > 0 && items.every((item) => item.selected);

  const handleSelectAll = () => {
    selectAll();
  };

  const handleRemoveSelected = () => {
    removeSelected();
  };

  const handleSelect = (id: string) => {
    toggleSelect(id);
  };

  const handleFavorite = (id: string) => {
    const item = items.find(item => item.id === id);
    if (!item) return;
    const isInFavorites = isFavorite(item.productId, item.offerKey, item.article, item.brand);
    if (isInFavorites) {
      const favoriteItem = favorites.find((fav: any) => {
        if (item.productId && fav.productId === item.productId) return true;
        if (item.offerKey && fav.offerKey === item.offerKey) return true;
        if (fav.article === item.article && fav.brand === item.brand) return true;
        return false;
      });
      if (favoriteItem) {
        removeFromFavorites(favoriteItem.id);
      }
    } else {
      addToFavorites({
        productId: item.productId,
        offerKey: item.offerKey,
        name: item.name,
        brand: item.brand || '',
        article: item.article || '',
        price: item.price,
        currency: item.currency,
        image: item.image
      });
    }
  };

  const handleComment = (id: string, comment: string) => {
    updateComment(id, comment);
  };

  const handleRemove = (id: string) => {
    removeItem(id);
  };

  const handleCountChange = (id: string, count: number) => {
    updateQuantity(id, count);
  };

  const formatPrice = (price: number, currency: string = 'RUB') => {
    return `${price.toLocaleString('ru-RU')} ${currency === 'RUB' ? '₽' : currency}`;
  };

  // На втором шаге показываем только выбранные товары
  const displayItems = isSummaryStep ? items.filter(item => item.selected) : items;

  // Автоматически очищаем ошибки через 5 секунд
  useEffect(() => {
    if (state.error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [state.error, clearError]);

  return (
    <div className="w-layout-vflex flex-block-48" style={{ minHeight: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Отображение ошибок корзины */}
      {state.error && (
        <div className="alert alert-error mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{state.error}</span>
            </div>
            <button 
              onClick={clearError}
              className="ml-2 text-red-500 hover:text-red-700"
              aria-label="Закрыть уведомление"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      <div className="w-layout-vflex product-list-cart">
        {!isSummaryStep && (
          <div className="w-layout-hflex multi-control">
            <div className="w-layout-hflex select-all-block" onClick={handleSelectAll} style={{ cursor: 'pointer' }}>
              <div
                className={"div-block-7" + (allSelected ? " active" : "")}
                style={{ marginRight: 8, cursor: 'pointer' }}
              >
                {allSelected && (
                  <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                    <path d="M2 5.5L6 9L12 2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div className="text-block-30">Выделить всё</div>
            </div>
            <div className="w-layout-hflex select-all-block" onClick={handleRemoveSelected} style={{ cursor: 'pointer' }}
              onMouseEnter={e => {
                const path = (e.currentTarget.querySelector('path'));
                if (path) path.setAttribute('fill', '#ec1c24');
              }}
              onMouseLeave={e => {
                const path = (e.currentTarget.querySelector('path'));
                if (path) path.setAttribute('fill', '#D0D0D0');
              }}
            >
              <div className="text-block-30">Удалить выбранные</div>
              <svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg" className="image-13">
                <path
                  d="M4.625 17.5C4.14375 17.5 3.73192 17.3261 3.3895 16.9782C3.04708 16.6304 2.87558 16.2117 2.875 15.7222V4.16667H2V2.38889H6.375V1.5H11.625V2.38889H16V4.16667H15.125V15.7222C15.125 16.2111 14.9538 16.6298 14.6114 16.9782C14.269 17.3267 13.8568 17.5006 13.375 17.5H4.625ZM6.375 13.9444H8.125V5.94444H6.375V13.9444ZM9.875 13.9444H11.625V5.94444H9.875V13.9444Z"
                  fill="#D0D0D0"
                  style={{ transition: 'fill 0.2s' }}
                />
              </svg>
            </div>
          </div>
        )}
        {displayItems.length === 0 ? (
          <div className="empty-cart-message" style={{ textAlign: 'center', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', justifyContent: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 90, height: 90, borderRadius: '50%', background: '#f3f4f6', marginBottom: 8 }}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 36C14.3431 36 13 37.3431 13 39C13 40.6569 14.3431 42 16 42C17.6569 42 19 40.6569 19 39C19 37.3431 17.6569 36 16 36ZM6 8V12H10.68L16.44 24.016L14.16 28.08C13.7647 28.8001 13.5556 29.6352 13.5556 30.5C13.5556 32.1569 14.8987 33.5 16.5556 33.5H39V30.5H17.1756C17.0891 30.5 17.0178 30.4287 17.0178 30.3422L17.04 30.25L18.88 27H34.8C36.0212 27 37.1042 26.2627 37.6 25.16L43.048 14.352C43.1746 14.0993 43.2382 13.8132 43.2302 13.5242C43.2222 13.2352 43.1428 12.9538 42.9992 12.7087C42.8556 12.4636 42.6532 12.2632 42.4136 12.1302C42.174 11.9972 41.9062 11.9376 41.64 11.96H12.24L10.84 8H6ZM36 36C34.3431 36 33 37.3431 33 39C33 40.6569 34.3431 42 36 42C37.6569 42 39 40.6569 39 39C39 37.3431 37.6569 36 36 36Z" fill="#222"/>
                </svg>
              </span>
              <div style={{ fontSize: '1.7rem', fontWeight: 700, color: '#222' }}>Ваша корзина пуста</div>
            </div>
          </div>
        ) : (
          displayItems.map((item, idx) => {
            const isInFavorites = isFavorite(item.productId, item.offerKey, item.article, item.brand);
            return (
              <div
                className={
                  "div-block-21" +
                  (isSummaryStep && idx === 0 ? " border-t-0" : "")
                }
                style={
                  isSummaryStep && idx === 0
                    ? { borderTop: 'none' }
                    : undefined
                }
                key={item.id}
              >
                <CartItem
                  name={item.name}
                  description={item.description}
                  delivery={item.deliveryTime || 'Уточняется'}
                  deliveryDate={item.deliveryDate || ''}
                  price={formatPrice(item.price * item.quantity, item.currency)}
                  pricePerItem={`${formatPrice(item.price, item.currency)}/шт`}
                  count={item.quantity}
                  comment={item.comment || ''}
                  selected={item.selected}
                  favorite={isInFavorites}
                  onSelect={() => handleSelect(item.id)}
                  onFavorite={() => handleFavorite(item.id)}
                  onComment={(comment) => handleComment(item.id, comment)}
                  onCountChange={(count) => handleCountChange(item.id, count)}
                  onRemove={() => handleRemove(item.id)}
                  isSummaryStep={isSummaryStep}
                  itemNumber={idx + 1}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CartList; 