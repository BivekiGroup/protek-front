import React from "react";

interface CartItemProps {
  name: string;
  description: string;
  delivery: string;
  deliveryDate: string;
  price: string;
  pricePerItem: string;
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

const CartItem: React.FC<CartItemProps> = ({
  name,
  description,
  delivery,
  deliveryDate,
  price,
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
  // --- Фикс для input: можно стереть, при blur пустое = 1 ---
  const [inputValue, setInputValue] = React.useState(count.toString());
  React.useEffect(() => {
    setInputValue(count.toString());
  }, [count]);

  return (
    <div className="w-layout-hflex cart-item">
      <div className="w-layout-hflex info-block-search-copy">
        {isSummaryStep ? (
          <div style={{ marginRight: 12, minWidth: 24, textAlign: 'center', fontWeight: 600, fontSize: 14 }}>{itemNumber}</div>
        ) : (
        <div
          className={"div-block-7" + (selected ? " active" : "")}
          onClick={onSelect}
          style={{ marginRight: 12, cursor: 'pointer' }}
        >
          {selected && (
            <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
              <path d="M2 5.5L6 9L12 2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        )}
        <div className="w-layout-hflex block-name">
          <h4 className="heading-9-copy">{name}</h4>
          <div
            className={
              "text-block-21-copy" +
              (isSummaryStep && itemNumber === 1 ? " border-t-0" : "")
            }
            style={
              isSummaryStep && itemNumber === 1
                ? { borderTop: 'none' }
                : undefined
            }
          >
            {description}
          </div>
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
              id="Search-5"
              value={comment}
              onChange={e => onComment(e.target.value)}
              disabled={isSummaryStep}
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
          <h4 className="delivery-cart-s1">{delivery}</h4>
          <div className="text-block-21-copy-copy">{deliveryDate}</div>
        </div>
        <div className="w-layout-hflex pcs-cart-s1">
          {isSummaryStep ? (
            <div className="text-block-26" style={{ fontWeight: 600, fontSize: 14 }}>{count} шт.</div>
          ) : (
            <>
              <div
                className="minus-plus"
                onClick={() => onCountChange && onCountChange(count - 1)}
                style={{ cursor: 'pointer' }}
                aria-label="Уменьшить количество"
                tabIndex={0}
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onCountChange && onCountChange(count - 1)}
                role="button"
              >
                <div className="pluspcs w-embed">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 10.5V9.5H14V10.5H6Z" fill="currentColor"/>
                  </svg>
                </div>
              </div>
              <div className="input-pcs">
                <input
                  type="number"
                  min={1}
                  value={inputValue}
                  onChange={e => {
                    const val = e.target.value;
                    setInputValue(val);
                    if (val === "") {
                      // Не обновляем count, пока не будет blur
                      return;
                    }
                    const valueNum = Math.max(1, parseInt(val, 10) || 1);
                    onCountChange && onCountChange(valueNum);
                  }}
                  onBlur={() => {
                    if (inputValue === "") {
                      setInputValue("1");
                      onCountChange && onCountChange(1);
                    }
                  }}
                  className="text-block-26 w-full text-center outline-none"
                  aria-label="Количество"
                  style={{ width: 40 }}
                />
              </div>
              <div
                className="minus-plus"
                onClick={() => onCountChange && onCountChange(count + 1)}
                style={{ cursor: 'pointer' }}
                aria-label="Увеличить количество"
                tabIndex={0}
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onCountChange && onCountChange(count + 1)}
                role="button"
              >
                <div className="pluspcs w-embed">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 10.5V9.5H14V10.5H6ZM9.5 6H10.5V14H9.5V6Z" fill="currentColor"/>
                  </svg>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="w-layout-hflex flex-block-39-copy-copy">
          <h4 className="price-in-cart-s1">{price}</h4>
          <div className="price-1-pcs-cart-s1">{pricePerItem}</div>
        </div>
        {!isSummaryStep && (
        <div className="w-layout-hflex control-element">
          <div className="favorite-icon w-embed" onClick={onFavorite} style={{ cursor: 'pointer', color: favorite ? '#e53935' : undefined }}>
            <svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 16.5L7.84 15.4929C3.72 11.93 1 9.57248 1 6.69619C1 4.33869 2.936 2.5 5.4 2.5C6.792 2.5 8.128 3.11798 9 4.08692C9.872 3.11798 11.208 2.5 12.6 2.5C15.064 2.5 17 4.33869 17 6.69619C17 9.57248 14.28 11.93 10.16 15.4929L9 16.5Z" fill={favorite ? "#e53935" : "currentColor"} />
            </svg>
          </div>
            <div
              className="bdel"
              role="button"
              tabIndex={0}
              aria-label="Удалить из корзины"
              onClick={onRemove}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onRemove && onRemove()}
              style={{ display: 'inline-flex', cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={e => {
                const path = e.currentTarget.querySelector('path');
                if (path) path.setAttribute('fill', '#ec1c24');
              }}
              onMouseLeave={e => {
                const path = e.currentTarget.querySelector('path');
                if (path) path.setAttribute('fill', '#D0D0D0');
              }}
            >
              <svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M4.625 17.5C4.14375 17.5 3.73192 17.3261 3.3895 16.9782C3.04708 16.6304 2.87558 16.2117 2.875 15.7222V4.16667H2V2.38889H6.375V1.5H11.625V2.38889H16V4.16667H15.125V15.7222C15.125 16.2111 14.9538 16.6298 14.6114 16.9782C14.269 17.3267 13.8568 17.5006 13.375 17.5H4.625ZM6.375 13.9444H8.125V5.94444H6.375V13.9444ZM9.875 13.9444H11.625V5.94444H9.875V13.9444Z"
                  fill="#D0D0D0"
                  style={{ transition: 'fill 0.2s' }}
                />
              </svg>
            </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default CartItem; 