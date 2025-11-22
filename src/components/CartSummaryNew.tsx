import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCart } from "@/contexts/CartContext";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_ORDER, CREATE_PAYMENT, GET_CLIENT_ME, GET_CLIENT_DELIVERY_ADDRESSES } from "@/lib/graphql";
import toast from "react-hot-toast";
import { useAuthPrompt } from "@/contexts/AuthPromptContext";
import { onAuthChanged } from "@/lib/authEvents";

const TIME_SLOTS = [
  '9:00 - 12:00',
  '12:00 - 15:00',
  '15:00 - 18:00',
  '18:00 - 21:00',
  'Любое время'
];

interface CartSummaryNewProps {
  step: number;
  setStep: (step: number) => void;
}

const CartSummaryNew: React.FC<CartSummaryNewProps> = ({ step, setStep }) => {
  const router = useRouter();
  const { state, updateDelivery, updateOrderComment, clearCart, updatePrices } = useCart();
  const { summary, delivery, items, orderComment } = state;

  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);

  const [selectedLegalEntity, setSelectedLegalEntity] = useState<string>("");
  const [selectedLegalEntityId, setSelectedLegalEntityId] = useState<string>("");
  const [selectedDeliveryAddress, setSelectedDeliveryAddress] = useState<string>("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [selectedDeliveryTime, setSelectedDeliveryTime] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("yookassa");

  const [createOrder] = useMutation(CREATE_ORDER);
  const [createPayment] = useMutation(CREATE_PAYMENT);

  const { openAuthPrompt } = useAuthPrompt();
  const [storedUserData, setStoredUserData] = useState<any>(null);
  const isAuthenticated = Boolean(storedUserData);

  const { data: clientData } = useQuery(GET_CLIENT_ME, {
    skip: !isAuthenticated
  });

  // Инициализация userData из localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const rawUserData = localStorage.getItem('userData');
      if (rawUserData) {
        try {
          setStoredUserData(JSON.parse(rawUserData));
        } catch (error) {
          console.error('Ошибка чтения userData из localStorage:', error);
          setStoredUserData(null);
        }
      }
    }
  }, []);

  // Подписка на изменения авторизации
  useEffect(() => {
    const unsubscribe = onAuthChanged(({ status, user }) => {
      if (status === 'login') {
        setStoredUserData(user);
      }
      if (status === 'logout') {
        setStoredUserData(null);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('ru-RU')} ₽`;
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      openAuthPrompt({ targetPath: '/cart' });
      return;
    }

    if (summary.totalItems === 0) {
      toast.error('Корзина пуста');
      return;
    }

    // Проверяем и обновляем цены перед оформлением
    console.log('🔍 Проверка актуальности цен перед оформлением заказа...');
    await updatePrices(true);

    // Переходим на страницу оформления
    router.push('/checkout');
  };

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      toast.error("Введите промокод");
      return;
    }

    // Здесь должна быть логика проверки промокода на сервере
    // Для примера всегда показываем ошибку "Промокод не найден"
    toast.error("Промокод не найден");
  };

  const totalDiscount = summary.totalDiscount + promoDiscount;
  const finalPrice = summary.totalPrice - totalDiscount;

  return (
    <div style={{
      position: 'sticky',
      top: '20px',
      width: '380px',
      maxWidth: '100%',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}>
        {/* Черный блок авторизации для неавторизованных */}
        {!isAuthenticated && (
          <div style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: '20px',
            gap: '14px',
            isolation: 'isolate',
            width: '100%',
            minHeight: '224px',
            background: '#000000',
            borderRadius: '10px',
            marginBottom: '20px',
            overflow: 'hidden',
          }}>
            {/* Красное размытое пятно */}
            <div style={{
              position: 'absolute',
              width: '194px',
              height: '194px',
              right: '-31px',
              top: '-32px',
              background: 'rgba(236, 28, 36, 0.6)',
              filter: 'blur(50px)',
              zIndex: 0,
            }} />

            {/* Текст "Только для юрлиц" */}
            <div style={{
              fontFamily: 'Onest, sans-serif',
              fontWeight: 600,
              fontSize: '14px',
              lineHeight: '18px',
              textTransform: 'uppercase',
              color: '#B7CAE2',
              zIndex: 1,
              alignSelf: 'stretch',
            }}>
              Только для юрлиц
            </div>

            {/* Заголовок */}
            <div style={{
              fontFamily: 'Onest, sans-serif',
              fontWeight: 700,
              fontSize: '20px',
              lineHeight: '26px',
              color: '#FFFFFF',
              zIndex: 2,
              alignSelf: 'stretch',
            }}>
              Авторизуйте для оформления заказа
            </div>

            {/* Описание */}
            <div style={{
              fontFamily: 'Onest, sans-serif',
              fontWeight: 400,
              fontSize: '12px',
              lineHeight: '15px',
              color: '#FFFFFF',
              zIndex: 3,
              alignSelf: 'stretch',
            }}>
              Заказы доступны только зарегистрированным пользователям
            </div>

            {/* Кнопка Войти */}
            <button
              onClick={() => openAuthPrompt({ targetPath: '/cart' })}
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '12px 20px',
                gap: '8px',
                background: '#EC1C24',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                zIndex: 4,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#D01920';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#EC1C24';
              }}
            >
              <span style={{
                fontFamily: 'Onest, sans-serif',
                fontWeight: 600,
                fontSize: '14px',
                lineHeight: '130%',
                textAlign: 'center',
                color: '#FFFFFF',
              }}>
                Войти
              </span>
            </button>
          </div>
        )}

        {/* Промокод */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 600,
            color: '#111827',
            marginBottom: '8px',
            fontFamily: 'Onest, sans-serif',
          }}>
            Промокод
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              disabled={promoApplied}
              placeholder="Введите промокод"
              style={{
                flex: 1,
                padding: '10px 12px',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                fontFamily: 'Onest, sans-serif',
                background: promoApplied ? '#F9FAFB' : '#fff',
              }}
              onFocus={(e) => {
                if (!promoApplied) e.target.style.borderColor = '#EC1C24';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#D1D5DB';
              }}
            />
            <button
              onClick={promoApplied ? () => {
                setPromoApplied(false);
                setPromoCode("");
                setPromoDiscount(0);
              } : handleApplyPromo}
              disabled={!promoCode.trim() && !promoApplied}
              style={{
                padding: '10px 16px',
                border: 'none',
                borderRadius: '8px',
                background: promoApplied ? '#FEE2E2' : '#EC1C24',
                color: promoApplied ? '#DC2626' : '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: (!promoCode.trim() && !promoApplied) ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: (!promoCode.trim() && !promoApplied) ? 0.5 : 1,
                fontFamily: 'Onest, sans-serif',
                whiteSpace: 'nowrap',
              }}
            >
              {promoApplied ? 'Удалить' : 'Применить'}
            </button>
          </div>
          {promoApplied && (
            <div style={{
              marginTop: '8px',
              fontSize: '13px',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" fill="currentColor" fillOpacity="0.2"/>
                <path d="M10.5 6L7 9.5L5.5 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Промокод активирован
            </div>
          )}
        </div>

        <div style={{
          height: '1px',
          background: '#E5E7EB',
          margin: '20px 0',
        }} />

        {/* Стоимость товаров */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}>
            <span style={{
              fontSize: '14px',
              color: '#6B7280',
              fontFamily: 'Onest, sans-serif',
            }}>
              Товары ({summary.totalItems} шт.)
            </span>
            <span style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#111827',
              fontFamily: 'Onest, sans-serif',
            }}>
              {formatPrice(summary.totalPrice)}
            </span>
          </div>

          {/* Скидка */}
          {totalDiscount > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}>
              <span style={{
                fontSize: '14px',
                color: '#6B7280',
                fontFamily: 'Onest, sans-serif',
              }}>
                Скидка
              </span>
              <span style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#059669',
                fontFamily: 'Onest, sans-serif',
              }}>
                −{formatPrice(totalDiscount)}
              </span>
            </div>
          )}

          {/* НДС */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}>
            <span style={{
              fontSize: '14px',
              color: '#6B7280',
              fontFamily: 'Onest, sans-serif',
            }}>
              Включая НДС (20%)
            </span>
            <span style={{
              fontSize: '14px',
              fontWeight: 500,
              color: '#6B7280',
              fontFamily: 'Onest, sans-serif',
            }}>
              {formatPrice(Math.round((finalPrice / 6) * 100) / 100)}
            </span>
          </div>

          {/* Доставка */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{
              fontSize: '14px',
              color: '#6B7280',
              fontFamily: 'Onest, sans-serif',
            }}>
              Доставка
            </span>
            <span style={{
              fontSize: '14px',
              fontWeight: 500,
              color: '#059669',
              fontFamily: 'Onest, sans-serif',
            }}>
              Бесплатно
            </span>
          </div>
        </div>

        {/* Выгода */}
        {totalDiscount > 0 && (
          <>
            <div style={{
              height: '1px',
              background: '#E5E7EB',
              margin: '16px 0',
            }} />
            <div style={{
              background: '#FEF3C7',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" fill="#F59E0B" fillOpacity="0.2"/>
                  <path d="M8 4V8L10.5 9.5" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#92400E',
                  fontFamily: 'Onest, sans-serif',
                }}>
                  Ваша выгода
                </span>
              </div>
              <div style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#92400E',
                fontFamily: 'Onest, sans-serif',
              }}>
                {formatPrice(totalDiscount)}
              </div>
            </div>
          </>
        )}

        <div style={{
          height: '1px',
          background: '#E5E7EB',
          margin: '20px 0',
        }} />

        {/* Итого */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}>
          <span style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#111827',
            fontFamily: 'Onest, sans-serif',
          }}>
            Итого
          </span>
          <span style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#111827',
            fontFamily: 'Onest, sans-serif',
          }}>
            {formatPrice(finalPrice)}
          </span>
        </div>

        {/* Кнопка оформления */}
        {!isAuthenticated ? (
          <button
            disabled={true}
            style={{
              width: '100%',
              padding: '14px',
              border: 'none',
              borderRadius: '12px',
              background: '#D1D5DB',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'not-allowed',
              transition: 'all 0.2s',
              fontFamily: 'Onest, sans-serif',
            }}
          >
            Перейти к оформлению
          </button>
        ) : (
          <button
            onClick={handleCheckout}
            disabled={summary.totalItems === 0}
            style={{
              width: '100%',
              padding: '14px',
              border: 'none',
              borderRadius: '12px',
              background: summary.totalItems === 0 ? '#D1D5DB' : '#EC1C24',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 600,
              cursor: summary.totalItems === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'Onest, sans-serif',
            }}
            onMouseEnter={(e) => {
              if (summary.totalItems > 0) {
                e.currentTarget.style.background = '#D01920';
              }
            }}
            onMouseLeave={(e) => {
              if (summary.totalItems > 0) {
                e.currentTarget.style.background = '#EC1C24';
              }
            }}
          >
            Перейти к оформлению
          </button>
        )}
      </div>
    </div>
  );
};

export default CartSummaryNew;
