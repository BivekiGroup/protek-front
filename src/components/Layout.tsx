import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Header from "./Header";
import AuthModal from "./auth/AuthModal";
import MobileMenuBottomSection from "./MobileMenuBottomSection";
import IndexTopMenuNav from "./index/IndexTopMenuNav";
import { emitAuthChanged } from '@/lib/authEvents'
import { AuthPromptProvider, useAuthPrompt } from '@/contexts/AuthPromptContext';

const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/i;

const parseRoute = (url: string) => {
  try {
    const parsed = url.startsWith('http')
      ? new URL(url)
      : new URL(url, 'http://localhost');

    return {
      pathname: parsed.pathname || '/',
      search: parsed.search || '',
      searchParams: parsed.searchParams,
      asPath: `${parsed.pathname}${parsed.search}`,
    };
  } catch {
    const [path = '/', query = ''] = url.split('?');
    const normalizedPath = path.startsWith('http')
      ? new URL(path).pathname
      : path || '/';

    return {
      pathname: normalizedPath,
      search: query ? `?${query}` : '',
      searchParams: new URLSearchParams(query),
      asPath: query ? `${normalizedPath}?${query}` : normalizedPath,
    };
  }
};

const shouldRequireAuth = (url: string) => {
  const { pathname, searchParams, asPath } = parseRoute(url);
  const normalizedPath = pathname !== '/' && pathname.endsWith('/')
    ? pathname.slice(0, -1)
    : pathname;

  if (normalizedPath === '/brands') {
    return { requiresAuth: true, targetPath: asPath };
  }

  if (normalizedPath === '/vehicle-search') {
    return { requiresAuth: true, targetPath: asPath };
  }

  if (
    normalizedPath.startsWith('/vehicle-search/') &&
    !normalizedPath.startsWith('/vehicle-search-results')
  ) {
    return { requiresAuth: true, targetPath: asPath };
  }

  if (normalizedPath === '/vehicle-search-results') {
    const q = searchParams.get('q');
    if (q && VIN_PATTERN.test(q.trim().toUpperCase())) {
      return { requiresAuth: true, targetPath: asPath };
    }
  }

  return { requiresAuth: false, targetPath: asPath };
};

const AuthRouteGuard: React.FC = () => {
  const router = useRouter();
  const { openAuthPrompt } = useAuthPrompt();
  const fallbackPathRef = useRef<string>('/');

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const hasAuthToken = () => {
      if (typeof window === 'undefined') {
        return false;
      }
      return Boolean(localStorage.getItem('authToken'));
    };

    const loadFallbackFromStorage = () => {
      if (typeof window === 'undefined') {
        return;
      }
      const stored = localStorage.getItem('last_public_path');
      if (stored) {
        fallbackPathRef.current = stored;
      }
    };

    const persistFallback = (path: string) => {
      const safePath = path || '/';
      fallbackPathRef.current = safePath;
      if (typeof window !== 'undefined') {
        localStorage.setItem('last_public_path', safePath);
      }
    };

    const handleBlockedNavigation = (targetPath: string) => {
      const fallback = fallbackPathRef.current || '/';
      openAuthPrompt({ targetPath });
      if (router.asPath !== fallback) {
        setTimeout(() => {
          router.replace(fallback, undefined, { shallow: true });
        }, 0);
      }
    };

    loadFallbackFromStorage();

    const initialCheck = shouldRequireAuth(router.asPath);
    if (!initialCheck.requiresAuth) {
      persistFallback(initialCheck.targetPath);
    } else if (!hasAuthToken()) {
      handleBlockedNavigation(initialCheck.targetPath);
    }

    const handleRouteChangeStart = (url: string) => {
      if (hasAuthToken()) {
        return;
      }

      const evaluation = shouldRequireAuth(url);
      if (!evaluation.requiresAuth) {
        return;
      }

      router.events.emit('routeChangeError');
      handleBlockedNavigation(evaluation.targetPath);
      throw 'Route change aborted: authorization required';
    };

    const handleRouteChangeComplete = (url: string) => {
      const evaluation = shouldRequireAuth(url);
      if (!evaluation.requiresAuth) {
        persistFallback(evaluation.targetPath);
      }
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [router, openAuthPrompt]);

  return null;
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const router = useRouter();

  const handleAuthSuccess = (client: any, token?: string) => {
    // Сохраняем токен и пользователя в localStorage
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem('authToken', token);
      }
      localStorage.setItem('userData', JSON.stringify(client));
    }
    setAuthModalOpen(false);
    // Сообщаем приложению об успешной авторизации
    emitAuthChanged({ status: 'login', user: client })
    router.push('/profile-orders');
  };

  // Открытие модалки авторизации через параметр ?openAuth=1
  useEffect(() => {
    if (!router.isReady) return;
    const openAuth = router.query.openAuth;
    if (openAuth === '1') {
      setAuthModalOpen(true);
      const nextQuery = { ...router.query } as Record<string, any>;
      delete nextQuery.openAuth;
      router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true });
    }
  }, [router.isReady, router.query.openAuth]);

  return (
    <AuthPromptProvider onRequestLogin={() => setAuthModalOpen(true)}>
      <AuthRouteGuard />
      <header className="section-4">
        <Header onOpenAuthModal={() => setAuthModalOpen(true)} />
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      </header>

      <main className="pt-[62px] md:pt-[63px]">
        <IndexTopMenuNav isIndexPage={router.pathname === '/'} />
        {children}
      </main>
      <MobileMenuBottomSection onOpenAuthModal={() => setAuthModalOpen(true)} />
    </AuthPromptProvider>
  );
};

export default Layout;
