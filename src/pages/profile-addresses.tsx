import * as React from "react";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CatalogSubscribe from '@/components/CatalogSubscribe';
import MobileMenuBottomSection from "@/components/MobileMenuBottomSection";
import LKMenu from '@/components/LKMenu';
import ProfileAddressesMain from '@/components/profile/ProfileAddressesMain';
import ProfileInfo from '@/components/profile/ProfileInfo';
import Head from "next/head";
import MetaTags from "@/components/MetaTags";
import { getMetaByPath } from "@/lib/meta-config";


    
const ProfileAddressesPage = () => {
  const metaData = getMetaByPath('/profile-addresses');

  return (
    <div className="page-wrapper">  
      <MetaTags {...metaData} />
      <ProfileInfo />
      <div className="flex flex-col pt-10 pb-16 max-md:px-5">
        
        <div className="flex relative gap-8 items-start self-stretch max-md:gap-5 max-sm:flex-col max-sm:gap-4 justify-center mx-auto max-w-[1580px] w-full h-full">
          <LKMenu />
          <ProfileAddressesMain />
        </div>
      </div>
      <section className="section-3">
        <CatalogSubscribe />
      </section>
      <MobileMenuBottomSection />
      <Footer />
    </div>
  );
};

export default ProfileAddressesPage;
