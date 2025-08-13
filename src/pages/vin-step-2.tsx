import Head from "next/head";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CatalogSubscribe from "@/components/CatalogSubscribe";
import MobileMenuBottomSection from "@/components/MobileMenuBottomSection";
import InfoVin from "@/components/vin/InfoVin";
import VinLeftbar from "@/components/vin/VinLeftbar";
import VinCategory from "@/components/vin/VinCategory";
import VinKnot from "@/components/vin/VinKnot";
import KnotParts from "@/components/vin/KnotParts";
import React, { useState } from "react";
import KnotIn from "@/components/vin/KnotIn";
import MetaTags from "@/components/MetaTags";
import { getMetaByPath } from "@/lib/meta-config";


export default function Vin() {
  const [showKnot, setShowKnot] = useState(false);

  // Обработчик для передачи в VinCategory и для делегирования на .link-2
  const handleCategoryClick = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setShowKnot(true);
  };

  React.useEffect(() => {
    // Делегируем клик на все .link-2 (если они есть на странице)
    const handler = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains("link-2")) {
        e.preventDefault();
        setShowKnot(true);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const metaData = getMetaByPath('/vin-step-2');

  return (
    <>
      <MetaTags {...metaData} />
      <Head>
        <link href="/css/normalize.css" rel="stylesheet" type="text/css" />
        <link href="/css/webflow.css" rel="stylesheet" type="text/css" />
        <link href="/css/protekproject.webflow.css" rel="stylesheet" type="text/css" />
      </Head>
      <InfoVin />
      <section className="main">
        <div className="w-layout-blockcontainer container-vin w-container">
          <div className="w-layout-hflex flex-block-13">
            <div className="w-layout-vflex flex-block-14-copy-copy">
                <KnotIn />
                <KnotParts catalogCode="" vehicleId="" />
        
            </div>

            
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