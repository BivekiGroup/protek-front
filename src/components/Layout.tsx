import React, { useState } from "react";
import { useRouter } from "next/router";
import Header from "./Header";
import AuthModal from "./auth/AuthModal";
import MobileMenuBottomSection from "./MobileMenuBottomSection";
import IndexTopMenuNav from "./index/IndexTopMenuNav";

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
    router.push('/profile-orders');
  };

  // Открытие модалки авторизации через параметр ?openAuth=1
  React.useEffect(() => {
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
    <>
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
        {children}</main>
      <MobileMenuBottomSection onOpenAuthModal={() => setAuthModalOpen(true)} />
    </>
  );
};

export default Layout;
