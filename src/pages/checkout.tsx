import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useCart } from "@/contexts/CartContext";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_ORDER, GET_CLIENT_ME, GET_CLIENT_DELIVERY_ADDRESSES } from "@/lib/graphql";
import toast from "react-hot-toast";
import { onAuthChanged } from "@/lib/authEvents";
import Footer from "@/components/Footer";
import CartInfo from "@/components/CartInfo";
import MetaTags from "@/components/MetaTags";
import { getMetaByPath } from "@/lib/meta-config";
import Image from "next/image";
import CatalogSubscribe from "@/components/CatalogSubscribe";

export default function CheckoutNewPage() {
  const router = useRouter();
  const { state, clearCart, updatePrices } = useCart();
  const { summary, items } = state;

  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const [selectedLegalEntity, setSelectedLegalEntity] = useState<any>(null);
  const [selectedDeliveryAddress, setSelectedDeliveryAddress] = useState<any>(null);
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("balance");

  // Модалки
  const [showLegalEntityModal, setShowLegalEntityModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showRecipientModal, setShowRecipientModal] = useState(false);
  const [showStockWarningModal, setShowStockWarningModal] = useState(false);
  const [stockWarningItems, setStockWarningItems] = useState<Array<{name: string, available: number, requested: number, productId?: string}>>([]);

  const [createOrder] = useMutation(CREATE_ORDER);

  const [storedUserData, setStoredUserData] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const isAuthenticated = Boolean(storedUserData);

  const { data: clientData, loading: clientLoading } = useQuery(GET_CLIENT_ME, {
    skip: !isAuthenticated
  });

  const { data: addressesData } = useQuery(GET_CLIENT_DELIVERY_ADDRESSES, {
    skip: !isAuthenticated
  });

  const metaData = getMetaByPath('/checkout');
  const selectedItems = items.filter(item => item.selected);

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
      setIsCheckingAuth(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthChanged(({ status, user }) => {
      if (status === 'login') {
        setStoredUserData(user);
      }
      if (status === 'logout') {
        setStoredUserData(null);
        router.push('/cart');
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [router]);

  useEffect(() => {
    if (!isCheckingAuth && !isAuthenticated) {
      router.push('/cart');
    }
  }, [isCheckingAuth, isAuthenticated, router]);

  useEffect(() => {
    if (clientData?.clientMe && !recipientName && !recipientPhone) {
      setRecipientName(clientData.clientMe.name || '');
      setRecipientPhone(clientData.clientMe.phone || '');
    }
  }, [clientData, recipientName, recipientPhone]);

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('ru-RU')} ₽`;
  };

  // Функция для оформления заказа с доступным количеством
  const handleOrderWithAvailableQuantity = async () => {
    setShowStockWarningModal(false);
    setIsProcessing(true);
    setError("");

    try {
      const user = storedUserData;

      // Создаем модифицированный список товаров с доступным количеством
      const modifiedItems = selectedItems.map(item => {
        const stockIssue = stockWarningItems.find(si => si.productId === item.productId);

        return {
          productId: item.productId,
          externalId: item.offerKey,
          name: item.name,
          article: item.article || '',
          brand: item.brand || '',
          price: item.price,
          quantity: stockIssue ? stockIssue.available : item.quantity
        };
      });

      const orderResult = await createOrder({
        variables: {
          input: {
            clientId: user.id,
            clientEmail: user.email || '',
            clientPhone: recipientPhone,
            clientName: recipientName,
            deliveryAddress: selectedDeliveryAddress.address,
            deliveryTime: selectedDeliveryAddress.deliveryType === 'COURIER' ? 'courier' : 'pickup',
            legalEntityId: selectedLegalEntity.id,
            paymentMethod: paymentMethod,
            comment: `Адрес доставки: ${selectedDeliveryAddress.address}. Юридическое лицо: ${selectedLegalEntity.shortName || selectedLegalEntity.fullName}. Способ оплаты: ${getPaymentMethodName(paymentMethod)}. ВНИМАНИЕ: Заказ оформлен с доступным количеством товара на складе.`,
            items: modifiedItems
          }
        }
      });

      const order = orderResult.data?.createOrder;
      if (!order) {
        throw new Error('Не удалось создать заказ');
      }

      clearCart();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cartSummaryState');
      }

      window.location.href = `/payment/success?orderId=${order.id}&orderNumber=${order.orderNumber}&paymentMethod=${paymentMethod}`;

    } catch (error) {
      console.error('Ошибка при создании заказа:', error);
      setError(error instanceof Error ? error.message : 'Произошла ошибка при оформлении заказа');
    } finally {
      setIsProcessing(false);
    }
  };

  // Функция проверки наличия товаров на складе
  const checkStockAvailability = () => {
    const itemsWithStockIssues: Array<{name: string, available: number, requested: number, productId: string}> = [];

    for (const item of selectedItems) {
      // Проверяем только внутренние товары (с productId и не isExternal)
      if (item.productId && !item.isExternal) {
        // Парсим stock (может быть string или number)
        let available = 0;
        if (typeof item.stock === 'number') {
          available = item.stock;
        } else if (typeof item.stock === 'string') {
          const match = item.stock.match(/\d+/);
          available = match ? parseInt(match[0], 10) : 0;
        }

        if (available < item.quantity) {
          itemsWithStockIssues.push({
            name: item.name,
            available: available,
            requested: item.quantity,
            productId: item.productId
          });
        }
      }
    }

    return itemsWithStockIssues;
  };

  const handleSubmit = async () => {
    if (!recipientName.trim() || !recipientPhone.trim()) {
      toast.error('Пожалуйста, укажите получателя');
      return;
    }

    if (!selectedDeliveryAddress) {
      toast.error('Пожалуйста, выберите адрес доставки');
      return;
    }

    if (!selectedLegalEntity) {
      toast.error('Пожалуйста, выберите юридическое лицо');
      return;
    }

    if (!consent) {
      toast.error('Необходимо согласиться с условиями');
      return;
    }

    // Проверяем наличие товаров ПЕРЕД отправкой заказа
    const stockIssues = checkStockAvailability();
    if (stockIssues.length > 0) {
      setStockWarningItems(stockIssues);
      setShowStockWarningModal(true);
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      console.log('🔍 Финальная проверка актуальности цен...');
      await updatePrices(true);

      const user = storedUserData;

      const orderResult = await createOrder({
        variables: {
          input: {
            clientId: user.id,
            clientEmail: user.email || '',
            clientPhone: recipientPhone,
            clientName: recipientName,
            deliveryAddress: selectedDeliveryAddress.address,
            deliveryTime: selectedDeliveryAddress.deliveryType === 'COURIER' ? 'courier' : 'pickup',
            legalEntityId: selectedLegalEntity.id,
            paymentMethod: paymentMethod,
            comment: `Адрес доставки: ${selectedDeliveryAddress.address}. Юридическое лицо: ${selectedLegalEntity.shortName || selectedLegalEntity.fullName}. Способ оплаты: ${getPaymentMethodName(paymentMethod)}.`,
            items: selectedItems.map(item => ({
              productId: item.productId,
              externalId: item.offerKey,
              name: item.name,
              article: item.article || '',
              brand: item.brand || '',
              price: item.price,
              quantity: item.quantity
            }))
          }
        }
      });

      const order = orderResult.data?.createOrder;
      if (!order) {
        throw new Error('Не удалось создать заказ');
      }

      clearCart();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cartSummaryState');
      }

      window.location.href = `/payment/success?orderId=${order.id}&orderNumber=${order.orderNumber}&paymentMethod=${paymentMethod}`;

    } catch (error) {
      console.error('Ошибка при создании заказа:', error);

      // Проверяем, является ли это ошибкой недостатка товара
      const errorMessage = error instanceof Error ? error.message : 'Произошла ошибка при оформлении заказа';

      // Парсим ошибку о недостатке товара
      const stockErrorMatch = errorMessage.match(/Недостаточно товара "([^"]+)" в наличии\. Доступно: (\d+), запрошено: (\d+)/);

      if (stockErrorMatch) {
        // Показываем модалку с предупреждением
        setStockWarningItems([{
          name: stockErrorMatch[1],
          available: parseInt(stockErrorMatch[2], 10),
          requested: parseInt(stockErrorMatch[3], 10)
        }]);
        setShowStockWarningModal(true);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'balance':
        return 'По договору';
      case 'invoice':
        return 'По счёту';
      default:
        return 'По договору';
    }
  };

  if (isCheckingAuth) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#F9FAFB',
      }}>
        <div style={{ fontSize: '16px', color: '#6B7280', fontFamily: 'Onest, sans-serif' }}>
          Загрузка...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <MetaTags {...metaData} />
      <CartInfo />

      <section style={{
        padding: '16px 0 24px 0',
        background: '#F3F3F3',
        minHeight: 'calc(100vh - 200px)',
      }}>
        <div style={{
          maxWidth: '1580px',
          margin: '0 auto',
          padding: '0 20px',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 360px',
            gap: '12px',
            alignItems: 'flex-start',
          }}>
            {/* Левая колонка */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {/* Пункт выдачи */}
              <div style={{
                background: '#fff',
                borderRadius: '10px',
                padding: '12px 16px',
                border: '1px solid #E5E7EB',
                cursor: 'pointer',
              }}
              onClick={() => setShowAddressModal(true)}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '11px',
                      color: '#9CA3AF',
                      marginBottom: '3px',
                      fontFamily: 'Onest, sans-serif',
                    }}>
                      Пункт выдачи
                    </div>
                    {selectedDeliveryAddress ? (
                      <div>
                        <div style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#111827',
                          marginBottom: '2px',
                          fontFamily: 'Onest, sans-serif',
                        }}>
                          {selectedDeliveryAddress.deliveryType === 'COURIER' ? 'Курьер' : 'Самовывоз'}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6B7280',
                          fontFamily: 'Onest, sans-serif',
                        }}>
                          {selectedDeliveryAddress.address}
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        fontSize: '13px',
                        color: '#111827',
                        fontFamily: 'Onest, sans-serif',
                      }}>
                        Выберите адрес доставки
                      </div>
                    )}
                  </div>
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <path d="M7 6L11 10L7 14" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              {/* Покупатель */}
              <div style={{
                background: '#fff',
                borderRadius: '10px',
                padding: '12px 16px',
                border: '1px solid #E5E7EB',
                cursor: 'pointer',
              }}
              onClick={() => setShowLegalEntityModal(true)}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '11px',
                      color: '#9CA3AF',
                      marginBottom: '3px',
                      fontFamily: 'Onest, sans-serif',
                    }}>
                      Покупатель
                    </div>
                    {selectedLegalEntity ? (
                      <div>
                        <div style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#111827',
                          marginBottom: '2px',
                          fontFamily: 'Onest, sans-serif',
                        }}>
                          {selectedLegalEntity.shortName || selectedLegalEntity.fullName}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6B7280',
                          fontFamily: 'Onest, sans-serif',
                        }}>
                          ИНН {selectedLegalEntity.inn}
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        fontSize: '13px',
                        color: '#111827',
                        fontFamily: 'Onest, sans-serif',
                      }}>
                        Выберите организацию
                      </div>
                    )}
                  </div>
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <path d="M7 6L11 10L7 14" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              {/* Грузополучатель (Адрес) */}
              {selectedLegalEntity && selectedLegalEntity.address && (
                <div style={{
                  background: '#fff',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  border: '1px solid #E5E7EB',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '11px',
                        color: '#9CA3AF',
                        marginBottom: '3px',
                        fontFamily: 'Onest, sans-serif',
                      }}>
                        Адрес регистрации юрлица или ИП
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#6B7280',
                        fontFamily: 'Onest, sans-serif',
                      }}>
                        {selectedLegalEntity.address}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Кто получит заказ */}
              <div style={{
                background: '#fff',
                borderRadius: '10px',
                padding: '12px 16px',
                border: '1px solid #E5E7EB',
                cursor: 'pointer',
              }}
              onClick={() => setShowRecipientModal(true)}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '11px',
                      color: '#9CA3AF',
                      marginBottom: '3px',
                      fontFamily: 'Onest, sans-serif',
                    }}>
                      Кто получит заказ
                    </div>
                    {recipientName && recipientPhone ? (
                      <div>
                        <div style={{
                          fontSize: '13px',
                          fontWeight: 500,
                          color: '#111827',
                          fontFamily: 'Onest, sans-serif',
                        }}>
                          {recipientName}, {recipientPhone}
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        fontSize: '13px',
                        color: '#111827',
                        fontFamily: 'Onest, sans-serif',
                      }}>
                        Укажите получателя
                      </div>
                    )}
                  </div>
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <path d="M7 6L11 10L7 14" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              {/* Информация о доставке */}
              <div style={{
                background: '#fff',
                borderRadius: '10px',
                padding: '12px 16px',
                border: '1px solid #E5E7EB',
                marginTop: '6px',
              }}>
                <h3 style={{
                  margin: '0 0 8px 0',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#111827',
                  fontFamily: 'Onest, sans-serif',
                }}>
                  Информация о доставке
                </h3>

                {/* Показываем даты доставки для товаров */}
                {selectedItems.some(item => item.deliveryDate) && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}>
                    {/* Группируем товары по датам доставки */}
                    {(() => {
                      const groupedByDate: Record<string, typeof selectedItems> = {};
                      selectedItems.forEach(item => {
                        const date = item.deliveryDate || 'Не указана';
                        if (!groupedByDate[date]) {
                          groupedByDate[date] = [];
                        }
                        groupedByDate[date].push(item);
                      });

                      return Object.entries(groupedByDate).map(([date, items]) => (
                        <div key={date} style={{
                          padding: '10px',
                          background: '#F9FAFB',
                          borderRadius: '6px',
                          border: '1px solid #E5E7EB',
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginBottom: '6px',
                          }}>
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                              <path d="M2 6h12M2 8h12M5 2v2M11 2v2M3 4h10a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <div style={{
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#111827',
                              fontFamily: 'Onest, sans-serif',
                            }}>
                              Доставка: {date}
                            </div>
                          </div>
                          <div style={{
                            fontSize: '11px',
                            color: '#6B7280',
                            fontFamily: 'Onest, sans-serif',
                          }}>
                            Товаров: {items.length} шт • {items.reduce((sum, item) => sum + item.quantity, 0)} единиц • {formatPrice(items.reduce((sum, item) => sum + item.price * item.quantity, 0))}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                )}

                {/* Если нет дат доставки */}
                {!selectedItems.some(item => item.deliveryDate) && (
                  <div style={{
                    padding: '10px',
                    background: '#FEF3C7',
                    borderRadius: '6px',
                    border: '1px solid #FCD34D',
                    display: 'flex',
                    alignItems: 'start',
                    gap: '8px',
                  }}>
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: '2px' }}>
                      <path d="M10 6v4m0 4h.01M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div>
                      <div style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#92400E',
                        marginBottom: '3px',
                        fontFamily: 'Onest, sans-serif',
                      }}>
                        Дата доставки уточняется
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: '#78350F',
                        fontFamily: 'Onest, sans-serif',
                      }}>
                        Менеджер свяжется с вами после оформления заказа и сообщит точную дату доставки.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Список товаров */}
              <div style={{
                background: '#fff',
                borderRadius: '10px',
                padding: '12px 16px',
                border: '1px solid #E5E7EB',
                marginTop: '6px',
              }}>
                <h3 style={{
                  margin: '0 0 10px 0',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#111827',
                  fontFamily: 'Onest, sans-serif',
                }}>
                  Товары в заказе
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedItems.map((item, idx) => (
                    <div key={item.id} style={{
                      display: 'flex',
                      gap: '10px',
                      paddingBottom: idx < selectedItems.length - 1 ? '10px' : '0',
                      borderBottom: idx < selectedItems.length - 1 ? '1px solid #F3F4F6' : 'none',
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: '12px',
                          fontWeight: 500,
                          color: '#111827',
                          marginBottom: '3px',
                          fontFamily: 'Onest, sans-serif',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {item.name}
                        </div>
                        {(item.brand || item.article) && (
                          <div style={{
                            fontSize: '11px',
                            color: '#6B7280',
                            marginBottom: '3px',
                            fontFamily: 'Onest, sans-serif',
                          }}>
                            {item.brand && <span>{item.brand}</span>}
                            {item.brand && item.article && <span> • </span>}
                            {item.article && <span>Арт: {item.article}</span>}
                          </div>
                        )}
                        <div style={{
                          fontSize: '11px',
                          color: '#6B7280',
                          fontFamily: 'Onest, sans-serif',
                        }}>
                          {item.quantity} шт × {formatPrice(item.price)}
                        </div>
                      </div>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#111827',
                        fontFamily: 'Onest, sans-serif',
                        whiteSpace: 'nowrap',
                      }}>
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Правая колонка - итоги */}
            <div style={{ position: 'sticky', top: '16px' }}>
              <div style={{
                background: '#fff',
                borderRadius: '10px',
                padding: '14px 16px',
                border: '1px solid #E5E7EB',
              }}>
                {/* Способ оплаты - РАДИОКНОПКИ */}
                <div style={{ marginBottom: '14px' }}>
                  <h3 style={{
                    margin: '0 0 10px 0',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#111827',
                    fontFamily: 'Onest, sans-serif',
                  }}>
                    Способ оплаты
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      padding: '10px',
                      border: `2px solid ${paymentMethod === 'balance' ? '#EC1C24' : '#E5E7EB'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: paymentMethod === 'balance' ? '#FEF2F2' : '#fff',
                    }}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="balance"
                        checked={paymentMethod === 'balance'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        style={{
                          width: '16px',
                          height: '16px',
                          marginRight: '8px',
                          marginTop: '2px',
                          accentColor: '#EC1C24',
                          cursor: 'pointer',
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#111827',
                          marginBottom: '2px',
                          fontFamily: 'Onest, sans-serif',
                        }}>
                          По договору
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6B7280',
                          fontFamily: 'Onest, sans-serif',
                        }}>
                          {(() => {
                            if (clientLoading) return 'Загрузка...';
                            const activeContracts = clientData?.clientMe?.contracts?.filter((c: any) => c.isActive) || [];
                            const defaultContract = activeContracts.find((c: any) => c.isDefault) || activeContracts[0];
                            if (!defaultContract) return 'Договор не найден';
                            const balance = defaultContract.balance || 0;
                            const creditLimit = defaultContract.creditLimit || 0;
                            const totalAvailable = balance + creditLimit;
                            return `Доступно: ${formatPrice(totalAvailable)}`;
                          })()}
                        </div>
                      </div>
                    </label>

                    <label style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      padding: '10px',
                      border: `2px solid ${paymentMethod === 'invoice' ? '#EC1C24' : '#E5E7EB'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: paymentMethod === 'invoice' ? '#FEF2F2' : '#fff',
                    }}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="invoice"
                        checked={paymentMethod === 'invoice'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        style={{
                          width: '16px',
                          height: '16px',
                          marginRight: '8px',
                          marginTop: '2px',
                          accentColor: '#EC1C24',
                          cursor: 'pointer',
                        }}
                      />
                      <div>
                        <div style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#111827',
                          marginBottom: '2px',
                          fontFamily: 'Onest, sans-serif',
                        }}>
                          По счёту
                        </div>
                        <div style={{
                          fontSize: '11px',
                          color: '#6B7280',
                          fontFamily: 'Onest, sans-serif',
                        }}>
                          Выставим счёт после оформления
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div style={{ height: '1px', background: '#E5E7EB', margin: '12px 0' }} />

                {/* Стоимость */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '6px',
                  }}>
                    <span style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'Onest, sans-serif' }}>
                      {summary.totalItems} товара
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#111827', fontFamily: 'Onest, sans-serif' }}>
                      {formatPrice(summary.totalPrice)}
                    </span>
                  </div>

                  {summary.totalDiscount > 0 && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}>
                      <span style={{ fontSize: '14px', color: '#6B7280', fontFamily: 'Onest, sans-serif' }}>
                        Скидка
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: 500, color: '#059669', fontFamily: 'Onest, sans-serif' }}>
                        −{formatPrice(summary.totalDiscount)}
                      </span>
                    </div>
                  )}

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}>
                    <span style={{ fontSize: '14px', color: '#6B7280', fontFamily: 'Onest, sans-serif' }}>
                      Включая НДС (20%)
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: '#6B7280', fontFamily: 'Onest, sans-serif' }}>
                      {formatPrice(Math.round(((summary.totalPrice - summary.totalDiscount) / 6) * 100) / 100)}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}>
                    <span style={{ fontSize: '14px', color: '#6B7280', fontFamily: 'Onest, sans-serif' }}>
                      Доставка
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: '#059669', fontFamily: 'Onest, sans-serif' }}>
                      Бесплатно
                    </span>
                  </div>
                </div>

                <div style={{ height: '1px', background: '#E5E7EB', margin: '12px 0' }} />

                {/* Итого */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827', fontFamily: 'Onest, sans-serif' }}>
                    Итого
                  </span>
                  <span style={{ fontSize: '18px', fontWeight: 700, color: '#111827', fontFamily: 'Onest, sans-serif' }}>
                    {formatPrice(summary.totalPrice - summary.totalDiscount)}
                  </span>
                </div>

                {error && (
                  <div style={{
                    background: '#FEE2E2',
                    border: '1px solid #F87171',
                    borderRadius: '6px',
                    padding: '10px',
                    marginBottom: '10px',
                    fontSize: '12px',
                    color: '#991B1B',
                  }}>
                    {error}
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={isProcessing || !consent || !selectedDeliveryAddress || !selectedLegalEntity}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: 'none',
                    borderRadius: '8px',
                    background: (isProcessing || !consent || !selectedDeliveryAddress || !selectedLegalEntity) ? '#D1D5DB' : '#EC1C24',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: (isProcessing || !consent || !selectedDeliveryAddress || !selectedLegalEntity) ? 'not-allowed' : 'pointer',
                    fontFamily: 'Onest, sans-serif',
                    marginBottom: '10px',
                  }}
                >
                  {isProcessing ? 'Оформление...' : 'Оформить заказ'}
                </button>

                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '6px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  color: '#6B7280',
                  fontFamily: 'Onest, sans-serif',
                }}>
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    style={{
                      width: '16px',
                      height: '16px',
                      marginTop: '2px',
                      cursor: 'pointer',
                      accentColor: '#EC1C24',
                    }}
                  />
                  <span>
                    Соглашаюсь с{' '}
                    <a href="/confidentiality" style={{ color: '#EC1C24', textDecoration: 'none' }}>
                      условиями использования
                    </a>
                    {' '}сервиса
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Модалка выбора юрлица */}
      {showLegalEntityModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
        onClick={() => setShowLegalEntityModal(false)}
        >
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{
              margin: '0 0 20px 0',
              fontSize: '20px',
              fontWeight: 600,
              color: '#111827',
              fontFamily: 'Onest, sans-serif',
            }}>
              Выберите организацию
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {clientData?.clientMe?.legalEntities?.map((entity: any) => (
                <div
                  key={entity.id}
                  onClick={() => {
                    setSelectedLegalEntity(entity);
                    setShowLegalEntityModal(false);
                  }}
                  style={{
                    padding: '16px',
                    border: `2px solid ${selectedLegalEntity?.id === entity.id ? '#EC1C24' : '#E5E7EB'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: selectedLegalEntity?.id === entity.id ? '#FEF2F2' : '#fff',
                  }}
                >
                  <div style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#111827',
                    marginBottom: '4px',
                    fontFamily: 'Onest, sans-serif',
                  }}>
                    {entity.shortName || entity.fullName}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#6B7280',
                    fontFamily: 'Onest, sans-serif',
                  }}>
                    ИНН {entity.inn}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Модалка выбора адреса */}
      {showAddressModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
        onClick={() => setShowAddressModal(false)}
        >
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{
              margin: '0 0 20px 0',
              fontSize: '20px',
              fontWeight: 600,
              color: '#111827',
              fontFamily: 'Onest, sans-serif',
            }}>
              Выберите адрес доставки
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {addressesData?.clientMe?.deliveryAddresses?.map((address: any) => (
                <div
                  key={address.id}
                  onClick={() => {
                    setSelectedDeliveryAddress(address);
                    setShowAddressModal(false);
                  }}
                  style={{
                    padding: '16px',
                    border: `2px solid ${selectedDeliveryAddress?.id === address.id ? '#EC1C24' : '#E5E7EB'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: selectedDeliveryAddress?.id === address.id ? '#FEF2F2' : '#fff',
                  }}
                >
                  <div style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#111827',
                    marginBottom: '4px',
                    fontFamily: 'Onest, sans-serif',
                  }}>
                    {address.deliveryType === 'COURIER' ? 'Курьер' : 'Самовывоз'} - {address.name}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#6B7280',
                    fontFamily: 'Onest, sans-serif',
                  }}>
                    {address.address}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Модалка получателя */}
      {showRecipientModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
        onClick={() => setShowRecipientModal(false)}
        >
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{
              margin: '0 0 20px 0',
              fontSize: '20px',
              fontWeight: 600,
              color: '#111827',
              fontFamily: 'Onest, sans-serif',
            }}>
              Кто получит заказ
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '8px',
                fontFamily: 'Onest, sans-serif',
              }}>
                ФИО
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Например: Иванов Иван"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'Onest, sans-serif',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '8px',
                fontFamily: 'Onest, sans-serif',
              }}>
                Телефон
              </label>
              <input
                type="tel"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                placeholder="+7 961 117-72-05"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'Onest, sans-serif',
                  outline: 'none',
                }}
              />
            </div>

            <button
              onClick={() => setShowRecipientModal(false)}
              disabled={!recipientName.trim() || !recipientPhone.trim()}
              style={{
                width: '100%',
                padding: '12px',
                border: 'none',
                borderRadius: '8px',
                background: (!recipientName.trim() || !recipientPhone.trim()) ? '#D1D5DB' : '#EC1C24',
                color: '#fff',
                fontSize: '15px',
                fontWeight: 600,
                cursor: (!recipientName.trim() || !recipientPhone.trim()) ? 'not-allowed' : 'pointer',
                fontFamily: 'Onest, sans-serif',
              }}
            >
              Сохранить
            </button>
          </div>
        </div>
      )}

      {/* Модалка предупреждения о недостатке товара */}
      {showStockWarningModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          }}>
            {/* Заголовок с иконкой */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" stroke="#F59E0B" strokeWidth="2" />
                <path d="M12 8v4M12 16h.01" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <h3 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 600,
                color: '#111827',
                fontFamily: 'Onest, sans-serif',
              }}>
                Недостаточно товара на складе
              </h3>
            </div>

            {/* Список товаров с проблемами */}
            <div style={{
              marginBottom: '20px',
            }}>
              {stockWarningItems.map((item, index) => (
                <div key={index} style={{
                  background: '#FEF3C7',
                  border: '1px solid #FCD34D',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: index < stockWarningItems.length - 1 ? '8px' : '0',
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#92400E',
                    marginBottom: '6px',
                    fontFamily: 'Onest, sans-serif',
                  }}>
                    {item.name}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#78350F',
                    fontFamily: 'Onest, sans-serif',
                  }}>
                    В наличии: <strong>{item.available} шт.</strong> • Вы запросили: <strong>{item.requested} шт.</strong>
                  </div>
                </div>
              ))}
            </div>

            {/* Описание */}
            <p style={{
              margin: '0 0 20px 0',
              fontSize: '14px',
              color: '#6B7280',
              lineHeight: '1.5',
              fontFamily: 'Onest, sans-serif',
            }}>
              К сожалению, на складе недостаточно товара для выполнения вашего заказа. Вы можете оформить заказ с доступным количеством или вернуться в корзину для редактирования.
            </p>

            {/* Кнопки */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}>
              <button
                onClick={handleOrderWithAvailableQuantity}
                disabled={isProcessing}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: 'none',
                  borderRadius: '8px',
                  background: isProcessing ? '#D1D5DB' : '#059669',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  fontFamily: 'Onest, sans-serif',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!isProcessing) e.currentTarget.style.background = '#047857';
                }}
                onMouseLeave={(e) => {
                  if (!isProcessing) e.currentTarget.style.background = '#059669';
                }}
              >
                {isProcessing ? 'Оформление...' : 'Оформить с доступным количеством'}
              </button>
              <div style={{
                display: 'flex',
                gap: '10px',
              }}>
                <button
                  onClick={() => router.push('/cart')}
                  disabled={isProcessing}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: '1px solid #EC1C24',
                    borderRadius: '8px',
                    background: '#fff',
                    color: '#EC1C24',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    fontFamily: 'Onest, sans-serif',
                    transition: 'background 0.2s',
                    opacity: isProcessing ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!isProcessing) e.currentTarget.style.background = '#FEE2E2';
                  }}
                  onMouseLeave={(e) => {
                    if (!isProcessing) e.currentTarget.style.background = '#fff';
                  }}
                >
                  Вернуться в корзину
                </button>
                <button
                  onClick={() => {
                    setShowStockWarningModal(false);
                    setStockWarningItems([]);
                  }}
                  disabled={isProcessing}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    background: '#fff',
                    color: '#374151',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    fontFamily: 'Onest, sans-serif',
                    transition: 'background 0.2s',
                    opacity: isProcessing ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!isProcessing) e.currentTarget.style.background = '#F9FAFB';
                  }}
                  onMouseLeave={(e) => {
                    if (!isProcessing) e.currentTarget.style.background = '#fff';
                  }}
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="section-3">
        <CatalogSubscribe />
      </section>

      <Footer />
    </>
  );
}
