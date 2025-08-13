import Head from "next/head";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CatalogSubscribe from "@/components/CatalogSubscribe";
import MobileMenuBottomSection from "@/components/MobileMenuBottomSection";
import InfoWholesale from "@/components/wholesale/InfoWholesale";
import DescWholesale from "@/components/wholesale/DescWholesale";
import WhyWholesale from "@/components/wholesale/WhyWholesale";
import ServiceWholesale from "@/components/wholesale/ServiceWholesale";
import HowToBuy from "@/components/wholesale/HowToBuy";
import Help from "@/components/Help";
import MetaTags from "@/components/MetaTags";
import { getMetaByPath } from "@/lib/meta-config";


export default function Wholesale() {
  const metaData = getMetaByPath('/wholesale');

  return (
    <>
      <MetaTags {...metaData} />
      
      <InfoWholesale />
      <section className="main">
        <div className="w-layout-blockcontainer container w-container">
          <div className="w-layout-hflex flex-block-67">
            <DescWholesale />
            <WhyWholesale />
            <ServiceWholesale />
            <HowToBuy />
            <Help />
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