'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { CartState, CartContextType, CartItem, DeliveryInfo } from '@/types/cart'
import { ADD_TO_CART, REMOVE_FROM_CART, UPDATE_CART_ITEM_QUANTITY, UPDATE_CART_PRICES, CLEAR_CART, GET_CART } from '@/lib/graphql'
import { toast } from 'react-hot-toast'
import PriceChangeModal from '@/components/PriceChangeModal'

// Начальное состояние корзины
const initialState: CartState = {
  items: [],
  summary: {
    totalItems: 0,
    totalPrice: 0,
    totalDiscount: 0,
    deliveryPrice: 39,
    finalPrice: 0
  },
  delivery: {
    type: 'Доставка курьером',
    address: 'Калининградская область, Калиниград, улица Понартская, 5, кв./офис 1, Подъезд 1, этаж 1',
    price: 39
  },
  orderComment: '',
  isLoading: false
}

// Создаем контекст
const CartContext = createContext<CartContextType | undefined>(undefined)

// Утилитарная функция для парсинга количества в наличии
const parseStock = (stockStr: string | number | undefined): number | undefined => {
  if (stockStr === undefined || stockStr === null) return undefined
  if (typeof stockStr === 'number') return Number.isFinite(stockStr) ? stockStr : undefined
  if (typeof stockStr === 'string') {
    // Извлекаем числа из строки типа "10 шт" или "В наличии: 5"
    const match = stockStr.match(/\d+/)
    return match ? parseInt(match[0], 10) : undefined
  }
  return undefined
}

// Функция для преобразования backend cart items в frontend format
const transformBackendItems = (backendItems: any[]): CartItem[] => {
  return backendItems.map(item => ({
    id: item.id,
    productId: item.productId,
    offerKey: item.offerKey,
    name: item.name,
    description: item.description,
    brand: item.brand,
    article: item.article,
    price: item.price,
    currency: item.currency || 'RUB',
    quantity: item.quantity,
    stock: item.stock,
    deliveryTime: item.deliveryTime,
    warehouse: item.warehouse,
    supplier: item.supplier,
    isExternal: item.isExternal,
    image: item.image,
    selected: true,
    favorite: false,
    comment: ''
  }))
}

// Функция для подсчета статистики корзины
const calculateSummary = (items: CartItem[]) => {
  // Учитываем только выбранные товары (selected === true)
  const selectedItems = items.filter(item => item.selected)
  const totalItems = selectedItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const totalDiscount = 0 // TODO: Implement discount logic
  const deliveryPrice = 39
  const finalPrice = totalPrice + deliveryPrice - totalDiscount

  return {
    totalItems,
    totalPrice,
    totalDiscount,
    deliveryPrice,
    finalPrice
  }
}

