import Header from "@/components/Header";
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

export default function CartNewPage() {
  const [step, setStep] = useState(1);
  const metaData = getMetaByPath('/cart');

  return (
    <>
      <MetaTags {...metaData} />
      <CartInfo />

      <section style={{
        padding: '40px 0',
        background: '#F9FAFB',
        minHeight: 'calc(100vh - 200px)',
      }}>
        <div style={{
          maxWidth: '1580px',
          margin: '0 auto',
          padding: '0 20px',
        }}>
          {/* Основной контент */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 380px',
            gap: '24px',
            alignItems: 'flex-start',
          }}>
            {/* Левая колонка - список товаров */}
            <div>
              <CartListNew isSummaryStep={step === 2} />
            </div>

            {/* Правая колонка - итоги */}
            <div>
              <CartSummaryNew step={step} setStep={setStep} />
            </div>
          </div>

          {/* Рекомендованные товары */}
          <div style={{ marginTop: '48px' }}>
            <CartRecommended />
          </div>
        </div>
      </section>

      <section>
        <CatalogSubscribe />
      </section>

      <Footer />
      <MobileMenuBottomSection />
    </>
  );
}
