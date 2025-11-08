import React from "react";
import Image from "next/image";

interface CartItemNewProps {
  id: string;
  name: string;
  description: string;
  brand?: string;
  article?: string;
  imageUrl?: string;
  delivery: string;
  deliveryDate: string;
  price: number;
  originalPrice?: number;
  pricePerItem: number;
  count: number;
  comment: string;
  selected: boolean;
  favorite: boolean;
  onSelect: () => void;
  onFavorite: () => void;
  onComment: (comment: string) => void;
  onCountChange?: (count: number) => void;
  onRemove?: () => void;
  isSummaryStep?: boolean;
  itemNumber?: number;
}

const CartItemNew: React.FC<CartItemNewProps> = ({
  id,
  name,
  description,
  brand,
  article,
  imageUrl,
  delivery,
  deliveryDate,
  price,
  originalPrice,
  pricePerItem,
  count,
  comment,
  selected,
  favorite,
  onSelect,
  onFavorite,
  onComment,
  onCountChange,
  onRemove,
  isSummaryStep = false,
  itemNumber,
}) => {
  const [inputValue, setInputValue] = React.useState(count.toString());
  const [showComment, setShowComment] = React.useState(false);

  React.useEffect(() => {
    setInputValue(count.toString());
  }, [count]);

  const discount = originalPrice && originalPrice > price ? originalPrice - price : 0;
  const discountPercent = originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '10px',
        padding: '10px 14px',
        marginBottom: '6px',
        border: '1px solid #E5E7EB',
        transition: 'box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        {/* Чекбокс или номер */}
        {isSummaryStep ? (
          <div style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#6B7280',
            minWidth: '24px',
          }}>
            {itemNumber}
          </div>
        ) : (
          <div
            onClick={onSelect}
            style={{
              width: '20px',
              height: '20px',
              minWidth: '20px',
              border: `2px solid ${selected ? '#EC1C24' : '#D1D5DB'}`,
              borderRadius: '4px',
              background: selected ? '#EC1C24' : '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
          >
            {selected && (
              <svg width="10" height="8" viewBox="0 0 12 9" fill="none">
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
        )}

        {/* Информация о товаре - всё в одну строку */}
        <div style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          {/* Название с брендом/артикулом в одну строку */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap' }}>
              {(brand || article) && (
                <span style={{
                  fontSize: '12px',
                  color: '#6B7280',
                  whiteSpace: 'nowrap',
                }}>
                  {brand && <span>{brand}</span>}
                  {brand && article && <span style={{ margin: '0 4px' }}>•</span>}
                  {article && <span>{article}</span>}
                </span>
              )}
              <span style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#111827',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {name}
              </span>
            </div>
          </div>

          {/* Доставка - компактно */}
          {!isSummaryStep && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '11px',
              color: '#059669',
              fontWeight: 500,
              whiteSpace: 'nowrap',
            }}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path
                  d="M10.6667 2H2.66667C1.93333 2 1.34 2.6 1.34 3.33333L1.33333 12.6667C1.33333 13.4 1.92667 14 2.66 14H13.3333C14.0667 14 14.6667 13.4 14.6667 12.6667V5.33333L10.6667 2Z"
                  fill="currentColor"
                  fillOpacity="0.2"
                />
                <path
                  d="M10.6667 2V5.33333H14L10.6667 2Z"
                  fill="currentColor"
                />
              </svg>
              <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {delivery.replace('Доставка в течение ', '')}
              </span>
            </div>
          )}
        </div>

        {/* Счетчик количества */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: '#F9FAFB',
          borderRadius: '6px',
          padding: '3px',
        }}>
          {!isSummaryStep ? (
            <>
              <button
                onClick={() => onCountChange && onCountChange(Math.max(1, count - 1))}
                disabled={count <= 1}
                style={{
                  width: '22px',
                  height: '22px',
                  minWidth: '22px',
                  border: 'none',
                  background: count <= 1 ? '#E5E7EB' : '#fff',
                  borderRadius: '4px',
                  cursor: count <= 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: count <= 1 ? '#9CA3AF' : '#111827',
                  transition: 'all 0.2s',
                }}
              >
                <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
              <input
                type="number"
                min={1}
                value={inputValue}
                onChange={(e) => {
                  const val = e.target.value;
                  setInputValue(val);
                  if (val !== "") {
                    const valueNum = Math.max(1, parseInt(val, 10) || 1);
                    onCountChange && onCountChange(valueNum);
                  }
                }}
                onBlur={() => {
                  if (inputValue === "") {
                    setInputValue("1");
                    onCountChange && onCountChange(1);
                  }
                }}
                style={{
                  width: '32px',
                  border: 'none',
                  background: 'transparent',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: 600,
                  outline: 'none',
                  color: '#111827',
                }}
              />
              <button
                onClick={() => onCountChange && onCountChange(count + 1)}
                style={{
                  width: '22px',
                  height: '22px',
                  minWidth: '22px',
                  border: 'none',
                  background: '#fff',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#111827',
                  transition: 'all 0.2s',
                }}
              >
                <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                  <path d="M6 2V10M2 6H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </>
          ) : (
            <div style={{
              padding: '3px 8px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#111827',
            }}>
              {count} шт
            </div>
          )}
        </div>

        {/* Цена - компактно в одну строку */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          minWidth: '110px',
        }}>
          {discount > 0 && (
            <span style={{
              fontSize: '11px',
              color: '#9CA3AF',
              textDecoration: 'line-through',
              whiteSpace: 'nowrap',
            }}>
              {originalPrice?.toLocaleString('ru-RU')} ₽
            </span>
          )}
          <span style={{
            fontSize: '15px',
            fontWeight: 700,
            color: '#111827',
            fontFamily: 'Onest, sans-serif',
            whiteSpace: 'nowrap',
          }}>
            {price.toLocaleString('ru-RU')} ₽
          </span>
          {discount > 0 && (
            <span style={{
              fontSize: '10px',
              fontWeight: 600,
              color: '#EC1C24',
              background: '#FEE2E2',
              padding: '2px 4px',
              borderRadius: '4px',
              whiteSpace: 'nowrap',
            }}>
              −{discountPercent}%
            </span>
          )}
        </div>

        {/* Действия с товаром */}
        {!isSummaryStep && (
          <div style={{
            display: 'flex',
            gap: '4px',
            alignItems: 'center',
          }}>
            <button
              onClick={onFavorite}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '3px',
                color: favorite ? '#EC1C24' : '#9CA3AF',
                transition: 'color 0.2s',
              }}
              title="В избранное"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 17.5L8.825 16.45C4.4 12.5 1.5 9.925 1.5 6.75C1.5 4.175 3.54 2.25 6.25 2.25C7.76 2.25 9.21 2.92 10 4.005C10.79 2.92 12.24 2.25 13.75 2.25C16.46 2.25 18.5 4.175 18.5 6.75C18.5 9.925 15.6 12.5 11.175 16.45L10 17.5Z"
                  fill={favorite ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </button>
            <button
              onClick={onRemove}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '3px',
                color: '#9CA3AF',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#EC1C24';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#9CA3AF';
              }}
              title="Удалить"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path
                  d="M5.5 18C5.0875 18 4.73433 17.8533 4.4405 17.5595C4.14667 17.2657 4 16.9125 4 16.5V5H3V3.5H7V2.75H13V3.5H17V5H16V16.5C16 16.9125 15.8533 17.2657 15.5595 17.5595C15.2657 17.8533 14.9125 18 14.5 18H5.5ZM7 14.25H8.5V6.75H7V14.25ZM11.5 14.25H13V6.75H11.5V14.25Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartItemNew;
