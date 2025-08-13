import * as React from "react";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CatalogSubscribe from '@/components/CatalogSubscribe';
import MobileMenuBottomSection from "@/components/MobileMenuBottomSection";
import LKMenu from '@/components/LKMenu';
import ProfileSettingsMain from '@/components/profile/ProfileSettingsMain';
import ProfileInfo from '@/components/profile/ProfileInfo';
import Head from "next/head";
import MetaTags from "@/components/MetaTags";
import { getMetaByPath } from "@/lib/meta-config";


    
const ProfileSettingsPage = () => {
  const metaData = getMetaByPath('/profile-set');

  return (
    <div className="page-wrapper h-full flex flex-col flex-1">
      <MetaTags {...metaData} />
      <ProfileInfo />
      <div className="flex flex-col pt-10 pb-16 max-md:px-5">
        
        <div className="flex relative gap-8 items-start self-stretch max-md:gap-5 max-sm:flex-col max-sm:gap-4 justify-center mx-auto max-w-[1580px] w-full h-full">
          <LKMenu />
          <ProfileSettingsMain />
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

export default ProfileSettingsPage;
