import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthPrompt } from '@/contexts/AuthPromptContext';

const IndexTopMenuNav = ({ isIndexPage = false }: { isIndexPage?: boolean }) => {
  const { openAuthPrompt } = useAuthPrompt();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      setIsAuthenticated(Boolean(token));
    }
  }, []);

  const handleSupportClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isAuthenticated) {
      event.preventDefault();
      openAuthPrompt({ targetPath: '/profile-support' });
    }
  };

  return (
    <section className={`topmenub${!isIndexPage ? ' topmenub-white' : ''}`} style={!isIndexPage ? { background: '#fff' } : undefined}>
      <div className="w-layout-blockcontainer tb nav w-container">
        <div className="w-layout-hflex flex-block-107">
          <Link href="/catalog" className="link-block-8 w-inline-block">
            <div>Каталог</div>
          </Link>
          <Link href="/about" className="link-block-8 w-inline-block">
            <div>О компании</div>
          </Link>
          <Link href="/payments-method" className="link-block-8 w-inline-block">
            <div>Оплата и доставка</div>
          </Link>
          <Link href="/guarantee" className="link-block-8 w-inline-block">
            <div>Гарантия и возврат</div>
          </Link>
          <Link href="/wholesale" className="link-block-8 w-inline-block">
            <div>Оптовым клиентам</div>
          </Link>
          <Link href="/contacts" className="link-block-8 w-inline-block">
            <div>Контакты</div>
          </Link>
          <Link
            href="/profile-support"
            className="link-block-8 w-inline-block"
            onClick={handleSupportClick}
          >
            <div>Поддержка</div>
          </Link>
          <Link href="/new-arrivals" className="link-block-8 green w-inline-block">
            <div>Новые поступления товаров</div>
          </Link>
          <a href="#" className="link-block-8 orange w-inline-block">
            <div>Распродажа</div>
          </a>
        </div>
      </div>
    </section>
  );
};

export default IndexTopMenuNav; 
