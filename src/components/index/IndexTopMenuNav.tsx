import React from 'react';
import Link from 'next/link';

const IndexTopMenuNav = ({ isIndexPage = false }: { isIndexPage?: boolean }) => (
  <section className={`topmenub${!isIndexPage ? ' topmenub-white' : ''}`} style={!isIndexPage ? { background: '#fff' } : undefined}>
    <div className="w-layout-blockcontainer tb nav w-container">
      <div className="w-layout-hflex flex-block-107">
        <Link href="/about" className="link-block-8 w-inline-block">
          <div>О компании</div>
        </Link>
        <Link href="/payments-method" className="link-block-8 w-inline-block">
          <div>Оплата и доставка</div>
        </Link>
        <Link href="/" className="link-block-8 w-inline-block">
          <div>Гарантия и возврат</div>
        </Link>
        <Link href="/payments-method" className="link-block-8 w-inline-block">
          <div>Покупателям</div>
        </Link>
        <Link href="/wholesale" className="link-block-8 w-inline-block">
          <div>Оптовым клиентам</div>
        </Link>
        <Link href="/contacts" className="link-block-8 w-inline-block">
          <div>Контакты</div>
        </Link>
        <a href="#" className="link-block-8 green w-inline-block">
          <div>Новые поступления товаров</div>
        </a>
        <a href="#" className="link-block-8 orange w-inline-block">
          <div>Распродажа</div>
        </a>
      </div>
    </div>
  </section>
);

export default IndexTopMenuNav; 