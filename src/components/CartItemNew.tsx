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
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: '6px 8px 8px',
        gap: '20px',
        width: '100%',
        height: '46px',
        background: '#FFFFFF',
        borderBottom: '1px solid #E9E9E9',
        borderRadius: '8px',
      }}
    >
      {/* Чекбокс */}
      {isSummaryStep ? (
        <div style={{
          fontSize: '12px',
          fontWeight: 600,
          color: '#6B7280',
          width: '32px',
          minWidth: '32px',
          flexShrink: 0,
        }}>
          {itemNumber}
        </div>
      ) : (
        <div
          onClick={onSelect}
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            padding: '4px',
            gap: '10px',
            width: '32px',
            height: '32px',
            flexShrink: 0,
            cursor: 'pointer',
          }}
        >
          <div style={{
            position: 'relative',
            width: '24px',
            height: '24px',
          }}>
            <div style={{
              boxSizing: 'border-box',
              position: 'absolute',
              height: '24px',
              left: 0,
              right: 0,
              top: 0,
              border: `1px solid ${selected ? '#EC1C24' : '#D0D0D0'}`,
              borderRadius: '4px',
              background: selected ? '#EC1C24' : '#FFFFFF',
            }}></div>
            {selected && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                style={{
                  position: 'absolute',
                  left: '4px',
                  top: '4px',
                }}
              >
                <path
                  d="M2 8L6 12L14 4"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        </div>
      )}

      {/* Frame 565 - весь контент */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        padding: 0,
        gap: '20px',
        height: '30px',
        flex: 1,
        minWidth: 0,
      }}>
        {/* Frame 567 */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          padding: 0,
          gap: '30px',
          height: '30px',
          alignSelf: 'stretch',
        }}>
          {/* Артикул */}
          <div style={{
            minWidth: '160px',
            maxWidth: '160px',
            height: '22px',
            fontFamily: 'Onest',
            fontStyle: 'normal',
            fontWeight: 700,
            fontSize: '16px',
            lineHeight: '140%',
            color: '#000814',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}>
            {article || brand || '—'}
          </div>

          {/* Наименование */}
          <div style={{
            minWidth: 0,
            height: '20px',
            fontFamily: 'Onest',
            fontStyle: 'normal',
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: '20px',
            color: '#8893A2',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
          }}>
            {name}
          </div>

          {/* Frame 2087324697 */}
          <div style={{
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: 0,
            gap: '20px',
            minWidth: '360px',
            maxWidth: '360px',
            height: '30px',
            border: '0px solid #E9E9E9',
            flexShrink: 0,
          }}>
            {/* Доставка */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-start',
              padding: 0,
              gap: '5px',
              minWidth: '120px',
              maxWidth: '120px',
              height: '22px',
              flexShrink: 0,
            }}>
              <div style={{
                width: '100%',
                height: '22px',
                fontFamily: 'Onest',
                fontStyle: 'normal',
                fontWeight: 700,
                fontSize: '16px',
                lineHeight: '140%',
                color: '#000814',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {delivery.replace('Доставка в течение ', '').replace(' дней', ' д').replace(' день', ' д')}
              </div>
            </div>

            {/* counter_pcs */}
            {!isSummaryStep ? (
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '2px',
                gap: '2px',
                minWidth: '100px',
                maxWidth: '100px',
                height: '30px',
                background: '#F5F8FB',
                borderRadius: '5px',
                flexShrink: 0,
              }}>
                {/* pcs - минус */}
                <button
                  onClick={() => onCountChange && onCountChange(Math.max(1, count - 1))}
                  disabled={count <= 1}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '6px',
                    gap: '10px',
                    width: '26px',
                    height: '26px',
                    background: count <= 1 ? '#E6EDF6' : '#FFFFFF',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: count <= 1 ? 'not-allowed' : 'pointer',
                    alignSelf: 'stretch',
                  }}
                >
                  <div style={{
                    width: '8px',
                    height: '1px',
                    background: '#000814',
                  }}></div>
                </button>

                {/* Input */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '5px',
                  gap: '10px',
                  width: '40px',
                  height: '26px',
                  borderRadius: '4px',
                  alignSelf: 'stretch',
                }}>
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
                      width: '30px',
                      height: '20px',
                      fontFamily: 'Onest',
                      fontStyle: 'normal',
                      fontWeight: 600,
                      fontSize: '14px',
                      lineHeight: '140%',
                      display: 'flex',
                      alignItems: 'center',
                      textAlign: 'center',
                      color: '#000000',
                      border: 'none',
                      background: 'transparent',
                      outline: 'none',
                      flex: 1,
                    }}
                  />
                </div>

                {/* pcs - плюс */}
                <button
                  onClick={() => onCountChange && onCountChange(count + 1)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '6px',
                    gap: '10px',
                    width: '26px',
                    height: '26px',
                    background: '#FFFFFF',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    alignSelf: 'stretch',
                  }}
                >
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M4 0V8M0 4H8" stroke="#000814" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            ) : (
              <div style={{
                minWidth: '100px',
                maxWidth: '100px',
                textAlign: 'center',
                fontFamily: 'Onest',
                fontStyle: 'normal',
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '20px',
                color: '#000814',
                flexShrink: 0,
              }}>
                {count} шт
              </div>
            )}

            {/* Frame 2087324699 - Цена */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-end',
              padding: 0,
              minWidth: '100px',
              maxWidth: '100px',
              height: '25px',
              flexShrink: 0,
            }}>
              <div style={{
                width: '100%',
                height: '25px',
                fontFamily: 'Onest',
                fontStyle: 'normal',
                fontWeight: 700,
                fontSize: '18px',
                lineHeight: '140%',
                textAlign: 'right',
                color: '#000814',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {Math.round(price).toLocaleString('ru-RU')} ₽
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Frame 2087324813 - Действия */}
      {!isSummaryStep && (
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          padding: '0px 10px 0px 0px',
          gap: '20px',
          minWidth: '66px',
          maxWidth: '66px',
          height: '18px',
          flexShrink: 0,
        }}>
          {/* mdi:favourite */}
          <button
            onClick={onFavorite}
            style={{
              width: '18px',
              height: '18px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              const path = e.currentTarget.querySelector('path');
              if (path) {
                path.setAttribute('fill', '#EC1C24');
              }
            }}
            onMouseLeave={(e) => {
              const path = e.currentTarget.querySelector('path');
              if (path) {
                path.setAttribute('fill', favorite ? '#EC1C24' : 'transparent');
              }
            }}
            title="В избранное"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ position: 'relative' }}>
              <path
                d="M9 15.75L7.9425 14.805C4.32 11.475 1.8 9.2325 1.8 6.525C1.8 4.3575 3.5325 2.625 5.7 2.625C6.876 2.625 8.001 3.153 8.775 3.9555C9.549 3.153 10.674 2.625 11.85 2.625C14.0175 2.625 15.75 4.3575 15.75 6.525C15.75 9.2325 13.23 11.475 9.6075 14.805L9 15.75Z"
                fill={favorite ? '#EC1C24' : 'transparent'}
                stroke="#EC1C24"
                strokeWidth="1.5"
              />
            </svg>
          </button>

          {/* delete */}
          <button
            onClick={onRemove}
            style={{
              width: '18px',
              height: '18px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              const path = e.currentTarget.querySelector('path');
              if (path) {
                path.setAttribute('fill', '#EC1C24');
              }
            }}
            onMouseLeave={(e) => {
              const path = e.currentTarget.querySelector('path');
              if (path) {
                path.setAttribute('fill', '#D0D0D0');
              }
            }}
            title="Удалить"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ position: 'relative' }}>
              <path
                d="M5.0625 15.75C4.63125 15.75 4.26301 15.5963 3.95775 15.2888C3.6525 14.9812 3.49969 14.6125 3.4995 14.1825V4.5H2.625V3.1875H6.375V2.4375H11.625V3.1875H15.375V4.5H14.5005V14.1825C14.5005 14.6125 14.3477 14.9815 14.0421 15.2893C13.7364 15.5975 13.3678 15.7506 12.936 15.75H5.0625ZM6.375 13.125H7.6875V6.1875H6.375V13.125ZM10.3125 13.125H11.625V6.1875H10.3125V13.125Z"
                fill="#D0D0D0"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default CartItemNew;
