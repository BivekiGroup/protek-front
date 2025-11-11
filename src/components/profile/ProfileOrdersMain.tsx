import * as React from "react";
import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@apollo/client';
import toast from 'react-hot-toast';
import { GET_ORDERS, CANCEL_ORDER, REQUEST_ORDER_RETURN } from '@/lib/graphql';
import { useFavorites } from '@/contexts/FavoritesContext';

interface OrderItem {
  id: string;
  name: string;
  article?: string;
  brand?: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PROCESSING'
  | 'ASSEMBLING'
  | 'IN_DELIVERY'
  | 'AWAITING_PICKUP'
  | 'DELIVERED'
  | 'RETURN_REQUESTED'
  | 'CANCELED'
  | 'REFUNDED';

interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  currency: string;
  items: OrderItem[];
  deliveryAddress?: string | null;
  comment?: string | null;
  cancelReason?: string | null;
  canceledAt?: string | null;
  returnReason?: string | null;
  returnRequestedAt?: string | null;
  returnedAt?: string | null;
  paymentMethod?: string | null;
  invoiceUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ProfileOrdersMainProps {}

const tabs: Array<{ label: string; status: OrderStatus[] | null }> = [
  { label: "Все", status: null },
  { label: "Текущие", status: ['PENDING', 'PAID', 'PROCESSING', 'ASSEMBLING', 'IN_DELIVERY', 'AWAITING_PICKUP'] },
  { label: "Выполненные", status: ['DELIVERED'] },
  { label: "Возврат", status: ['RETURN_REQUESTED', 'REFUNDED'] },
  { label: "Отмененные", status: ['CANCELED'] }
];

const statusLabels: Record<OrderStatus, string> = {
  PENDING: 'Ожидает оплаты',
  PAID: 'Оплачен',
  PROCESSING: 'Обрабатывается',
  ASSEMBLING: 'На сборке',
  IN_DELIVERY: 'В доставке',
  AWAITING_PICKUP: 'Ждет выдачи',
  DELIVERED: 'Доставлен',
  RETURN_REQUESTED: 'Возврат запрошен',
  CANCELED: 'Отказ',
  REFUNDED: 'Возврат оформлен'
};

const statusColors: Record<OrderStatus, string> = {
  PENDING: '#F59E0B',
  PAID: '#10B981',
  PROCESSING: '#3B82F6',
  ASSEMBLING: '#6366F1',
  IN_DELIVERY: '#8B5CF6',
  AWAITING_PICKUP: '#14B8A6',
  DELIVERED: '#10B981',
  RETURN_REQUESTED: '#F97316',
  CANCELED: '#EF4444',
  REFUNDED: '#6B7280'
};

const clientCancelableStatuses: OrderStatus[] = ['PENDING', 'PAID', 'PROCESSING', 'ASSEMBLING'];

const formatPrice = (price: number, currency = 'RUB') =>
  `${price.toLocaleString('ru-RU')} ${currency === 'RUB' ? '₽' : currency}`;

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

const formatDateTime = (dateString: string) =>
  new Date(dateString).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

const ProfileOrdersMain: React.FC<ProfileOrdersMainProps> = () => {
  const router = useRouter();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const [activeTab, setActiveTab] = React.useState(0);
  const [search, setSearch] = React.useState("");
  const [clientId, setClientId] = React.useState<string | null>(null);
  const [actionDialog, setActionDialog] = React.useState<{ type: 'cancel' | 'return'; order: Order } | null>(null);
  const [actionReason, setActionReason] = React.useState('');
  const [pendingAction, setPendingAction] = React.useState<{ orderId: string; type: 'cancel' | 'return' } | null>(null);
  const [feedbackError, setFeedbackError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const userData = typeof window !== 'undefined' ? localStorage.getItem('userData') : null;
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setClientId(user.id);
      } catch (error) {
        console.error('Ошибка парсинга userData:', error);
      }
    }
  }, []);

  const { data, loading, error, refetch } = useQuery(GET_ORDERS, {
    variables: {
      clientId: clientId?.startsWith('client_') ? clientId.substring(7) : clientId,
      limit: 100,
      offset: 0
    },
    skip: !clientId,
    fetchPolicy: 'cache-and-network'
  });

  const [cancelOrderMutation, { loading: cancelLoading }] = useMutation(CANCEL_ORDER);
  const [requestOrderReturnMutation, { loading: returnLoading }] = useMutation(REQUEST_ORDER_RETURN);

  const orders: Order[] = data?.orders?.orders || [];

  const filteredOrdersByTab = React.useMemo(() => {
    const currentTab = tabs[activeTab];
    if (!currentTab.status) {
      return orders;
    }
    return orders.filter(order => currentTab.status!.includes(order.status));
  }, [orders, activeTab]);

  const filteredOrders = React.useMemo(() => {
    if (!search) return filteredOrdersByTab;
    const searchLower = search.toLowerCase();
    return filteredOrdersByTab.filter(order =>
      order.orderNumber.toLowerCase().includes(searchLower) ||
      order.items.some(item =>
        item.name.toLowerCase().includes(searchLower) ||
        item.article?.toLowerCase().includes(searchLower) ||
        item.brand?.toLowerCase().includes(searchLower)
      )
    );
  }, [filteredOrdersByTab, search]);

  const isSubmitting = cancelLoading || returnLoading;

  const openActionDialog = (type: 'cancel' | 'return', order: Order) => {
    setFeedbackError(null);
    setActionDialog({ type, order });
    setActionReason(type === 'return' ? order.returnReason || '' : order.cancelReason || '');
  };

  const closeActionDialog = () => {
    if (isSubmitting) return;
    setActionDialog(null);
    setActionReason('');
  };

  const handleConfirmAction = async () => {
    if (!actionDialog) return;
    setFeedbackError(null);
    setPendingAction({ orderId: actionDialog.order.id, type: actionDialog.type });
    try {
      if (actionDialog.type === 'cancel') {
        await cancelOrderMutation({
          variables: {
            id: actionDialog.order.id,
            reason: actionReason.trim() || null
          }
        });
        toast.success('Заказ отменён.');
      } else {
        await requestOrderReturnMutation({
          variables: {
            id: actionDialog.order.id,
            reason: actionReason.trim() || null
          }
        });
        toast.success('Запрос на возврат отправлен.');
      }
      setActionDialog(null);
      setActionReason('');
      await refetch();
    } catch (mutationError: any) {
      console.error('Ошибка при выполнении действия с заказом:', mutationError);
      const message = mutationError?.message || 'Не удалось выполнить действие. Попробуйте позже.';
      setFeedbackError(message);
      toast.error(message);
    } finally {
      setPendingAction(null);
    }
  };

  if (!clientId) {
    return (
      <div className="flex flex-col flex-1 shrink justify-center basis-0 min-w-[240px] max-md:max-w-full">
        <div className="text-center py-8">
          <p className="text-gray-500">Необходимо авторизоваться для просмотра заказов</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col flex-1 shrink justify-center basis-0 min-w-[240px] max-md:max-w-full">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Загрузка заказов...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col flex-1 shrink justify-center basis-0 min-w-[240px] max-md:max-w-full">
        <div className="text-center py-8">
          <p className="text-red-500">Ошибка загрузки заказов: {error.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-red-600 !text-white rounded hover:bg-red-700 transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 shrink justify-center basis-0 w-full max-md:max-w-full">
      <div className="flex flex-wrap gap-5 w-full whitespace-nowrap max-md:max-w-full">
        <div className="flex flex-wrap flex-1 shrink gap-5 self-start text-lg font-medium leading-tight text-center basis-[60px] min-w-[240px] text-gray-950 max-md:max-w-full">
          {tabs.map((tab, idx) => (
            <div
              key={tab.label}
              className={`flex flex-1 shrink gap-5 items-center h-full rounded-xl basis-0 text-[14px] ${activeTab === idx ? "bg-red-600 text-white" : "bg-slate-200 text-gray-950"}`}
              style={{ cursor: "pointer" }}
              onClick={() => setActiveTab(idx)}
            >
              <div
                className={`flex-1 shrink gap-5 self-stretch px-6 py-3.5 my-auto w-full rounded-xl basis-0 max-md:px-5 text-[14px] ${activeTab === idx ? "bg-red-600 text-white" : "bg-slate-200 text-gray-950"}`}
              >
                {tab.label}
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-1 shrink gap-5 items-center px-8 py-3 h-full text-base leading-snug text-gray-400 bg-white rounded-lg basis-0 max-w-[360px] min-w-[240px] max-md:px-5">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по заказам"
            className="flex-1 shrink self-stretch my-auto basis-0 text-ellipsis outline-none bg-transparent text-gray-950 placeholder:text-gray-400"
          />
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/c08da0aac46dcf126a2a1a0e5832e3b069cd2d94?placeholderIfAbsent=true&apiKey=f5bc5a2dc9b841d0aba1cc6c74a35920"
            className="object-contain shrink-0 self-stretch my-auto w-5 rounded-sm aspect-square"
          />
        </div>
      </div>

      <div className="flex overflow-hidden flex-col p-8 mt-5 w-full bg-white rounded-2xl max-md:px-5 max-md:max-w-full">
        <div className="text-3xl font-bold leading-none text-gray-950">{tabs[activeTab].label}</div>
        
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">
              {search ? 'Заказы не найдены' : 'У вас пока нет заказов'}
            </div>
            {!search && (
              <div className="text-gray-500 text-sm">
                Оформите первый заказ в нашем каталоге
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 mt-5">
            {filteredOrders.map((order) => {
              const canCancel = clientCancelableStatuses.includes(order.status);
              const canRequestReturn = order.status === 'DELIVERED';
              const canUpdateReturn = order.status === 'RETURN_REQUESTED';
              const isProcessingThisOrder = pendingAction?.orderId === order.id;

              return (
                <div key={order.id} className="flex flex-col justify-center px-5 py-8 w-full bg-white rounded-2xl border border-gray-200">
                  <div className="flex flex-col pr-7 pl-5 w-full max-md:pr-5 max-md:max-w-full">
                    <div className="flex flex-wrap gap-10 justify-between items-center w-full max-md:max-w-full">
                      <div className="flex gap-5 items-center self-stretch my-auto min-w-[240px]">
                        <div
                          className="gap-5 self-stretch px-6 py-3.5 my-auto text-sm font-medium leading-snug text-center text-white whitespace-nowrap rounded-xl max-md:px-5"
                          style={{ backgroundColor: statusColors[order.status] }}
                        >
                          {statusLabels[order.status]}
                        </div>
                        <div className="self-stretch my-auto text-xl font-semibold leading-tight text-gray-950">
                          Заказ {order.orderNumber} от {formatDate(order.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col mt-5 w-full max-md:max-w-full">
                    <div className="flex items-center pb-2.5 pl-2 pr-7 w-full text-sm text-gray-400 border-b border-solid border-b-stone-300 max-md:pr-5 max-md:max-w-full">
                      <div className="w-9 text-center shrink-0">№</div>
                      <div className="w-[130px] shrink-0 ml-5">Производитель</div>
                      <div className="w-[120px] shrink-0 ml-5">Артикул</div>
                      <div className="flex-1 ml-5 min-w-[240px]">Наименование</div>
                      <div className="w-[80px] text-center shrink-0 ml-5">Кол-во</div>
                      <div className="w-[110px] text-right shrink-0 ml-5">Стоимость</div>
                      <div className="w-[40px] shrink-0 ml-5"></div>
                    </div>

                    <div className="flex flex-col mt-1.5 w-full max-md:max-w-full">
                      {order.items.map((item, index) => {
                        const isItemFavorite = isFavorite(undefined, undefined, item.article, item.brand);

                        return (
                          <div
                            key={item.id}
                            className="flex items-center pt-1.5 pb-2 pl-2 pr-7 w-full rounded-lg max-md:pr-5 max-md:max-w-full cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => {
                              if (item.article && item.brand) {
                                router.push(`/search-result?article=${encodeURIComponent(item.article)}&brand=${encodeURIComponent(item.brand)}`);
                              }
                            }}
                            title={item.article && item.brand ? "Перейти к поиску товара" : ""}
                          >
                            <div className="w-9 text-sm leading-4 text-center text-black shrink-0">
                              {index + 1}
                            </div>
                            <div className="w-[130px] text-sm font-bold leading-snug text-gray-950 shrink-0 ml-5 truncate">
                              {item.brand || '-'}
                            </div>
                            <div className="w-[120px] text-sm font-bold leading-snug text-gray-950 shrink-0 ml-5 truncate">
                              {item.article || '-'}
                            </div>
                            <div className="flex-1 text-sm text-gray-400 ml-5 min-w-[240px] truncate">
                              {item.name}
                            </div>
                            <div className="w-[80px] text-sm text-gray-400 text-center shrink-0 ml-5">
                              {item.quantity} шт.
                            </div>
                            <div className="w-[110px] text-right shrink-0 ml-5">
                              <div className="text-sm font-bold leading-snug text-gray-950">
                                {formatPrice(item.totalPrice, order.currency)}
                              </div>
                            </div>
                            <div className="w-[40px] flex justify-center shrink-0 ml-5">
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (isItemFavorite) {
                                    // Найти и удалить из избранного
                                    await removeFromFavorites(item.id);
                                  } else {
                                    // Добавить в избранное
                                    await addToFavorites({
                                      name: item.name,
                                      brand: item.brand || '',
                                      article: item.article || '',
                                      price: item.price,
                                      currency: order.currency
                                    });
                                  }
                                }}
                                className="p-1 hover:scale-110 transition-transform"
                                title={isItemFavorite ? "Удалить из избранного" : "Добавить в избранное"}
                              >
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 30 30"
                                  fill={isItemFavorite ? "#EC1C24" : "none"}
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M15 25L13.405 23.5613C7.74 18.4714 4 15.1035 4 10.9946C4 7.6267 6.662 5 10.05 5C11.964 5 13.801 5.88283 15 7.26703C16.199 5.88283 18.036 5 19.95 5C23.338 5 26 7.6267 26 10.9946C26 15.1035 22.26 18.4714 16.595 23.5613L15 25Z"
                                    stroke={isItemFavorite ? "#EC1C24" : "#9CA3AF"}
                                    strokeWidth="2"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
                    <div className="text-right space-y-1">
                      <div className="text-sm text-gray-500">
                        Сумма товаров: {formatPrice(order.totalAmount, order.currency)}
                      </div>
                      {order.discountAmount > 0 && (
                        <div className="text-sm text-gray-500">
                          Скидка: -{formatPrice(order.discountAmount, order.currency)}
                        </div>
                      )}
                      <div className="text-lg font-bold text-gray-950">
                        Итого: {formatPrice(order.finalAmount, order.currency)}
                      </div>
                    </div>
                  </div>

                  {order.deliveryAddress && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-500 mb-1">Адрес доставки:</div>
                      <div className="text-sm text-gray-950">{order.deliveryAddress}</div>
                    </div>
                  )}

                  {order.comment && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-500 mb-1">Комментарий:</div>
                      <div className="text-sm text-gray-950 whitespace-pre-line">{order.comment}</div>
                    </div>
                  )}

                  {order.cancelReason && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-500 mb-1">Причина отмены:</div>
                      <div className="text-sm text-gray-950">{order.cancelReason}</div>
                      {order.canceledAt && (
                        <div className="text-xs text-gray-400 mt-1">от {formatDateTime(order.canceledAt)}</div>
                      )}
                    </div>
                  )}

                  {(order.returnReason || order.returnRequestedAt || order.returnedAt) && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-500 mb-1">Информация о возврате:</div>
                      {order.returnReason ? (
                        <div className="text-sm text-gray-950">{order.returnReason}</div>
                      ) : (
                        <div className="text-sm text-gray-950">Причина не указана</div>
                      )}
                      {order.returnRequestedAt && (
                        <div className="text-xs text-gray-400 mt-1">запрошен {formatDateTime(order.returnRequestedAt)}</div>
                      )}
                      {order.returnedAt && (
                        <div className="text-xs text-gray-400 mt-1">возврат оформлен {formatDateTime(order.returnedAt)}</div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 mt-6">
                    {order.paymentMethod === 'invoice' && (
                      <button
                        onClick={async () => {
                          try {
                            // Если есть готовый invoiceUrl, используем его напрямую
                            if (order.invoiceUrl) {
                              console.log('🔍 Opening existing invoice URL:', order.invoiceUrl);
                              window.open(order.invoiceUrl, '_blank');
                              return;
                            }

                            const userData = typeof window !== "undefined" ? window.localStorage.getItem("userData") : null;
                            console.log('🔍 userData from localStorage:', userData ? 'exists' : 'null');

                            if (!userData) {
                              alert('Необходимо авторизоваться для скачивания счёта');
                              return;
                            }

                            const parsedData = JSON.parse(userData);

                            // Создаем токен так же, как Apollo Client
                            const token = parsedData?.token || `client_${parsedData?.id}`;
                            console.log('🔍 token created:', token.substring(0, 20) + '...');

                            if (!token) {
                              alert('Токен авторизации не найден. Попробуйте войти заново.');
                              return;
                            }

                            // Иначе генерируем через API с токеном
                            const url = `${process.env.NEXT_PUBLIC_CMS_GRAPHQL_URL?.replace('/api/graphql', '')}/api/order-invoice/${order.id}`;
                            console.log('🔍 Fetching invoice from:', url);

                            const response = await fetch(url, {
                              headers: {
                                'Authorization': `Bearer ${token}`
                              }
                            });

                            console.log('🔍 Response status:', response.status);

                            if (!response.ok) {
                              const errorData = await response.text();
                              console.error('🔍 Error response:', errorData);
                              throw new Error(`Не удалось загрузить счёт: ${response.status}`);
                            }

                            // Получаем blob из ответа
                            const blob = await response.blob();
                            console.log('🔍 Blob size:', blob.size);

                            // Создаем временную ссылку для скачивания
                            const downloadUrl = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = downloadUrl;
                            a.download = `Счет_${order.orderNumber}.pdf`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            window.URL.revokeObjectURL(downloadUrl);

                            console.log('✅ Invoice downloaded successfully');
                          } catch (error) {
                            console.error('❌ Ошибка при скачивании счёта:', error);
                            alert('Не удалось скачать счёт. Попробуйте позже или обратитесь в поддержку.');
                          }
                        }}
                        className="inline-flex items-center px-4 py-2 rounded font-medium transition-colors"
                        style={{
                          backgroundColor: '#f59e0b',
                          color: '#ffffff',
                          textDecoration: 'none',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#d97706'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#f59e0b'
                        }}
                      >
                        <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#ffffff' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span style={{ color: '#ffffff' }}>Скачать счёт на оплату</span>
                      </button>
                    )}
                    {canCancel && (
                      <button
                        onClick={() => openActionDialog('cancel', order)}
                        className="px-4 py-2 bg-red-600 !text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                        disabled={isSubmitting || isProcessingThisOrder}
                      >
                        Отменить заказ
                      </button>
                    )}
                    {(canRequestReturn || canUpdateReturn) && (
                      <button
                        onClick={() => openActionDialog('return', order)}
                        className="px-4 py-2 bg-slate-200 text-gray-900 rounded hover:bg-slate-300 disabled:opacity-50 transition-colors"
                        disabled={isSubmitting || isProcessingThisOrder}
                      >
                        {canUpdateReturn ? 'Изменить заявку на возврат' : 'Оформить возврат'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {actionDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-gray-900">
              {actionDialog.type === 'cancel' ? 'Отмена заказа' : 'Запрос на возврат'}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {actionDialog.type === 'cancel'
                ? 'Укажите причину отмены заказа (необязательно).'
                : 'Укажите причину возврата, чтобы менеджер смог быстрее обработать запрос.'}
            </p>
            <textarea
              value={actionReason}
              onChange={(event) => setActionReason(event.target.value)}
              className="mt-4 w-full min-h-[120px] rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder={actionDialog.type === 'cancel' ? 'Например: хочу изменить заказ' : 'Например: деталь не подошла'}
            />
            {feedbackError && (
              <div className="mt-3 px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg">
                {feedbackError}
              </div>
            )}
            <div className="mt-6 flex flex-wrap gap-3 justify-end">
              <button
                onClick={closeActionDialog}
                className="px-4 py-2 bg-slate-200 text-gray-900 rounded hover:bg-slate-300 disabled:opacity-50"
                disabled={isSubmitting}
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmAction}
                className="px-4 py-2 bg-red-600 !text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting && pendingAction ? 'Сохраняем...' : 'Подтвердить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileOrdersMain;
