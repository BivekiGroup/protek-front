import Header from "@/components/Header";
import Head from "next/head";
import Footer from "@/components/Footer";
import CartInfo from "@/components/CartInfo";
import CartList from "@/components/CartList";
import CartSummary from "@/components/CartSummary";
import CartRecommended from "../components/CartRecommended";
import CatalogSubscribe from "@/components/CatalogSubscribe";
import MobileMenuBottomSection from "@/components/MobileMenuBottomSection";
import React, { useState } from "react";
import MetaTags from "@/components/MetaTags";
import { getMetaByPath } from "@/lib/meta-config";

export default function CartPage() {
  const [step, setStep] = useState(1);
  const metaData = getMetaByPath('/cart');

  return (
    <>
      <MetaTags {...metaData} />

      <CartInfo />

      <section className="main">
        <div className="w-layout-blockcontainer container w-container">
          <div className="w-layout-vflex cart-list">
            <div className="w-layout-hflex core-product-card">
                <CartList isSummaryStep={step === 2} />
                <CartSummary step={step} setStep={setStep} />
              </div>
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