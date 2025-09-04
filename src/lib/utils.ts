// Утилиты для проекта

// Простая утилита для дебага запросов
let requestCounter = 0;
export const debugQuery = (queryName: string, variables?: any) => {
  requestCounter++;
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔍 GraphQL Query #${requestCounter}: ${queryName}`, variables);
  }
  return requestCounter;
};

// Утилита для дебага рендеров компонентов
export const debugRender = (componentName: string, props?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🎨 Render: ${componentName}`, props);
  }
};

// Утилита для отслеживания производительности
export const measurePerformance = (label: string, fn: () => void) => {
  if (process.env.NODE_ENV === 'development') {
    console.time(label);
    fn();
    console.timeEnd(label);
  } else {
    fn();
  }
};

// Debounce функция для оптимизации запросов
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle функция для ограничения частоты выполнения
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Кэш для мемоизации результатов
const memoCache = new Map<string, any>();

// Простая мемоизация функций
export const memoize = <T extends (...args: any[]) => any>(
  func: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T => {
  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    if (memoCache.has(key)) {
      return memoCache.get(key);
    }
    
    const result = func(...args);
    memoCache.set(key, result);
    
    // Ограничиваем размер кэша
    if (memoCache.size > 1000) {
      const firstKey = memoCache.keys().next().value;
      if (firstKey !== undefined) {
        memoCache.delete(firstKey);
      }
    }
    
    return result;
  }) as T;
};

// Очистка кэша мемоизации
export const clearMemoCache = () => {
  memoCache.clear();
};

// Проверка, является ли строка датой доставки
export const isDeliveryDate = (dateString: string): boolean => {
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];
  
  return months.some(month => dateString.includes(month));
}; 

// ---- Analytics emitters ----
export async function emitAnalyticsSearch(payload: {
  query: string
  brand?: string
  article?: string
  filters?: unknown
  resultsCount?: number
}) {
  try {
    const cmsGraphql = process.env.NEXT_PUBLIC_CMS_GRAPHQL_URL || 'http://localhost:3000/api/graphql'
    const url = cmsGraphql.replace(/\/api\/graphql.*/, '/api/analytics/search')
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload })
    })
  } catch {}
}

export async function emitAnalyticsView(payload: {
  productId?: string
  offerKey?: string
  article?: string
  brand?: string
  referrer?: string
}) {
  try {
    const cmsGraphql = process.env.NEXT_PUBLIC_CMS_GRAPHQL_URL || 'http://localhost:3000/api/graphql'
    const url = cmsGraphql.replace(/\/api\/graphql.*/, '/api/analytics/view')
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, referrer: payload.referrer || (typeof document !== 'undefined' ? document.referrer : undefined) })
    })
  } catch {}
}