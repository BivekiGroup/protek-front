import React from "react";
import Head from "next/head";
import Header from "@/components/Header";
import CatalogSubscribe from "@/components/CatalogSubscribe";
import Footer from "@/components/Footer";
import MobileMenuBottomSection from "@/components/MobileMenuBottomSection";
import InfoContacts from "@/components/contacts/InfoContacts";
import MapContacts from "@/components/contacts/MapContacts";
import OrderContacts from "@/components/contacts/OrderContacts";
import LegalContacts from "@/components/contacts/LegalContacts";
import MetaTags from "@/components/MetaTags";
import { getMetaByPath } from "@/lib/meta-config";
import JsonLdScript from "@/components/JsonLdScript";
import { generateLocalBusinessSchema, PROTEK_LOCAL_BUSINESS } from "@/lib/schema";

const Contacts = () => {
  const metaData = getMetaByPath('/contacts');
  
  // Генерируем микроразметку LocalBusiness для страницы контактов
  const localBusinessSchema = generateLocalBusinessSchema(PROTEK_LOCAL_BUSINESS);
  
  return (
    <>
      <MetaTags {...metaData} />
      <JsonLdScript schema={localBusinessSchema} />
        <InfoContacts />
    <section className="main">
      <div className="w-layout-blockcontainer container w-container">
        <div className="w-layout-hflex flex-block-67">
          <div className="w-layout-vflex flex-block-72">
            <div className="w-layout-vflex flex-block-97">
                <OrderContacts />
                <LegalContacts />
            </div>
            <MapContacts />
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
};

export default Contacts; 