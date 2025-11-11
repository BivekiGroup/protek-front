import Header from "@/components/Header";
import Head from "next/head";
import Footer from "@/components/Footer";
import CartInfo from "@/components/CartInfo";
import CartListNew from "@/components/CartListNew";
import CartSummaryNew from "@/components/CartSummaryNew";
import CartRecommended from "../components/CartRecommended";
import CatalogSubscribe from "@/components/CatalogSubscribe";
import MobileMenuBottomSection from "@/components/MobileMenuBottomSection";
import React, { useState } from "react";
import MetaTags from "@/components/MetaTags";
import { getMetaByPath } from "@/lib/meta-config";
import { useCart } from "@/contexts/CartContext";

export default function CartPage() {
  const [step, setStep] = useState(1);
  const metaData = getMetaByPath('/cart');
  const { state } = useCart();
  const hasItems = state.items.length > 0;

  return (
    <>
      <MetaTags {...metaData} />
      <CartInfo />

      <section style={{
        padding: '40px 0',
        background: '#F9FAFB',
        minHeight: 'calc(100vh - 200px)',
        overflowX: 'hidden',
      }}>
        <div style={{
          maxWidth: '1580px',
          margin: '0 auto',
          padding: '0 20px',
          width: '100%',
          boxSizing: 'border-box',
        }}>
          {/* Основной контент */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: hasItems ? '1fr 380px' : '1fr',
            gap: '24px',
            alignItems: 'flex-start',
            width: '100%',
            maxWidth: '100%',
          }}>
            {/* Левая колонка - список товаров */}
            <div style={{ minWidth: 0, overflow: 'hidden', width: '100%' }}>
              <CartListNew isSummaryStep={step === 2} />
            </div>

            {/* Правая колонка - итоги (только если есть товары) */}
            {hasItems && (
              <div>
                <CartSummaryNew step={step} setStep={setStep} />
              </div>
            )}
          </div>

          {/* Рекомендованные товары */}
          <div style={{ marginTop: '48px' }}>
            <CartRecommended />
          </div>
        </div>
      </section>

      <section className="section-3">
        <CatalogSubscribe />
      </section>

      <Footer />
      <MobileMenuBottomSection />
    </>
  );
} 