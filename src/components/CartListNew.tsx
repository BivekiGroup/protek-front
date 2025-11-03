import React, { useEffect, useState } from "react";
import CartItemNew from "./CartItemNew";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import ConfirmModal from "./ConfirmModal";

interface CartListNewProps {
  isSummaryStep?: boolean;
}

const CartListNew: React.FC<CartListNewProps> = ({ isSummaryStep = false }) => {
  const { state, toggleSelect, updateComment, removeItem, selectAll, removeSelected, updateQuantity, clearError } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite, favorites } = useFavorites();
  const { items } = state;
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const allSelected = items.length > 0 && items.every((item) => item.selected);
  const selectedCount = items.filter(item => item.selected).length;

  const handleSelectAll = () => {
    selectAll();
  };

  const handleRemoveSelected = () => {
    setShowConfirmModal(true);
  };

  const confirmRemoveSelected = () => {
    removeSelected();
    setShowConfirmModal(false);
  };

  const cancelRemoveSelected = () => {
    setShowConfirmModal(false);
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
    <div style={{ width: '100%' }}>
      {/* Отображение ошибок корзины */}
      {state.error && (
        <div style={{
          background: '#FEE2E2',
          border: '1px solid #F87171',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" fill="#EF4444"/>
              <path d="M10 14C10.5523 14 11 13.5523 11 13C11 12.4477 10.5523 12 10 12C9.44772 12 9 12.4477 9 13C9 13.5523 9.44772 14 10 14Z" fill="white"/>
              <path d="M10 6V10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize: '14px', color: '#991B1B', fontWeight: 500 }}>{state.error}</span>
          </div>
          <button
            onClick={clearError}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#991B1B',
              padding: '4px',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      )}

      {displayItems.length === 0 ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '100px 20px',
          textAlign: 'center',
          background: '#fff',
          borderRadius: '24px',
          border: '1px solid #E5E7EB',
        }}>
          {/* Animated cart icon */}
          <div style={{
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '32px',
            position: 'relative',
            animation: 'float 3s ease-in-out infinite',
          }}>
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
              animation: 'pulse 2s ease-in-out infinite',
            }} />
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style={{ zIndex: 1 }}>
              <path d="M26.6667 60C24.2758 60 22.3333 61.9711 22.3333 64.4C22.3333 66.8289 24.2758 68.8 26.6667 68.8C29.0575 68.8 31 66.8289 31 64.4C31 61.9711 29.0575 60 26.6667 60ZM10 13.3333V20H17.8L27.4 40.0267L23.6 46.8C22.9412 48.0001 22.5927 49.3919 22.5927 50.8333C22.5927 53.2622 24.5312 55.2333 26.9261 55.2333H65V48.9333H28.6261C28.4819 48.9333 28.3631 48.8145 28.3631 48.6703L28.4 48.5L31.4667 45.8333H58C60.0353 45.8333 61.8404 44.6045 62.6667 42.7333L72.4133 24.5867C72.6244 24.1655 72.7303 23.6887 72.7169 23.2071C72.7036 22.7253 72.5713 22.2563 72.3321 21.8477C72.0927 21.4393 71.7554 21.1053 71.3561 20.8836C70.9567 20.662 70.5103 20.5599 70.0667 20.5867H20.4L18.0667 13.3333H10ZM60 60C57.6092 60 55.6667 61.9711 55.6667 64.4C55.6667 66.8289 57.6092 68.8 60 68.8C62.3909 68.8 64.3333 66.8289 64.3333 64.4C64.3333 61.9711 62.3909 60 60 60Z" fill="#DC2626"/>
            </svg>
          </div>

          <h2 style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#111827',
            margin: '0 0 16px 0',
            fontFamily: 'Onest, sans-serif',
          }}>
            Ваша корзина пуста
          </h2>

          <p style={{
            fontSize: '18px',
            color: '#6B7280',
            margin: '0 0 40px 0',
            maxWidth: '400px',
            lineHeight: '1.6',
            fontFamily: 'Onest, sans-serif',
          }}>
            Добавьте товары из каталога, чтобы оформить заказ
          </p>

          <a
            href="/catalog"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 32px',
              border: 'none',
              borderRadius: '12px',
              background: '#EC1C24',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              fontFamily: 'Onest, sans-serif',
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(236, 28, 36, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(236, 28, 36, 0.4)';
              e.currentTarget.style.background = '#D01920';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(236, 28, 36, 0.3)';
              e.currentTarget.style.background = '#EC1C24';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 3H5L5.4 5M7 13H15L19 5H5.4M7 13L5.4 5M7 13L5.70711 14.2929C5.07714 14.9229 5.52331 16 6.41421 16H15M15 16C13.8954 16 13 16.8954 13 18C13 19.1046 13.8954 20 15 20C16.1046 20 17 19.1046 17 18C17 16.8954 16.1046 16 15 16ZM9 18C9 19.1046 8.10457 20 7 20C5.89543 20 5 19.1046 5 18C5 16.8954 5.89543 16 7 16C8.10457 16 9 16.8954 9 18Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Перейти в каталог
          </a>

          <style jsx>{`
            @keyframes float {
              0%, 100% {
                transform: translateY(0px);
              }
              50% {
                transform: translateY(-20px);
              }
            }
            @keyframes pulse {
              0%, 100% {
                transform: scale(1);
                opacity: 1;
              }
              50% {
                transform: scale(1.1);
                opacity: 0.5;
              }
            }
          `}</style>
        </div>
      ) : (
        <>
          {/* Заголовок с чекбоксом "Выбрать всё" */}
          {!isSummaryStep && (
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '16px 20px',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1px solid #E5E7EB',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  onClick={handleSelectAll}
                  style={{
                    width: '20px',
                    height: '20px',
                    border: `2px solid ${allSelected ? '#EC1C24' : '#D1D5DB'}`,
                    borderRadius: '6px',
                    background: allSelected ? '#EC1C24' : '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  {allSelected && (
                    <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                      <path
                        d="M1 4.5L4 7.5L11 1"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#111827',
                  cursor: 'pointer',
                  fontFamily: 'Onest, sans-serif',
                }}
                onClick={handleSelectAll}
                >
                  Выбрать всё
                </span>
                {selectedCount > 0 && (
                  <span style={{
                    fontSize: '14px',
                    color: '#6B7280',
                    fontFamily: 'Onest, sans-serif',
                  }}>
                    ({selectedCount} из {items.length})
                  </span>
                )}
              </div>

              {selectedCount > 0 && (
                <button
                  onClick={handleRemoveSelected}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#9CA3AF',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    transition: 'all 0.2s',
                    fontFamily: 'Onest, sans-serif',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#FEE2E2';
                    e.currentTarget.style.color = '#DC2626';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                    e.currentTarget.style.color = '#9CA3AF';
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M4.5 14C4.11875 14 3.78708 13.8667 3.505 13.6C3.22292 13.3333 3.08139 13.0111 3.08125 12.6333V3.33333H2.5V2H5.5V1.5H10.5V2H13.5V3.33333H12.9167V12.6333C12.9167 13.0111 12.7754 13.3335 12.4929 13.6007C12.2104 13.8678 11.8785 14.0007 11.4972 14H4.5ZM5.5 11.1667H6.83333V4.66667H5.5V11.1667ZM9.16667 11.1667H10.5V4.66667H9.16667V11.1667Z"
                      fill="currentColor"
                    />
                  </svg>
                  Удалить выбранные
                </button>
              )}
            </div>
          )}

          {/* Список товаров */}
          {displayItems.map((item, idx) => {
            const isInFavorites = isFavorite(item.productId, item.offerKey, item.article, item.brand);
            return (
              <CartItemNew
                key={item.id}
                id={item.id}
                name={item.name}
                description={item.description}
                brand={item.brand}
                article={item.article}
                imageUrl={item.image}
                delivery={item.deliveryTime || 'Доставка в течение 3-5 дней'}
                deliveryDate={item.deliveryDate || ''}
                price={item.price * item.quantity}
                originalPrice={item.originalPrice ? item.originalPrice * item.quantity : undefined}
                pricePerItem={item.price}
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
            );
          })}
        </>
      )}

      <ConfirmModal
        isOpen={showConfirmModal}
        title="Удалить выбранные товары?"
        message={`Вы уверены, что хотите удалить ${selectedCount} ${selectedCount === 1 ? 'товар' : selectedCount > 1 && selectedCount < 5 ? 'товара' : 'товаров'} из корзины? Это действие нельзя отменить.`}
        confirmText="Удалить"
        cancelText="Отмена"
        onConfirm={confirmRemoveSelected}
        onCancel={cancelRemoveSelected}
        isDangerous={true}
      />
    </div>
  );
};

export default CartListNew;
