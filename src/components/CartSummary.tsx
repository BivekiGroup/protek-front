import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_ORDER, CREATE_PAYMENT, GET_CLIENT_ME, GET_CLIENT_DELIVERY_ADDRESSES } from "@/lib/graphql";
import toast from "react-hot-toast";

interface CartSummaryProps {
  step: number;
  setStep: (step: number) => void;
}

const CartSummary: React.FC<CartSummaryProps> = ({ step, setStep }) => {
  const { state, updateDelivery, updateOrderComment, clearCart } = useCart();
  const { summary, delivery, items, orderComment } = state;
  const legalEntityDropdownRef = useRef<HTMLDivElement>(null);
  const addressDropdownRef = useRef<HTMLDivElement>(null);
  const paymentDropdownRef = useRef<HTMLDivElement>(null);
  
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAuthWarning, setShowAuthWarning] = useState(false);
  
  // Новые состояния для первого шага
  const [selectedLegalEntity, setSelectedLegalEntity] = useState<string>("");
  const [selectedLegalEntityId, setSelectedLegalEntityId] = useState<string>("");
  const [isIndividual, setIsIndividual] = useState(true); // true = физ лицо, false = юр лицо
  const [showLegalEntityDropdown, setShowLegalEntityDropdown] = useState(false);
  const [selectedDeliveryAddress, setSelectedDeliveryAddress] = useState<string>("");
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);

  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  
  // Новые состояния для способа оплаты
  const [paymentMethod, setPaymentMethod] = useState<string>("yookassa");
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);
  
  // Упрощенный тип доставки - только курьер или самовывоз
  // const [deliveryType, setDeliveryType] = useState<'courier' | 'pickup'>('courier');

  const [createOrder] = useMutation(CREATE_ORDER);
  const [createPayment] = useMutation(CREATE_PAYMENT);
  // Убираем useMutation для GET_DELIVERY_OFFERS

  // Получаем данные клиента
  const { data: clientData, loading: clientLoading } = useQuery(GET_CLIENT_ME);
  const { data: addressesData, loading: addressesLoading } = useQuery(GET_CLIENT_DELIVERY_ADDRESSES);

  // Получаем пользователя из localStorage для проверки авторизации
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        setUserData(JSON.parse(storedUserData));
      }
    }
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
          setIsIndividual(state.isIndividual ?? true);
          setSelectedDeliveryAddress(state.selectedDeliveryAddress || '');
          setRecipientName(state.recipientName || '');
          setRecipientPhone(state.recipientPhone || '');
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
        paymentMethod,
        consent
      };
      localStorage.setItem('cartSummaryState', JSON.stringify(stateToSave));
    }
  }, [step, selectedLegalEntity, selectedLegalEntityId, isIndividual, selectedDeliveryAddress, recipientName, recipientPhone, paymentMethod, consent]);

  // Инициализация данных получателя
  useEffect(() => {
    if (clientData?.clientMe && !recipientName && !recipientPhone) {
      setRecipientName(clientData.clientMe.name || '');
      setRecipientPhone(clientData.clientMe.phone || '');
    }
  }, [clientData, recipientName, recipientPhone]);

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
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProceedToStep2 = () => {
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
    const userData = typeof window !== 'undefined' ? localStorage.getItem('userData') : null;
    if (!userData) {
      setError("Для оформления заказа необходимо войти в систему.");
      setShowAuthWarning(true);
      return;
    }

    setIsProcessing(true);
    setError("");
    setShowAuthWarning(false);

    try {
      const user = JSON.parse(userData);
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
            legalEntityId: !isIndividual ? selectedLegalEntityId : null,
            paymentMethod: paymentMethod,
            comment: orderComment || `Адрес доставки: ${selectedDeliveryAddress}. ${!isIndividual && selectedLegalEntity ? `Юридическое лицо: ${selectedLegalEntity}.` : 'Физическое лицо.'} Способ оплаты: ${getPaymentMethodName(paymentMethod)}. Доставка: ${selectedDeliveryAddress}.`,
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
                {isIndividual ? 'Физическое лицо' : selectedLegalEntity || 'Выберите юридическое лицо'}
              </div>
              <div className="code-embed w-embed" style={{ transform: showLegalEntityDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                <svg width="14" height="9" viewBox="0 0 14 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="2"></path>
                </svg>
              </div>
            </div>
            
            {/* Dropdown список типов клиента */}
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
                {/* Опция физического лица */}
                <div
                  onClick={() => {
                    setIsIndividual(true);
                    setSelectedLegalEntity('');
                    setSelectedLegalEntityId('');
                    setPaymentMethod('yookassa'); // Для физ лица только ЮКасса
                    setShowLegalEntityDropdown(false);
                  }}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f0f0f0',
                    backgroundColor: isIndividual ? '#f8f9fa' : 'white',
                    fontSize: '14px',
                    
                  }}
                  onMouseEnter={(e) => {
                    if (!isIndividual) {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isIndividual) {
                      e.currentTarget.style.backgroundColor = 'white';
                    }
                  }}
                >
                  Физическое лицо
                </div>

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
                    // Переход в личный кабинет на страницу адресов
                    window.location.href = '/profile-addresses';
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