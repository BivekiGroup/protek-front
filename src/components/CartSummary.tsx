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

interface CartSummaryProps {
  step: number;
  setStep: (step: number) => void;
}

const CartSummary: React.FC<CartSummaryProps> = ({ step, setStep }) => {
  const router = useRouter();
  const { state, updateDelivery, updateOrderComment, clearCart, updatePrices } = useCart();
  const { summary, delivery, items, orderComment } = state;
  const legalEntityDropdownRef = useRef<HTMLDivElement>(null);
  const addressDropdownRef = useRef<HTMLDivElement>(null);
  const paymentDropdownRef = useRef<HTMLDivElement>(null);
  const deliveryTimeDropdownRef = useRef<HTMLDivElement>(null);

  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAuthWarning, setShowAuthWarning] = useState(false);
  
  // Новые состояния для первого шага
  const [selectedLegalEntity, setSelectedLegalEntity] = useState<string>("");
  const [selectedLegalEntityId, setSelectedLegalEntityId] = useState<string>("");
  const [isIndividual, setIsIndividual] = useState(false); // только юр лицо
  const [showLegalEntityDropdown, setShowLegalEntityDropdown] = useState(false);
  const [selectedDeliveryAddress, setSelectedDeliveryAddress] = useState<string>("");
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);

  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");

  // Желаемое время доставки
  const [selectedDeliveryTime, setSelectedDeliveryTime] = useState<string>("");
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);

  // Новые состояния для способа оплаты
  const [paymentMethod, setPaymentMethod] = useState<string>("yookassa");
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);
  
  // Упрощенный тип доставки - только курьер или самовывоз
  // const [deliveryType, setDeliveryType] = useState<'courier' | 'pickup'>('courier');

  const [createOrder] = useMutation(CREATE_ORDER);
  const [createPayment] = useMutation(CREATE_PAYMENT);
  // Убираем useMutation для GET_DELIVERY_OFFERS

  const { openAuthPrompt } = useAuthPrompt();
  const [storedUserData, setStoredUserData] = useState<any>(null);
  const isAuthenticated = Boolean(storedUserData);

  // Получаем данные клиента
  const { data: clientData, loading: clientLoading } = useQuery(GET_CLIENT_ME, {
    skip: !isAuthenticated
  });
  const { data: addressesData, loading: addressesLoading } = useQuery(GET_CLIENT_DELIVERY_ADDRESSES, {
    skip: !isAuthenticated
  });

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

  // Загрузка состояния компонента из localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCartSummaryState = localStorage.getItem('cartSummaryState');
      if (savedCartSummaryState) {
        try {
          const state = JSON.parse(savedCartSummaryState);
          setStep(state.step || 1);
          setSelectedLegalEntity(state.selectedLegalEntity || '');
          setSelectedLegalEntityId(state.selectedLegalEntityId || '');
          setIsIndividual(false);
          setSelectedDeliveryAddress(state.selectedDeliveryAddress || '');
          setRecipientName(state.recipientName || '');
          setRecipientPhone(state.recipientPhone || '');
          setSelectedDeliveryTime(state.selectedDeliveryTime || '');
          setPaymentMethod(state.paymentMethod || 'yookassa');
          setConsent(state.consent || false);
        } catch (error) {
          console.error('Ошибка загрузки состояния CartSummary:', error);
        }
      }
    }
  }, []);

  // Сохранение состояния компонента в localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stateToSave = {
        step,
        selectedLegalEntity,
        selectedLegalEntityId,
        isIndividual,
        selectedDeliveryAddress,
        recipientName,
        recipientPhone,
        selectedDeliveryTime,
        paymentMethod,
        consent
      };
      localStorage.setItem('cartSummaryState', JSON.stringify(stateToSave));
    }
  }, [step, selectedLegalEntity, selectedLegalEntityId, isIndividual, selectedDeliveryAddress, recipientName, recipientPhone, selectedDeliveryTime, paymentMethod, consent]);

  // Инициализация данных получателя
  useEffect(() => {
    if (clientData?.clientMe && !recipientName && !recipientPhone) {
      setRecipientName(clientData.clientMe.name || '');
      setRecipientPhone(clientData.clientMe.phone || '');
    }
  }, [clientData, recipientName, recipientPhone]);

  // Автоматический выбор адреса после добавления/редактирования из личного кабинета
  useEffect(() => {
    const newAddressId = router.query.newAddressId as string;

    if (newAddressId && addressesData?.clientMe?.deliveryAddresses) {
      // Находим адрес по ID
      const newAddress = addressesData.clientMe.deliveryAddresses.find(
        (addr: any) => addr.id === newAddressId
      );

      if (newAddress) {
        // Автоматически выбираем новый/обновленный адрес
        setSelectedDeliveryAddress(newAddress.address);
        updateDelivery({ address: newAddress.address });

        // Показываем уведомление
        toast.success('Адрес обновлен');

        // Очищаем параметр из URL
        const { newAddressId: _, ...restQuery } = router.query;
        router.replace(
          {
            pathname: router.pathname,
            query: restQuery,
          },
          undefined,
          { shallow: true }
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.newAddressId, addressesData]);

  // Закрытие dropdown при клике вне их
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Проверяем клик вне дропдауна типа лица
      if (legalEntityDropdownRef.current && !legalEntityDropdownRef.current.contains(event.target as Node)) {
        setShowLegalEntityDropdown(false);
      }

      // Проверяем клик вне дропдауна адресов
      if (addressDropdownRef.current && !addressDropdownRef.current.contains(event.target as Node)) {
        setShowAddressDropdown(false);
      }

      // Проверяем клик вне дропдауна способов оплаты
      if (paymentDropdownRef.current && !paymentDropdownRef.current.contains(event.target as Node)) {
        setShowPaymentDropdown(false);
      }

      // Проверяем клик вне дропдауна времени доставки
      if (deliveryTimeDropdownRef.current && !deliveryTimeDropdownRef.current.contains(event.target as Node)) {
        setIsTimeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProceedToStep2 = async () => {
    if (!recipientName.trim()) {
      toast.error('Пожалуйста, введите имя получателя');
      return;
    }
    if (!recipientPhone.trim()) {
      toast.error('Пожалуйста, введите телефон получателя');
      return;
    }
    if (!selectedDeliveryAddress.trim()) {
      toast.error('Пожалуйста, выберите адрес доставки');
      return;
    }

    // Проверяем и обновляем цены перед переходом на следующий шаг
    console.log('🔍 Проверка актуальности цен перед оформлением заказа...');
    await updatePrices(true);

    updateDelivery({
      address: selectedDeliveryAddress,
      cost: 0,
      date: 'Включена в стоимость товаров',
      time: 'Способ доставки указан в адресе'
    });
    setStep(2);
  };

  const handleBackToStep1 = () => {
    setStep(1);
  };

  const handleSubmit = async () => {
    if (!recipientName.trim() || !recipientPhone.trim() || !consent) {
      setError("Пожалуйста, заполните данные получателя и согласитесь с правилами.");
      return;
    }

    // Проверяем авторизацию
    if (!storedUserData) {
      setError("Для оформления заказа необходимо войти в систему.");
      setShowAuthWarning(true);
      return;
    }

    setIsProcessing(true);
    setError("");
    setShowAuthWarning(false);

    try {
      // Проверяем и обновляем цены перед созданием заказа
      console.log('🔍 Финальная проверка актуальности цен перед оплатой...');
      await updatePrices(true);
      const user = storedUserData;
      const selectedItems = items.filter(item => item.selected);

      // Создаем заказ с clientId для авторизованных пользователей
      const orderResult = await createOrder({
        variables: {
          input: {
            clientId: user.id,
            clientEmail: user.email || '',
            clientPhone: recipientPhone,
            clientName: recipientName,
            deliveryAddress: selectedDeliveryAddress || delivery.address,
            deliveryTime: selectedDeliveryTime || null,
            legalEntityId: selectedLegalEntityId || null,
            paymentMethod: paymentMethod,
            comment: orderComment || `Адрес доставки: ${selectedDeliveryAddress}. ${selectedDeliveryTime ? `Желаемое время: ${selectedDeliveryTime}. ` : ''}${selectedLegalEntity ? `Юридическое лицо: ${selectedLegalEntity}. ` : ''}Способ оплаты: ${getPaymentMethodName(paymentMethod)}. Доставка: ${selectedDeliveryAddress}.`,
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

      // Обрабатываем разные способы оплаты
      if (paymentMethod === 'balance') {
        // Для оплаты с баланса - заказ уже оплачен, переходим на страницу успеха
        clearCart();
        // Очищаем сохраненное состояние оформления заказа
        if (typeof window !== 'undefined') {
          localStorage.removeItem('cartSummaryState');
        }
        window.location.href = `/payment/success?orderId=${order.id}&orderNumber=${order.orderNumber}&paymentMethod=balance`;
      } else {
        // Для ЮКассы - создаем платеж и переходим на оплату
        const paymentResult = await createPayment({
          variables: {
            input: {
              orderId: order.id,
              returnUrl: `${window.location.origin}/payment/success?orderId=${order.id}&orderNumber=${order.orderNumber}`,
              description: `Оплата заказа №${order.orderNumber}`
            }
          }
        });

        const payment = paymentResult.data?.createPayment;
        if (!payment?.confirmationUrl) {
          throw new Error('Не удалось создать платеж');
        }

        // Очищаем корзину и переходим на оплату
        clearCart();
        // Очищаем сохраненное состояние оформления заказа
        if (typeof window !== 'undefined') {
          localStorage.removeItem('cartSummaryState');
        }
        window.location.href = payment.confirmationUrl;
      }

    } catch (error) {
      console.error('Ошибка при создании заказа:', error);
      setError(error instanceof Error ? error.message : 'Произошла ошибка при оформлении заказа');
    } finally {
      setIsProcessing(false);
    }
  };

  // Функция для форматирования цены
  const formatPrice = (price: number) => {
    return `${price.toLocaleString('ru-RU')} ₽`;
  };

  // Функция для получения названия способа оплаты
  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'yookassa':
        return 'ЮКасса (банковские карты)';
      case 'balance':
        return 'Оплата с баланса';
      default:
        return 'ЮКасса (банковские карты)';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="w-layout-vflex cart-ditail">
        <div className="cart-detail-info">
          <div
            className="w-layout-vflex flex-block-58"
            style={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '10px',
              padding: '20px',
              background: '#000000',
              color: '#fff',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: '-32px',
                left: '163px',
                width: '194px',
                height: '194px',
                background: 'rgba(236, 28, 36, 0.6)',
                filter: 'blur(100px)',
                borderRadius: '50%',
                pointerEvents: 'none'
              }}
            />
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <span style={{ 
                fontSize: '14px', 
                letterSpacing: '0.12em', 
                textTransform: 'uppercase', 
                color: '#B7CAE2', 
                fontWeight: 600,
                fontFamily: 'Onest, sans-serif',
                lineHeight: 1.275
              }}>
                Только для юрлиц
              </span>
              <h3 style={{ 
                margin: 0, 
                fontSize: '20px', 
                lineHeight: 1.275, 
                fontWeight: 700,
                fontFamily: 'Onest, sans-serif',
                height: '52px',
                color: '#FFFFFF'
              }}>
                Авторизируйте для оформления заказа
              </h3>
              <p style={{ 
                margin: 0, 
                fontSize: '12px', 
                lineHeight: 1.275, 
                color: '#FFFFFF',
                fontWeight: 400,
                fontFamily: 'Onest, sans-serif',
                height: '30px'
              }}>
                Заказы доступны только зарегистрированным пользователям
              </p>
              <button
                type="button"
                onClick={() => openAuthPrompt({ targetPath: '/cart' })}
                style={{
                  background: '#EC1C24',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  alignSelf: 'flex-start',
                  fontFamily: 'Onest, sans-serif',
                  lineHeight: 1.3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.66797 11.3327L10.0013 7.99935L6.66797 4.66602" stroke="white" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 8H2" stroke="white" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 2H12.6667C13.0203 2 13.3594 2.14048 13.6095 2.39052C13.8595 2.64057 14 2.97971 14 3.33333V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H10" stroke="white" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Войти
              </button>
            </div>
          </div>

          <div className="px-line"></div>

          <div className="w-layout-vflex flex-block-60">
            <div className="w-layout-hflex flex-block-59">
              <div style={{ 
                color: '#8893A1', 
                fontSize: '14px', 
                fontWeight: 400, 
                fontFamily: 'Onest, sans-serif',
                lineHeight: 1.275
              }}>
                Товары, {summary.totalItems} шт.
              </div>
              <div style={{ 
                color: '#000814', 
                fontSize: '16px', 
                fontWeight: 600, 
                fontFamily: 'Onest, sans-serif',
                lineHeight: 1.4
              }}>
                {formatPrice(summary.totalPrice)}
              </div>
            </div>
            <div className="w-layout-hflex flex-block-59">
              <div style={{ 
                color: '#8893A1', 
                fontSize: '14px', 
                fontWeight: 400, 
                fontFamily: 'Onest, sans-serif',
                lineHeight: 1.275
              }}>
                Доставка
              </div>
              <div style={{ 
                color: '#000000ff', 
                fontSize: '16px', 
                fontWeight: 600, 
                fontFamily: 'Onest, sans-serif',
                lineHeight: 1.4
              }}>
                Включена в стоимость
              </div>
            </div>
          </div>

          <div className="px-line"></div>

          <div className="w-layout-hflex flex-block-59" style={{ alignItems: 'center', gap: '24px' }}>
            <div style={{ 
              color: '#000814', 
              fontSize: '16px', 
              fontWeight: 400, 
              fontFamily: 'Onest, sans-serif',
              lineHeight: 1.4
            }}>
              Итого
            </div>
            <h4 style={{ 
              margin: 0,
              color: '#000814', 
              fontSize: '18px', 
              fontWeight: 600, 
              fontFamily: 'Onest, sans-serif',
              lineHeight: 1.2
            }}>
              {formatPrice(summary.totalPrice || 0)}
            </h4>
          </div>

          <button
            type="button"
            disabled
            style={{
              background: '#CBD5E3',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              padding: '14px 40px',
              fontSize: '16px',
              fontWeight: 600,
              fontFamily: 'Onest, sans-serif',
              lineHeight: 1.2,
              cursor: 'not-allowed',
              width: '100%',
              textAlign: 'center',
           
            }}
          >
            Оформить заказ
          </button>

          <div className="w-layout-hflex privacy-consent" style={{ cursor: 'pointer' }} onClick={() => setConsent((v) => !v)}>
            <div
              className={"div-block-7" + (consent ? " active" : "")}
              style={{ marginRight: 8, cursor: 'pointer' }}
            >
              {consent && (
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                  <path d="M2 5.5L6 9L12 2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: '#8893A1', 
              fontWeight: 400, 
              fontFamily: 'Onest, sans-serif',
              lineHeight: 1.4,
              paddingTop: '2px'
            }}>
              Соглашаюсь с правилами пользования торговой площадкой и возврата
            </div>
          </div>

        </div>
      </div>
    );
  }

  if (step === 1) {
    // Первый шаг - настройка доставки
    return (
      <div className="w-layout-vflex cart-ditail">
        <div className="cart-detail-info">
          {/* Тип клиента - показываем всегда */}
          <div className="w-layout-vflex flex-block-58" style={{ position: 'relative' }} ref={legalEntityDropdownRef}>
            <div className="text-block-31">Тип клиента</div>
            <div 
              className="w-layout-hflex flex-block-62" 
              onClick={() => setShowLegalEntityDropdown(!showLegalEntityDropdown)}
              style={{ cursor: 'pointer', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div className="text-block-31" style={{ fontSize: '14px', color: '#333' }}>
                {selectedLegalEntity || 'Выберите юридическое лицо'}
              </div>
              <div className="code-embed w-embed" style={{ transform: showLegalEntityDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                <svg width="14" height="9" viewBox="0 0 14 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="2"></path>
                </svg>
              </div>
            </div>
            
            {/* Dropdown список типов клиента (только юр. лица) */}
            {showLegalEntityDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                zIndex: 1000,
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {/* Юридические лица (если есть) */}
                {clientData?.clientMe?.legalEntities && clientData.clientMe.legalEntities.length > 0 && 
                  clientData.clientMe.legalEntities.map((entity: any, index: number) => (
                    <div
                      key={entity.id}
                      onClick={() => {
                        setIsIndividual(false);
                        setSelectedLegalEntity(entity.shortName || entity.fullName);
                        setSelectedLegalEntityId(entity.id);
                        setPaymentMethod('yookassa'); // По умолчанию ЮКасса для юр лица
                        setShowLegalEntityDropdown(false);
                      }}
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        borderBottom: index < clientData.clientMe.legalEntities.length - 1 ? '1px solid #f0f0f0' : 'none',
                        backgroundColor: !isIndividual && (entity.shortName || entity.fullName) === selectedLegalEntity ? '#f8f9fa' : 'white',
                        fontSize: '14px'
                      }}
                      onMouseEnter={(e) => {
                        if (isIndividual || (entity.shortName || entity.fullName) !== selectedLegalEntity) {
                          e.currentTarget.style.backgroundColor = '#f8f9fa';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (isIndividual || (entity.shortName || entity.fullName) !== selectedLegalEntity) {
                          e.currentTarget.style.backgroundColor = 'white';
                        }
                      }}
                    >
                      {entity.shortName || entity.fullName}
                    </div>
                  ))
                }
              </div>
            )}
          </div>

          {/* Адрес доставки */}
          <div className="w-layout-vflex flex-block-58" style={{ position: 'relative' }} ref={addressDropdownRef}>
            <div className="text-block-31">Адрес доставки</div>
            <div 
              className="w-layout-hflex flex-block-62" 
              onClick={() => setShowAddressDropdown(!showAddressDropdown)}
              style={{ cursor: 'pointer', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div className="text-block-31" style={{ fontSize: '14px', color: selectedDeliveryAddress ? '#333' : '#999' }}>
                {selectedDeliveryAddress || 'Выберите адрес доставки'}
              </div>
              <div className="code-embed w-embed" style={{ transform: showAddressDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                <svg width="14" height="9" viewBox="0 0 14 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="2"></path>
                </svg>
              </div>
            </div>
            
            {/* Dropdown список адресов */}
            {showAddressDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                zIndex: 1000,
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {/* Кнопка добавления нового адреса */}
                <div
                  onClick={() => {
                    // Переход в личный кабинет на страницу адресов с возвратом в корзину
                    const back = encodeURIComponent('/cart')
                    window.location.href = `/profile-addresses?returnTo=${back}`;
                    setShowAddressDropdown(false);
                  }}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    backgroundColor: '#f8f9fa',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#007bff',
                    borderBottom: '1px solid #dee2e6'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#e3f2fd';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                >
                  + Добавить новый адрес
                </div>

                {/* Существующие адреса */}
                {addressesData?.clientMe?.deliveryAddresses?.map((address: any, index: number) => (
                  <div
                    key={address.id}
                                      onClick={() => {
                    setSelectedDeliveryAddress(address.address);
                    setShowAddressDropdown(false);
                    // Обновляем адрес в контексте корзины
                    updateDelivery({ address: address.address });
                  }}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderBottom: index < (addressesData?.clientMe?.deliveryAddresses?.length || 0) - 1 ? '1px solid #f0f0f0' : 'none',
                      backgroundColor: address.address === selectedDeliveryAddress ? '#f8f9fa' : 'white',
                      fontSize: '14px'
                    }}
                    onMouseEnter={(e) => {
                      if (address.address !== selectedDeliveryAddress) {
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (address.address !== selectedDeliveryAddress) {
                        e.currentTarget.style.backgroundColor = 'white';
                      }
                    }}
                  >
                    <div style={{ fontWeight: 500, marginBottom: '4px' }}>
                      {address.name || address.deliveryType}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {address.address}
                    </div>
                  </div>
                )) || (
                  <div style={{
                    padding: '12px 16px',
                    fontSize: '14px',
                    color: '#666',
                    textAlign: 'center'
                  }}>
                    Нет сохранённых адресов
                  </div>
                )}
              </div>
            )}

            {/* Показываем выбранный адрес */}
            {selectedDeliveryAddress && (
              <div className="text-block-32" style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
                {selectedDeliveryAddress}
              </div>
            )}
          </div>

          {/* Способ оплаты */}
          <div className="w-layout-vflex flex-block-58" style={{ position: 'relative' }} ref={paymentDropdownRef}>
            <div className="text-block-31">Способ оплаты</div>
            <div 
              className="w-layout-hflex flex-block-62" 
              onClick={() => setShowPaymentDropdown(!showPaymentDropdown)}
              style={{ cursor: 'pointer', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div className="text-block-31" style={{ fontSize: '14px', color: '#333' }}>
                {getPaymentMethodName(paymentMethod)}
              </div>
              <div className="code-embed w-embed" style={{ transform: showPaymentDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                <svg width="14" height="9" viewBox="0 0 14 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="2"></path>
                </svg>
              </div>
            </div>
            
            {/* Dropdown список способов оплаты */}
            {showPaymentDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                zIndex: 1000,
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {/* ЮКасса - доступна всегда */}
                <div
                  onClick={() => {
                    setPaymentMethod('yookassa');
                    setShowPaymentDropdown(false);
                  }}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f0f0f0',
                    backgroundColor: paymentMethod === 'yookassa' ? '#f8f9fa' : 'white',
                    fontSize: '14px',
                    fontWeight: paymentMethod === 'yookassa' ? 500 : 400,
                    color: '#222'
                  }}
                  onMouseEnter={(e) => {
                    if (paymentMethod !== 'yookassa') {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (paymentMethod !== 'yookassa') {
                      e.currentTarget.style.backgroundColor = 'white';
                    }
                  }}
                >
                  ЮКасса (банковские карты)
                </div>

                {/* Дополнительные способы оплаты для юридических лиц */}
                {!isIndividual && (
                  <>
                    <div
                      onClick={() => {
                        setPaymentMethod('balance');
                        setShowPaymentDropdown(false);
                      }}
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #f0f0f0',
                        backgroundColor: paymentMethod === 'balance' ? '#f8f9fa' : 'white',
                        fontSize: '14px'
                      }}
                      onMouseEnter={(e) => {
                        if (paymentMethod !== 'balance') {
                          e.currentTarget.style.backgroundColor = '#f8f9fa';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (paymentMethod !== 'balance') {
                          e.currentTarget.style.backgroundColor = 'white';
                        }
                      }}
                    >
                      <div>Оплата с баланса</div>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                        {(() => {
                          if (clientLoading) {
                            return (
                              <span style={{ fontWeight: 500, color: '#666' }}>
                                Загрузка...
                              </span>
                            );
                          }
                          
                          if (!clientData?.clientMe) {
                            return (
                              <span style={{ fontWeight: 500, color: '#e74c3c' }}>
                                Ошибка загрузки данных
                              </span>
                            );
                          }
                          
                          const activeContracts = clientData?.clientMe?.contracts?.filter((contract: any) => contract.isActive) || [];
                          const defaultContract = activeContracts.find((contract: any) => contract.isDefault) || activeContracts[0];
                          
                          if (!defaultContract) {
                            return (
                              <span style={{ color: '#EF4444', fontWeight: 500 }}>
                                Активный договор не найден
                              </span>
                            );
                          }
                          
                          const balance = defaultContract.balance || 0;
                          const creditLimit = defaultContract.creditLimit || 0;
                          const totalAvailable = balance + creditLimit;
                          
                          return (
                            <span style={{ fontWeight: 500 }}>
                              Доступно: {formatPrice(totalAvailable)}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="px-line"></div>

          {/* Сводка заказа */}
          <div className="w-layout-vflex flex-block-60">
            <div className="w-layout-hflex flex-block-59">
              <div className="text-block-21-copy-copy">
                Товары, {summary.totalItems} шт.
              </div>
              <div className="text-block-33">{formatPrice(summary.totalPrice)}</div>
            </div>
            {summary.totalDiscount > 0 && (
              <div className="w-layout-hflex flex-block-59">
                <div className="text-block-21-copy-copy">Моя скидка</div>
                <div className="text-block-33">-{formatPrice(summary.totalDiscount)}</div>
              </div>
            )}
            <div className="w-layout-hflex flex-block-59">
              <div className="text-block-21-copy-copy">Доставка</div>
              <div className="text-block-33">
                Включена в стоимость товаров
              </div>
            </div>
          </div>

          <div className="px-line"></div>

          <div className="w-layout-hflex flex-block-59">
            <div className="text-block-32">Итого</div>
            <h4 className="heading-9-copy-copy">
              {formatPrice(summary.totalPrice - summary.totalDiscount)}
            </h4>
          </div>

          <button 
            className="submit-button fill w-button" 
            onClick={handleProceedToStep2}
            disabled={summary.totalItems === 0 || !consent}
            style={{ 
              opacity: summary.totalItems === 0 || !consent ? 0.5 : 1,
              cursor: summary.totalItems === 0 || !consent ? 'not-allowed' : 'pointer'
            }}
          >
            Оформить заказ
          </button>

          {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}

          <div className="w-layout-hflex privacy-consent" style={{ cursor: 'pointer' }} onClick={() => setConsent((v) => !v)}>
            <div
              className={"div-block-7" + (consent ? " active" : "")}
              style={{ marginRight: 8, cursor: 'pointer' }}
            >
              {consent && (
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                  <path d="M2 5.5L6 9L12 2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <div className="consent-text">Соглашаюсь с правилами пользования торговой площадкой и возврата</div>
          </div>
        </div>
      </div>
    );
  }

  // Второй шаг - подтверждение и оплата
  return (
    <div className="w-layout-vflex cart-ditail">
      <div className="cart-detail-info">
        {/* Адрес доставки */}
        <div className="w-layout-vflex flex-block-58">
          <div className="text-block-31">Адрес доставки</div>
          <div className="w-layout-hflex flex-block-57">
            <h4 className="heading-12">Доставка</h4>
            <div className="link-r" onClick={handleBackToStep1} style={{ cursor: 'pointer' }}>Изменить</div>
          </div>
          <div className="text-block-32">{selectedDeliveryAddress || delivery.address}</div>
        </div>

        {/* Желаемое время доставки */}
        <div className="w-layout-vflex flex-block-58" style={{ position: 'relative' }} ref={deliveryTimeDropdownRef}>
          <div className="text-block-31">Желаемое время доставки</div>
          <div
            className="w-layout-hflex flex-block-62"
            onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
            style={{ cursor: 'pointer', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div className="text-block-31" style={{ fontSize: '14px', color: selectedDeliveryTime ? '#333' : '#999' }}>
              {selectedDeliveryTime || 'Выберите время'}
            </div>
            <div className="code-embed w-embed" style={{ transform: isTimeDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
              <svg width="14" height="9" viewBox="0 0 14 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="2"></path>
              </svg>
            </div>
          </div>

          {/* Dropdown список времени */}
          {isTimeDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: '#fff',
              border: '1px solid #ddd',
              borderRadius: '8px',
              marginTop: '4px',
              zIndex: 100,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden'
            }}>
              {TIME_SLOTS.map(slot => (
                <div
                  key={slot}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    borderBottom: '1px solid #f0f0f0',
                    transition: 'background 0.2s',
                    background: slot === selectedDeliveryTime ? '#f8f9fa' : 'transparent'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDeliveryTime(slot);
                    setIsTimeDropdownOpen(false);
                  }}
                  onMouseEnter={(e) => {
                    if (slot !== selectedDeliveryTime) {
                      e.currentTarget.style.background = '#f8f9fa';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (slot !== selectedDeliveryTime) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {slot}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Получатель */}
        <div className="w-layout-vflex flex-block-63">
          <h4 className="heading-12">Получатель</h4>
          <div className="w-layout-hflex flex-block-62" style={{ marginBottom: '8px' }}>
            <input
              type="text"
              placeholder="Имя и фамилия"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: 'none',
                outline: 'none',
                boxShadow: 'none',
              }}
            />
          </div>
          <div className="w-layout-hflex flex-block-62">
            <input
              type="tel"
              placeholder="Номер телефона"
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: 'none',
                outline: 'none',
                boxShadow: 'none',
              }}
            />
          </div>
        </div>

        {/* Тип клиента и способ оплаты */}
        <div className="w-layout-vflex flex-block-58">
          <div className="text-block-31">Тип клиента и оплата</div>
          <div className="w-layout-hflex flex-block-57">
            <h4 className="heading-12">
              {isIndividual ? 'Физическое лицо' : selectedLegalEntity}
            </h4>
            <div className="link-r" onClick={handleBackToStep1} style={{ cursor: 'pointer' }}>Изменить</div>
          </div>
          <div className="text-block-32" style={{ fontSize: '14px', color: '#666' }}>
            Способ оплаты: {getPaymentMethodName(paymentMethod)}
          </div>
          {paymentMethod === 'balance' && !isIndividual && (
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              {(() => {
                const activeContracts = clientData?.clientMe?.contracts?.filter((contract: any) => contract.isActive) || [];
                const defaultContract = activeContracts.find((contract: any) => contract.isDefault) || activeContracts[0];
                
                if (!defaultContract) {
                  return (
                    <span style={{ color: '#EF4444', fontWeight: 500 }}>
                      Активный договор не найден
                    </span>
                  );
                }
                
                const balance = defaultContract.balance || 0;
                const creditLimit = defaultContract.creditLimit || 0;
                const totalAvailable = balance + creditLimit;
                
                return (
                  <span style={{ fontWeight: 500 }}>
                    Доступно: {formatPrice(totalAvailable)}
                  </span>
                );
              })()}
            </div>
          )}
        </div>

        {/* Комментарий к заказу */}
        <div className="w-layout-vflex flex-block-58">
          <div className="text-block-31">Комментарий к заказу</div>
          <textarea
            value={orderComment}
            onChange={(e) => updateOrderComment(e.target.value)}
            placeholder="Добавьте комментарий к заказу (необязательно)"
            className="text-block-32"
            style={{
              width: '100%',
              minHeight: '60px',
              padding: '8px 12px',
              border: '1px solid #D0D0D0',
              borderRadius: '4px',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none'
            }}
          />
        </div>

        <div className="px-line"></div>

        {/* Сводка заказа */}
        <div className="w-layout-vflex flex-block-60">
          <div className="w-layout-hflex flex-block-59">
            <div className="text-block-21-copy-copy">
              Товары, {summary.totalItems} шт.
            </div>
            <div className="text-block-33">{formatPrice(summary.totalPrice)}</div>
          </div>
          {summary.totalDiscount > 0 && (
            <div className="w-layout-hflex flex-block-59">
              <div className="text-block-21-copy-copy">Моя скидка</div>
              <div className="text-block-33">-{formatPrice(summary.totalDiscount)}</div>
            </div>
          )}
          <div className="w-layout-hflex flex-block-59">
            <div className="text-block-21-copy-copy">Доставка</div>
            <div className="text-block-33">
              Включена в стоимость товаров
            </div>
          </div>
        </div>

        <div className="px-line"></div>

        <div className="w-layout-hflex flex-block-59">
          <div className="text-block-32">Итого</div>
          <h4 className="heading-9-copy-copy">
            {formatPrice(summary.totalPrice - summary.totalDiscount)}
          </h4>
        </div>
        
        {showAuthWarning && (
          <div style={{ 
            backgroundColor: '#FEF3C7', 
            border: '1px solid #F59E0B', 
            borderRadius: '8px', 
            padding: '12px', 
            marginBottom: '16px',
            color: '#92400E'
          }}>
            <div style={{ fontWeight: 600, marginBottom: '8px' }}>
              Требуется авторизация
            </div>
            <div style={{ fontSize: '14px', marginBottom: '12px' }}>
              Для оформления заказа необходимо войти в систему или зарегистрироваться
            </div>
            <button 
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{
                backgroundColor: '#F59E0B',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              Войти в систему
            </button>
          </div>
        )}
        
        <button 
          className="submit-button fill w-button" 
          onClick={handleSubmit}
          disabled={summary.totalItems === 0 || isProcessing || !recipientName.trim() || !recipientPhone.trim() || !consent}
          style={{ 
            opacity: (summary.totalItems === 0 || isProcessing || !recipientName.trim() || !recipientPhone.trim() || !consent) ? 0.5 : 1,
            cursor: (summary.totalItems === 0 || isProcessing || !recipientName.trim() || !recipientPhone.trim() || !consent) ? 'not-allowed' : 'pointer'
          }}
        >
          {isProcessing ? 'Оформляем заказ...' : 
            paymentMethod === 'balance' ? 'Оплатить с баланса' :
            'Оплатить'}
        </button>

        {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}

        {/* Кнопка "Назад" */}
        <button 
          onClick={handleBackToStep1}
          style={{
            background: 'none',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '12px 24px',
            marginTop: '12px',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#666'
          }}
        >
          ← Назад к настройкам доставки
        </button>

        <div className="w-layout-hflex privacy-consent" style={{ cursor: 'pointer' }} onClick={() => setConsent((v) => !v)}>
          <div
            className={"div-block-7" + (consent ? " active" : "")}
            style={{ marginRight: 8, cursor: 'pointer' }}
          >
            {consent && (
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                <path d="M2 5.5L6 9L12 2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <div className="consent-text">Соглашаюсь с правилами пользования торговой площадкой и возврата</div>
        </div>
      </div>
    </div>
  );
};

export default CartSummary; 
