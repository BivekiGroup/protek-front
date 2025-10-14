import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { onAuthChanged } from '@/lib/authEvents';
import { useAuthPrompt } from '@/contexts/AuthPromptContext';

/**
 * Ensures protected pages trigger the global auth modal and only render when the user is authorised.
 */
export function useAuthModalGuard(enabled = true) {
  const router = useRouter();
  const { openAuthPrompt } = useAuthPrompt();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(enabled ? null : true);

  useEffect(() => {
    if (!enabled) {
      setIsAuthorized(true);
      return;
    }

    setIsAuthorized((prev) => (prev === null ? prev : null));

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
  }, [enabled, router.isReady, router.asPath, openAuthPrompt]);

  return isAuthorized;
}

export default useAuthModalGuard;
