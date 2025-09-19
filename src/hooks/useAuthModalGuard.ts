import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { onAuthChanged } from '@/lib/authEvents';
import { useAuthPrompt } from '@/contexts/AuthPromptContext';

/**
 * Ensures protected pages trigger the global auth modal and only render when the user is authorised.
 */
export function useAuthModalGuard() {
  const router = useRouter();
  const { openAuthPrompt } = useAuthPrompt();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const requestModal = () => {
      openAuthPrompt({ targetPath: router.asPath });
    };

    const evaluateAuth = () => {
      if (typeof window === 'undefined') {
        return;
      }
      const token = localStorage.getItem('authToken');
      const authorized = Boolean(token);
      setIsAuthorized(authorized);
      if (!authorized) {
        requestModal();
      }
    };

    evaluateAuth();

    const unsubscribe = onAuthChanged((detail) => {
      const authorized = detail.status === 'login';
      setIsAuthorized(authorized);
      if (!authorized) {
        requestModal();
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [router.isReady, router.asPath, openAuthPrompt]);

  return isAuthorized;
}

export default useAuthModalGuard;