// Провайдер контекста
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<CartState>(initialState)
  const [error, setError] = useState<string>('')
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false) // Флаг активного обновления цен
  const [priceChanges, setPriceChanges] = useState<any[]>([])
  const [showPriceChangeModal, setShowPriceChangeModal] = useState(false)

  // GraphQL operations
  const { data: cartData, loading: cartLoading, refetch: refetchCart } = useQuery(GET_CART, {
    errorPolicy: 'ignore' // Don't show errors for unauthenticated users
  })

  const [addToCartMutation] = useMutation(ADD_TO_CART)
  const [removeFromCartMutation] = useMutation(REMOVE_FROM_CART)
  const [updateQuantityMutation] = useMutation(UPDATE_CART_ITEM_QUANTITY)
  const [updatePricesMutation] = useMutation(UPDATE_CART_PRICES)
  const [clearCartMutation] = useMutation(CLEAR_CART)

  // Функция обновления цен (выделена в отдельную функцию для повторного использования)
  const updatePrices = async (showNotification = true) => {
    if (isUpdatingPrices || state.items.length === 0) return

    setIsUpdatingPrices(true)
    try {
      const { data } = await updatePricesMutation()

      if (data?.updateCartPrices?.success) {
        const changes = data.updateCartPrices.priceChanges

        // Обновляем состояние корзины
        if (data.updateCartPrices.cart) {
          const updatedItems = transformBackendItems(data.updateCartPrices.cart.items)

          setState(prev => {
            // Сохраняем состояние selected из предыдущих items
            const itemsWithPreservedSelection = updatedItems.map(updatedItem => {
              const existingItem = prev.items.find(prevItem => prevItem.id === updatedItem.id)
              return {
                ...updatedItem,
                selected: existingItem ? existingItem.selected : true
              }
            })

            const updatedSummary = calculateSummary(itemsWithPreservedSelection)

            return {
              ...prev,
              items: itemsWithPreservedSelection,
              summary: updatedSummary
            }
          })

          // Показываем модалку об изменении цен только если есть изменения и включены уведомления
          if (changes?.length > 0 && showNotification) {
            // Преобразуем изменения в формат для модалки
            const formattedChanges = changes.map((c: any) => {
              const item = updatedItems.find(i =>
                (i.article === c.article && i.brand === c.brand) ||
                i.offerKey === c.offerKey ||
                i.productId === c.productId
              )

              return {
                id: item?.id || `${c.article}-${c.brand}`,
                name: c.name || item?.name || 'Товар',
                brand: c.brand,
                article: c.article,
                image: item?.image,
                oldPrice: c.oldPrice,
                newPrice: c.newPrice,
                quantity: item?.quantity || 1
              }
            })

            setPriceChanges(formattedChanges)
            setShowPriceChangeModal(true)
          }
        }
      }
    } catch (err) {
      console.error('Ошибка обновления цен:', err)
    } finally {
      setIsUpdatingPrices(false)
    }
  }

  // Load cart from backend when component mounts or cart data changes
  useEffect(() => {
    if (cartData?.getCart) {
      const backendItems = transformBackendItems(cartData.getCart.items)

      setState(prev => {
        // Сохраняем состояние selected из предыдущих items
        const itemsWithPreservedSelection = backendItems.map(backendItem => {
          const existingItem = prev.items.find(prevItem => prevItem.id === backendItem.id)
          return {
            ...backendItem,
            selected: existingItem ? existingItem.selected : true
          }
        })

        const summary = calculateSummary(itemsWithPreservedSelection)

        return {
          ...prev,
          items: itemsWithPreservedSelection,
          summary,
          isLoading: false
        }
      })

      // Автоматически обновляем цены при первой загрузке корзины
      if (backendItems.length > 0) {
        updatePrices(true)
      }
    } else {
      setState(prev => ({
        ...prev,
        items: [],
        summary: calculateSummary([]),
        isLoading: false
      }))
    }
  }, [cartData])

  // Set loading state
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isLoading: cartLoading
    }))
  }, [cartLoading])

  // Периодическое обновление цен (каждые 2 минуты)
  useEffect(() => {
    if (state.items.length === 0) return

    // Устанавливаем интервал для автообновления цен
    const intervalId = setInterval(() => {
      console.log('🔄 Автообновление цен в корзине...')
      updatePrices(true) // Показываем уведомления при автообновлении
    }, 2 * 60 * 1000) // 2 минуты

    // Очищаем интервал при размонтировании или изменении зависимостей
    return () => {
      clearInterval(intervalId)
    }
  }, [state.items.length])

  // GraphQL-based cart operations
  const addItem = async (item: Omit<CartItem, 'id' | 'selected' | 'favorite'>) => {
    try {
      console.log('🛒 CartContext - addItem called with:', {
        offerKey: item.offerKey,
        productId: item.productId,
        article: item.article,
        brand: item.brand,
        price: item.price,
        supplier: item.supplier
      });

      const existingItem = state.items.find(existing => {
        // Строгое сравнение: offerKey должен совпадать ТОЛЬКО с offerKey
        const matchByOfferKey = item.offerKey && existing.offerKey && existing.offerKey === item.offerKey;

        // Строгое сравнение: productId должен совпадать ТОЛЬКО с productId
        const matchByProductId = item.productId && existing.productId && existing.productId === item.productId;

        console.log('🛒 CartContext - Checking against existing item:', {
          existingOfferKey: existing.offerKey,
          existingProductId: existing.productId,
          existingArticle: existing.article,
          existingBrand: existing.brand,
          existingSupplier: existing.supplier,
          itemOfferKey: item.offerKey,
          itemProductId: item.productId,
          matchByOfferKey,
          matchByProductId,
          willMatch: matchByOfferKey || matchByProductId
        });

        // Возвращаем true ТОЛЬКО если совпал offerKey или productId
        // Больше НЕТ fallback по article+brand!
        if (matchByOfferKey) return true;
        if (matchByProductId) return true;

        return false;
      })

      if (existingItem) {
        console.log('🛒 CartContext - Found existing item:', existingItem);
      } else {
        console.log('🛒 CartContext - No existing item found, will add as new');
      }

      const existingQuantity = existingItem?.quantity ?? 0
      const stockSource = item.stock ?? existingItem?.stock
      const availableStock = parseStock(stockSource)

      if (availableStock !== undefined) {
        if (availableStock <= 0) {
          const errorMessage = 'Товара нет в наличии'
          toast.error(errorMessage)
          setError('')
          return { success: false, error: errorMessage }
        }

        const totalRequested = existingQuantity + item.quantity
        if (totalRequested > availableStock) {
          const remaining = Math.max(availableStock - existingQuantity, 0)
          const errorMessage = remaining > 0
            ? `Можно добавить не более ${remaining} шт. этого товара`
            : 'В корзине уже максимальное количество этого товара'
          toast.error(errorMessage)
          setError('')
          return { success: false, error: errorMessage }
        }
      }

      setError('')
      setState(prev => ({ ...prev, isLoading: true }))

      console.log('🛒 Adding item to backend cart:', item)

      const { data, errors } = await addToCartMutation({
        variables: {
          input: {
            productId: item.productId || null,
            offerKey: item.offerKey || null,
            name: item.name,
            description: item.description,
            brand: item.brand,
            article: item.article,
            price: item.price,
            currency: item.currency || 'RUB',
            quantity: item.quantity,
            stock: item.stock || null,
            deliveryTime: item.deliveryTime || null,
            warehouse: item.warehouse || null,
            supplier: item.supplier || null,
            isExternal: item.isExternal || false,
            image: item.image || null
          }
        }
      })

      console.log('🛒 addToCart response:', { data, errors })

      if (errors && errors.length > 0) {
        const errorMessage = errors[0].message || 'GraphQL error'
        console.error('❌ GraphQL errors:', errors)
        toast.error(errorMessage)
        setError(errorMessage)
        setState(prev => ({ ...prev, isLoading: false }))
        return { success: false, error: errorMessage }
      }

      if (data?.addToCart?.success) {
        // Update local state with backend response
        if (data.addToCart.cart) {
          const backendItems = transformBackendItems(data.addToCart.cart.items)

          // Сохраняем оригинальный порядок товаров и состояние selected
          setState(prev => {
            const orderedItems = prev.items.map(existingItem => {
              const updatedItem = backendItems.find(backendItem => backendItem.id === existingItem.id)
              // Сохраняем selected из existingItem
              return updatedItem ? { ...updatedItem, selected: existingItem.selected } : existingItem
            })

            // Добавляем новые товары в конец списка
            const newItems = backendItems.filter(backendItem =>
              !prev.items.some(existingItem => existingItem.id === backendItem.id)
            )

            const finalItems = [...orderedItems, ...newItems]
            const summary = calculateSummary(finalItems)

            return {
              ...prev,
              items: finalItems,
              summary,
              isLoading: false
            }
          })
        }

        // НЕ вызываем refetchCart() чтобы не нарушить порядок товаров
        // refetchCart()

        return { success: true }
      } else {
        const errorMessage = data?.addToCart?.error || 'Ошибка добавления товара'
        toast.error(errorMessage)
        setError(errorMessage)
        setState(prev => ({ ...prev, isLoading: false }))
        return { success: false, error: errorMessage }
      }
    } catch (error) {
      console.error('❌ Error adding item to cart:', error)
      const errorMessage = 'Ошибка добавления товара в корзину'
      toast.error(errorMessage)
      setError(errorMessage)
      setState(prev => ({ ...prev, isLoading: false }))
      return { success: false, error: errorMessage }
    }
  }

  const removeItem = async (id: string, silent = false) => {
    try {
      setError('')
      setState(prev => ({ ...prev, isLoading: true }))

      console.log('🗑️ Removing item from backend cart:', id)

      const { data } = await removeFromCartMutation({
        variables: { itemId: id }
      })

      if (data?.removeFromCart?.success) {
        // Update local state
        if (data.removeFromCart.cart) {
          const backendItems = transformBackendItems(data.removeFromCart.cart.items)

          // Сохраняем оригинальный порядок товаров и состояние selected (удаленный товар просто не попадет в orderedItems)
          setState(prev => {
            const orderedItems = prev.items
              .map(existingItem => {
                const updatedItem = backendItems.find(backendItem => backendItem.id === existingItem.id)
                // Сохраняем selected из existingItem
                return updatedItem ? { ...updatedItem, selected: existingItem.selected } : null
              })
              .filter(item => item !== null) as CartItem[]

            const summary = calculateSummary(orderedItems)

            return {
              ...prev,
              items: orderedItems,
              summary,
              isLoading: false
            }
          })
        }

        if (!silent) {
          toast.success(data.removeFromCart.message || 'Товар удален из корзины')
        }
        // НЕ вызываем refetchCart() чтобы не нарушить порядок товаров
        // refetchCart()
      } else {
        const errorMessage = data?.removeFromCart?.error || 'Ошибка удаления товара'
        setError(errorMessage)
        setState(prev => ({ ...prev, isLoading: false }))
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('❌ Error removing item from cart:', error)
      const errorMessage = 'Ошибка удаления товара из корзины'
      setError(errorMessage)
      setState(prev => ({ ...prev, isLoading: false }))
      toast.error(errorMessage)
    }
  }

  const updateQuantity = async (id: string, quantity: number) => {
    try {
      if (quantity < 1) return

      const cartItem = state.items.find(item => item.id === id)
      if (!cartItem) return

      const availableStock = parseStock(cartItem.stock)
      if (availableStock !== undefined) {
        if (availableStock <= 0) {
          const errorMessage = 'Товара нет в наличии'
          toast.error(errorMessage)
          setError('')
          return
        }

        if (quantity > availableStock) {
          const cappedQuantity = Math.max(1, availableStock)
          const errorMessage = `Нельзя установить количество больше ${availableStock} шт.`
          toast.error(errorMessage)
          setError('')

          setState(prev => {
            const updatedItems = prev.items.map(item =>
              item.id === id ? { ...item, quantity: cappedQuantity } : item
            )
            return {
              ...prev,
              items: updatedItems,
              summary: calculateSummary(updatedItems)
            }
          })
          return
        }
      }

      setError('')
      setState(prev => ({ ...prev, isLoading: true }))

      console.log('📝 Updating item quantity in backend cart:', id, quantity)

      const { data } = await updateQuantityMutation({
        variables: { itemId: id, quantity }
      })

      if (data?.updateCartItemQuantity?.success) {
        // Update local state
        if (data.updateCartItemQuantity.cart) {
          const backendItems = transformBackendItems(data.updateCartItemQuantity.cart.items)

          // Сохраняем оригинальный порядок товаров и состояние selected
          setState(prev => {
            const orderedItems = prev.items.map(existingItem => {
              const updatedItem = backendItems.find(backendItem => backendItem.id === existingItem.id)
              // Сохраняем selected из existingItem
              return updatedItem ? { ...updatedItem, selected: existingItem.selected } : existingItem
            })

            // Добавляем новые товары, которых не было в старом списке (если backend добавил что-то)
            const newItems = backendItems.filter(backendItem =>
              !prev.items.some(existingItem => existingItem.id === backendItem.id)
            )

            const finalItems = [...orderedItems, ...newItems]
            const summary = calculateSummary(finalItems)

            return {
              ...prev,
              items: finalItems,
              summary,
              isLoading: false
            }
          })
        }

        toast.success(data.updateCartItemQuantity.message || 'Количество обновлено')
        // НЕ вызываем refetchCart() чтобы не нарушить порядок товаров
        // refetchCart()
      } else {
        const errorMessage = data?.updateCartItemQuantity?.error || 'Ошибка обновления количества'
        setError(errorMessage)
        setState(prev => ({ ...prev, isLoading: false }))
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('❌ Error updating item quantity:', error)
      const errorMessage = 'Ошибка обновления количества товара'
      setError(errorMessage)
      setState(prev => ({ ...prev, isLoading: false }))
      toast.error(errorMessage)
    }
  }

  const clearCart = async () => {
    try {
      setError('')
      setState(prev => ({ ...prev, isLoading: true }))

      console.log('🧹 Clearing backend cart')

      const { data } = await clearCartMutation()

      if (data?.clearCart?.success) {
        setState(prev => ({
          ...prev,
          items: [],
          summary: calculateSummary([]),
          isLoading: false
        }))

        toast.success(data.clearCart.message || 'Корзина очищена')
        // НЕ вызываем refetchCart() чтобы не нарушить порядок товаров
        // refetchCart()
      } else {
        const errorMessage = data?.clearCart?.error || 'Ошибка очистки корзины'
        setError(errorMessage)
        setState(prev => ({ ...prev, isLoading: false }))
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('❌ Error clearing cart:', error)
      const errorMessage = 'Ошибка очистки корзины'
      setError(errorMessage)
      setState(prev => ({ ...prev, isLoading: false }))
      toast.error(errorMessage)
    }
  }

  // Local-only operations (not synced with backend)
  const toggleSelect = (id: string) => {
    setState(prev => {
      const updatedItems = prev.items.map(item =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
      return {
        ...prev,
        items: updatedItems,
        summary: calculateSummary(updatedItems)
      }
    })
  }

  const toggleFavorite = (id: string) => {
    setState(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id ? { ...item, favorite: !item.favorite } : item
      )
    }))
  }

  const updateComment = (id: string, comment: string) => {
    setState(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id ? { ...item, comment } : item
      )
    }))
  }

  const updateOrderComment = (comment: string) => {
    setState(prev => ({
      ...prev,
      orderComment: comment
    }))
  }

  const selectAll = () => {
    setState(prev => {
      const allSelected = prev.items.length > 0 && prev.items.every(item => item.selected);
      const updatedItems = prev.items.map(item => ({ ...item, selected: !allSelected }))
      return {
        ...prev,
        items: updatedItems,
        summary: calculateSummary(updatedItems)
      };
    });
  };

  const removeAll = () => {
    clearCart()
  }

  const removeSelected = async () => {
    const selectedItems = state.items.filter(item => item.selected)
    if (selectedItems.length === 0) return

    // Удаляем все выбранные товары одновременно с подавлением индивидуальных тостов
    await Promise.all(selectedItems.map(item => removeItem(item.id, true)))

    // Показываем один общий тост после удаления всех товаров
    toast.success(`Удалено товаров: ${selectedItems.length}`)
  }

  const updateDelivery = (delivery: Partial<DeliveryInfo>) => {
    setState(prev => ({
      ...prev,
      delivery: { ...prev.delivery, ...delivery }
    }))
  }

  const clearError = () => {
    setError('')
  }

  // Check if item is in cart (using backend data)
  const isInCart = (productId?: string, offerKey?: string, article?: string, brand?: string): boolean => {
    return state.items.some(item => {
      if (productId && item.productId === productId) return true
      if (offerKey && item.offerKey === offerKey) return true
      if (article && brand && item.article === article && item.brand === brand) return true
      return false
    })
  }

  const contextValue: CartContextType = {
    state: {
      ...state,
      error,
      isUpdatingPrices
    },
    addItem,
    removeItem,
    updateQuantity,
    toggleSelect,
    toggleFavorite,
    updateComment,
    updateOrderComment,
    selectAll,
    removeAll,
    removeSelected,
    updateDelivery,
    clearCart,
    clearError,
    isInCart,
    updatePrices
  }

  return (
    <CartContext.Provider value={contextValue}>
      {children}
      {showPriceChangeModal && priceChanges.length > 0 && (
        <PriceChangeModal
          changes={priceChanges}
          onClose={() => {
            setShowPriceChangeModal(false)
            setPriceChanges([])
          }}
          onConfirm={() => {
            setShowPriceChangeModal(false)
            setPriceChanges([])
            toast.success('Цены обновлены в корзине')
          }}
        />
      )}
    </CartContext.Provider>
  )
}

// Хук для использования контекста корзины
export const useCart = (): CartContextType => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart должен использоваться внутри CartProvider')
  }
  return context
} 
