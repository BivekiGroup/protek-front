import { useEffect } from 'react';
import { ApolloError } from '@apollo/client';
import { emitAuthChanged } from '@/lib/authEvents';

/**
 * Hook для обработки ошибок авторизации
 * Автоматически разлогинивает пользователя при получении ошибки CLIENT_NOT_FOUND
 */
export function useAuthErrorHandler(error: ApolloError | undefined) {
  useEffect(() => {
    if (!error) return;

    console.log('useAuthErrorHandler: получена ошибка', error);
    console.log('useAuthErrorHandler: graphQLErrors', error.graphQLErrors);

    // Проверяем, содержит ли ошибка CLIENT_NOT_FOUND
    const hasClientNotFoundError = error.graphQLErrors.some(
      (err) => {
        console.log('useAuthErrorHandler: проверка ошибки:', err.message);
        return err.message === 'CLIENT_NOT_FOUND';
      }
    );

    console.log('useAuthErrorHandler: hasClientNotFoundError =', hasClientNotFoundError);

    if (hasClientNotFoundError) {
      console.log('✅ useAuthErrorHandler: Обнаружена ошибка CLIENT_NOT_FOUND, выполняем принудительный logout');

      // Удаляем токены из localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');

        // Отправляем событие о разлогинивании
        emitAuthChanged({ status: 'logout' });

        // Перенаправляем на главную страницу
        console.log('useAuthErrorHandler: редирект на главную');
        window.location.href = '/';
      }
    }
  }, [error]);
}
