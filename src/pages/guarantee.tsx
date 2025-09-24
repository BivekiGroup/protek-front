import * as React from "react";
import GuaranteeReturnInfo from "@/components/guarantee/GuaranteeReturnInfo";
import GuaranteeReturnHelp from "@/components/guarantee/GuaranteeReturnHelp";
import CatalogSubscribe from "@/components/CatalogSubscribe";
import Footer from "@/components/Footer";
import MobileMenuBottomSection from "@/components/MobileMenuBottomSection";
import GuaranteeInfo from "@/components/guarantee/GuaranteeInfo";
import GuaranteeIntro from "@/components/guarantee/GuaranteeIntro";


export default function Guarantee() {
  return (
    <>
     
      <GuaranteeInfo />
      <GuaranteeIntro />
      <div className="w-layout-blockcontainer container w-container" style={{ marginBottom: '60px' }}>
      <GuaranteeReturnInfo />
      <GuaranteeReturnHelp />
      </div>
      <section className="section-3">
        <CatalogSubscribe />
      </section>
      <Footer />
      <MobileMenuBottomSection />
    </>
  );
}
