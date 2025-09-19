import * as React from "react";
import Footer from '@/components/Footer';
import CatalogSubscribe from '@/components/CatalogSubscribe';
import MobileMenuBottomSection from "@/components/MobileMenuBottomSection";
import LKMenu from '@/components/LKMenu';
import ProfileGarageMain from '@/components/profile/ProfileGarageMain';
import ProfileInfo from '@/components/profile/ProfileInfo';
import MetaTags from "@/components/MetaTags";
import { getMetaByPath } from "@/lib/meta-config";
import useAuthModalGuard from '@/hooks/useAuthModalGuard';


    
const ProfileGaragePage = () => {
  const metaData = getMetaByPath('/profile-gar');
  const authStatus = useAuthModalGuard();

  if (authStatus === null) {
    return null;
  }

  if (!authStatus) {
    return <MetaTags {...metaData} />;
  }

  return (
    <div className="page-wrapper">
      <MetaTags {...metaData} />
      <ProfileInfo />
      <div className="flex flex-col pt-10 pb-16 max-md:px-5">
        
        <div className="flex relative gap-8 items-start self-stretch max-md:gap-5 max-sm:flex-col max-sm:gap-4 justify-center mx-auto max-w-[1580px] w-full h-full">
          <LKMenu />
          <ProfileGarageMain />
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

export default ProfileGaragePage;
