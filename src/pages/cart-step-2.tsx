import React from "react";
import MetaTags from "../components/MetaTags";
import { getMetaByPath } from "../lib/meta-config";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CatalogSubscribe from "@/components/CatalogSubscribe";
import CartRecommended from "../components/CartRecommended";
import CartInfo from "../components/CartInfo";
import CartList2 from "../components/CartList2";
import CartSummary2 from "../components/CartSummary2";
import MobileMenuBottomSection from "../components/MobileMenuBottomSection";

export default function CartStep2() {
  const metaConfig = getMetaByPath('/cart-step-2');

  return (
    <>
      <MetaTags 
        title={metaConfig.title}
        description={metaConfig.description}
        keywords={metaConfig.keywords}
        ogTitle={metaConfig.ogTitle}
        ogDescription={metaConfig.ogDescription}
      />

      <CartInfo />
      <section className="main">
        <div className="w-layout-blockcontainer container w-container">
          <div className="w-layout-vflex cart-list">
            <div className="w-layout-hflex core-product-card">
              <CartList2 />
              <CartSummary2 />
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