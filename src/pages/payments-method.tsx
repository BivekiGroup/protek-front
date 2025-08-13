import MetaTags from "../components/MetaTags";
import { getMetaByPath } from "../lib/meta-config";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CatalogSubscribe from "@/components/CatalogSubscribe";
import MobileMenuBottomSection from "@/components/MobileMenuBottomSection";
import Help from "@/components/Help";
import InfoPayments from "@/components/payments/InfoPayments";
import PaymentsDetails from "@/components/payments/PaymentsDetails";
import DeliveryInfo from "@/components/payments/DeliveryInfo";
import PaymentsCompony from "@/components/payments/PaymentsCompony";

export default function PaymentsMethod() {
  const metaConfig = getMetaByPath('/payments-method');

  return (
    <>
      <MetaTags 
        title={metaConfig.title}
        description={metaConfig.description}
        keywords={metaConfig.keywords}
        ogTitle={metaConfig.ogTitle}
        ogDescription={metaConfig.ogDescription}
      />
      <InfoPayments />
      
      <section className="main">
        <div className="w-layout-blockcontainer container w-container">
          <div className="w-layout-hflex flex-block-67">
          <PaymentsDetails />
            <DeliveryInfo />
            <PaymentsCompony />
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