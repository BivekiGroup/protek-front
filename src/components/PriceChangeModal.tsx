import React from 'react';

interface PriceChange {
  id: string;
  name: string;
  brand?: string;
  article?: string;
  image?: string;
  oldPrice: number;
  newPrice: number;
  quantity: number;
}

interface PriceChangeModalProps {
  changes: PriceChange[];
  onClose: () => void;
  onConfirm: () => void;
}

const PriceChangeModal: React.FC<PriceChangeModalProps> = ({ changes, onClose, onConfirm }) => {
  const formatPrice = (price: number) => {
    return `${price.toLocaleString('ru-RU')} ₽`;
  };

  const getPriceDifference = (oldPrice: number, newPrice: number) => {
    const diff = newPrice - oldPrice;
    const isIncrease = diff > 0;
    return {
      diff: Math.abs(diff),
      isIncrease,
      percentage: Math.abs(((newPrice - oldPrice) / oldPrice) * 100).toFixed(1)
    };
  };

  const totalOldPrice = changes.reduce((sum, item) => sum + (item.oldPrice * item.quantity), 0);
  const totalNewPrice = changes.reduce((sum, item) => sum + (item.newPrice * item.quantity), 0);
  const totalDiff = getPriceDifference(totalOldPrice, totalNewPrice);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '24px',
          maxWidth: '700px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок */}
        <div style={{
          padding: '28px 32px',
          borderBottom: '1px solid #E5E7EB',
          background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: '#F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: 700,
                color: '#92400E',
                fontFamily: 'Onest, sans-serif',
              }}>
                Цены изменились
              </h2>
              <p style={{
                margin: '4px 0 0 0',
                fontSize: '14px',
                color: '#78350F',
                fontFamily: 'Onest, sans-serif',
              }}>
                {changes.length} {changes.length === 1 ? 'товар' : 'товара'} в вашей корзине {totalDiff.isIncrease ? 'подорожал' : 'подешевел'}
              </p>
            </div>
          </div>
        </div>

        {/* Список товаров */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 32px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {changes.map((item) => {
              const priceDiff = getPriceDifference(item.oldPrice, item.newPrice);

              return (
                <div
                  key={item.id}
                  style={{
                    border: '1px solid #E5E7EB',
                    borderRadius: '16px',
                    padding: '16px',
                    background: '#F9FAFB',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    {/* Информация о товаре */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: '#111827',
                        marginBottom: '6px',
                        fontFamily: 'Onest, sans-serif',
                        lineHeight: '1.4',
                      }}>
                        {item.name}
                      </div>

                      {(item.brand || item.article) && (
                        <div style={{
                          fontSize: '13px',
                          color: '#6B7280',
                          marginBottom: '12px',
                          fontFamily: 'Onest, sans-serif',
                        }}>
                          {item.brand && <span>{item.brand}</span>}
                          {item.brand && item.article && <span> • </span>}
                          {item.article && <span>Арт: {item.article}</span>}
                        </div>
                      )}

                      {/* Изменение цены */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{
                          fontSize: '15px',
                          fontWeight: 600,
                          color: '#9CA3AF',
                          textDecoration: 'line-through',
                          fontFamily: 'Onest, sans-serif',
                        }}>
                          {formatPrice(item.oldPrice)}
                        </div>

                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M7.5 15L12.5 10L7.5 5" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>

                        <div style={{
                          fontSize: '18px',
                          fontWeight: 700,
                          color: priceDiff.isIncrease ? '#DC2626' : '#059669',
                          fontFamily: 'Onest, sans-serif',
                        }}>
                          {formatPrice(item.newPrice)}
                        </div>

                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 600,
                          fontFamily: 'Onest, sans-serif',
                          background: priceDiff.isIncrease ? '#FEE2E2' : '#D1FAE5',
                          color: priceDiff.isIncrease ? '#DC2626' : '#059669',
                        }}>
                          {priceDiff.isIncrease ? '↑' : '↓'} {formatPrice(priceDiff.diff)} ({priceDiff.percentage}%)
                        </div>
                      </div>

                      {item.quantity > 1 && (
                        <div style={{
                          marginTop: '8px',
                          fontSize: '13px',
                          color: '#6B7280',
                          fontFamily: 'Onest, sans-serif',
                        }}>
                          Количество: {item.quantity} шт. • Итого: {formatPrice(item.newPrice * item.quantity)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Общая разница */}
          {changes.length > 1 && (
            <div style={{
              marginTop: '24px',
              padding: '20px',
              borderRadius: '16px',
              background: totalDiff.isIncrease ? '#FEF2F2' : '#ECFDF5',
              border: `2px solid ${totalDiff.isIncrease ? '#FEE2E2' : '#D1FAE5'}`,
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}>
                <span style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#6B7280',
                  fontFamily: 'Onest, sans-serif',
                }}>
                  Общая стоимость изменилась:
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <span style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#9CA3AF',
                  textDecoration: 'line-through',
                  fontFamily: 'Onest, sans-serif',
                }}>
                  {formatPrice(totalOldPrice)}
                </span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: totalDiff.isIncrease ? '#DC2626' : '#059669',
                  fontFamily: 'Onest, sans-serif',
                }}>
                  {formatPrice(totalNewPrice)}
                </span>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: 700,
                  fontFamily: 'Onest, sans-serif',
                  background: totalDiff.isIncrease ? '#DC2626' : '#059669',
                  color: 'white',
                }}>
                  {totalDiff.isIncrease ? '↑' : '↓'} {formatPrice(totalDiff.diff)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Кнопки */}
        <div style={{
          padding: '24px 32px',
          borderTop: '1px solid #E5E7EB',
          background: '#F9FAFB',
          display: 'flex',
          gap: '12px',
        }}>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '14px 24px',
              border: 'none',
              borderRadius: '12px',
              background: '#EC1C24',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'Onest, sans-serif',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#D01920';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#EC1C24';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Продолжить с новыми ценами
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '14px 24px',
              border: '2px solid #E5E7EB',
              borderRadius: '12px',
              background: '#fff',
              color: '#6B7280',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'Onest, sans-serif',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#D1D5DB';
              e.currentTarget.style.background = '#F9FAFB';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E5E7EB';
              e.currentTarget.style.background = '#fff';
            }}
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};

export default PriceChangeModal;
