'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { CartState, CartContextType, CartItem, DeliveryInfo } from '@/types/cart'
import { ADD_TO_CART, REMOVE_FROM_CART, UPDATE_CART_ITEM_QUANTITY, CLEAR_CART, GET_CART } from '@/lib/graphql'
import { toast } from 'react-hot-toast'

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
const parseStock = (stockStr: string | number | undefined): number => {
  if (stockStr === undefined || stockStr === null) return 0
  if (typeof stockStr === 'number') return stockStr
  if (typeof stockStr === 'string') {
    // Извлекаем числа из строки типа "10 шт" или "В наличии: 5"
    const match = stockStr.match(/\d+/)
    return match ? parseInt(match[0], 10) : 0
  }
  return 0
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
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
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

  // GraphQL operations
  const { data: cartData, loading: cartLoading, refetch: refetchCart } = useQuery(GET_CART, {
    errorPolicy: 'ignore' // Don't show errors for unauthenticated users
  })

  const [addToCartMutation] = useMutation(ADD_TO_CART)
  const [removeFromCartMutation] = useMutation(REMOVE_FROM_CART)
  const [updateQuantityMutation] = useMutation(UPDATE_CART_ITEM_QUANTITY)
  const [clearCartMutation] = useMutation(CLEAR_CART)

  // Load cart from backend when component mounts or cart data changes
  useEffect(() => {
    if (cartData?.getCart) {
      const backendItems = transformBackendItems(cartData.getCart.items)
      const summary = calculateSummary(backendItems)
      
      setState(prev => ({
        ...prev,
        items: backendItems,
        summary,
        isLoading: false
      }))
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

  // GraphQL-based cart operations
  const addItem = async (item: Omit<CartItem, 'id' | 'selected' | 'favorite'>) => {
    try {
      setError('')
      setState(prev => ({ ...prev, isLoading: true }))

      console.log('🛒 Adding item to backend cart:', item)

      const { data } = await addToCartMutation({
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

      if (data?.addToCart?.success) {
        // Update local state with backend response
        if (data.addToCart.cart) {
          const backendItems = transformBackendItems(data.addToCart.cart.items)
          const summary = calculateSummary(backendItems)
          
          setState(prev => ({
            ...prev,
            items: backendItems,
            summary,
            isLoading: false
          }))
        }

  
        
        // Refetch to ensure data consistency
        refetchCart()
        
        return { success: true }
      } else {
        const errorMessage = data?.addToCart?.error || 'Ошибка добавления товара'
        setError(errorMessage)
        setState(prev => ({ ...prev, isLoading: false }))
        toast.error(errorMessage)
        return { success: false, error: errorMessage }
      }
    } catch (error) {
      console.error('❌ Error adding item to cart:', error)
      const errorMessage = 'Ошибка добавления товара в корзину'
      setError(errorMessage)
      setState(prev => ({ ...prev, isLoading: false }))
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const removeItem = async (id: string) => {
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
          const summary = calculateSummary(backendItems)
          
          setState(prev => ({
            ...prev,
            items: backendItems,
            summary,
            isLoading: false
          }))
        }

        toast.success(data.removeFromCart.message || 'Товар удален из корзины')
        refetchCart()
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
          const summary = calculateSummary(backendItems)
          
          setState(prev => ({
            ...prev,
            items: backendItems,
            summary,
            isLoading: false
          }))
        }

        toast.success(data.updateCartItemQuantity.message || 'Количество обновлено')
        refetchCart()
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
        refetchCart()
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
    setState(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    }))
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
    setState(prev => ({
      ...prev,
      items: prev.items.map(item => ({ ...item, selected: true }))
    }))
  }

  const removeAll = () => {
    clearCart()
  }

  const removeSelected = async () => {
    const selectedItems = state.items.filter(item => item.selected)
    for (const item of selectedItems) {
      await removeItem(item.id)
    }
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
      error
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
    isInCart
  }

  return (
    <CartContext.Provider value={contextValue}>
      {children}
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