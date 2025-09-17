'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import toast from 'react-hot-toast'
import { GET_FAVORITES, ADD_TO_FAVORITES, REMOVE_FROM_FAVORITES, CLEAR_FAVORITES } from '@/lib/favorites-queries'
import CloseIcon from '@/components/CloseIcon'

// Типы
export interface FavoriteItem {
  id: string
  clientId: string
  productId?: string
  offerKey?: string
  name: string
  brand: string
  article: string
  price?: number
  currency?: string
  image?: string
  createdAt: string
}

export interface FavoriteInput {
  productId?: string
  offerKey?: string
  name: string
  brand: string
  article: string
  price?: number
  currency?: string
  image?: string
}

interface FavoritesState {
  items: FavoriteItem[]
  loading: boolean
  error: string | null
}

interface FavoritesContextType {
  favorites: FavoriteItem[]
  loading: boolean
  error: string | null
  addToFavorites: (item: FavoriteInput) => Promise<void>
  removeFromFavorites: (id: string) => Promise<void>
  clearFavorites: () => Promise<void>
  isFavorite: (productId?: string, offerKey?: string, article?: string, brand?: string) => boolean
}

// Reducer
type FavoritesAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FAVORITES'; payload: FavoriteItem[] }
  | { type: 'ADD_FAVORITE'; payload: FavoriteItem }
  | { type: 'REMOVE_FAVORITE'; payload: string }
  | { type: 'CLEAR_FAVORITES' }

const favoritesReducer = (state: FavoritesState, action: FavoritesAction): FavoritesState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'SET_FAVORITES':
      return { ...state, items: action.payload, loading: false, error: null }
    case 'ADD_FAVORITE':
      return { 
        ...state, 
        items: [action.payload, ...state.items.filter(item => item.id !== action.payload.id)],
        loading: false,
        error: null
      }
    case 'REMOVE_FAVORITE':
      return { 
        ...state, 
        items: state.items.filter(item => item.id !== action.payload),
        loading: false,
        error: null
      }
    case 'CLEAR_FAVORITES':
      return { ...state, items: [], loading: false, error: null }
    default:
      return state
  }
}

const initialState: FavoritesState = {
  items: [],
  loading: false,
  error: null,
}

// Контекст
const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

// Провайдер
interface FavoritesProviderProps {
  children: ReactNode
}

const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(favoritesReducer, initialState)

  // Запрос на получение избранного
  const { data, loading, error, refetch } = useQuery(GET_FAVORITES, {
    errorPolicy: 'all',
    onCompleted: (data) => {
      if (data?.favorites) {
        dispatch({ type: 'SET_FAVORITES', payload: data.favorites })
      }
    },
    onError: (error) => {
      console.error('Ошибка загрузки избранного:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message })
    }
  })

  // GraphQL мутации с toast уведомлениями
  const [addFavoriteMutation] = useMutation(ADD_TO_FAVORITES, {
    errorPolicy: 'all'
  })

  const [removeFavoriteMutation] = useMutation(REMOVE_FROM_FAVORITES, {
    errorPolicy: 'all'
  })

  const [clearFavoritesMutation] = useMutation(CLEAR_FAVORITES, {
    errorPolicy: 'all'
  })

  // Методы для работы с избранным
  const addToFavorites = async (item: FavoriteInput) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const result = await addFavoriteMutation({
        variables: { input: item }
      })

      const graphError = result.errors?.[0]?.message
      if (graphError) {
        const message = graphError.includes('авторизоваться')
          ? 'Авторизуйтесь, чтобы добавлять товары в избранное'
          : graphError
        toast.error(message)
        dispatch({ type: 'SET_ERROR', payload: message })
        return
      }

      if (result.data?.addToFavorites) {
        dispatch({ type: 'ADD_FAVORITE', payload: result.data.addToFavorites })
        dispatch({ type: 'SET_ERROR', payload: null })
        toast.success('Товар добавлен в избранное')
      }
    } catch (error) {
      console.error('Ошибка добавления в избранное:', error)
      toast.error('Ошибка добавления в избранное')
      dispatch({ type: 'SET_ERROR', payload: 'Ошибка добавления в избранное' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const removeFromFavorites = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const result = await removeFavoriteMutation({
        variables: { id }
      })

      const graphError = result.errors?.[0]?.message
      if (graphError) {
        const message = graphError.includes('авторизоваться')
          ? 'Авторизуйтесь, чтобы управлять избранным'
          : graphError
        toast.error(message)
        dispatch({ type: 'SET_ERROR', payload: message })
        return
      }

      dispatch({ type: 'REMOVE_FAVORITE', payload: id })
      dispatch({ type: 'SET_ERROR', payload: null })
      toast('Товар удален из избранного', {
        icon: <CloseIcon size={20} color="#fff" />,
        style: {
          background: '#6b7280',
          color: '#fff',
        },
        duration: 3000,
      })
    } catch (error) {
      console.error('Ошибка удаления из избранного:', error)
      toast.error('Ошибка удаления из избранного')
      dispatch({ type: 'SET_ERROR', payload: 'Ошибка удаления из избранного' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const clearFavorites = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const result = await clearFavoritesMutation()

      const graphError = result.errors?.[0]?.message
      if (graphError) {
        const message = graphError.includes('авторизоваться')
          ? 'Авторизуйтесь, чтобы управлять избранным'
          : graphError
        toast.error(message)
        dispatch({ type: 'SET_ERROR', payload: message })
        return
      }

      dispatch({ type: 'CLEAR_FAVORITES' })
      dispatch({ type: 'SET_ERROR', payload: null })
      toast.success('Избранное очищено')
    } catch (error) {
      console.error('Ошибка очистки избранного:', error)
      toast.error('Ошибка очистки избранного')
      dispatch({ type: 'SET_ERROR', payload: 'Ошибка очистки избранного' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const isFavorite = (productId?: string, offerKey?: string, article?: string, brand?: string): boolean => {
    return state.items.some(item => {
      // Проверяем по разным комбинациям идентификаторов
      if (productId && item.productId === productId) return true
      if (offerKey && item.offerKey === offerKey) return true
      if (article && brand && item.article === article && item.brand === brand) return true
      return false
    })
  }

  const value: FavoritesContextType = {
    favorites: state.items,
    loading: state.loading || loading,
    error: state.error || error?.message || null,
    addToFavorites,
    removeFromFavorites,
    clearFavorites,
    isFavorite,
  }

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}

// Хук для использования контекста
export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}

export { FavoritesProvider } 
