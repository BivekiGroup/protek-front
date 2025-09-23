import * as React from "react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import CatalogSubscribe from '@/components/CatalogSubscribe';
import Footer from '@/components/Footer';
import MobileMenuBottomSection from "@/components/MobileMenuBottomSection";
import LKMenu from '@/components/LKMenu';
import ProfileRequisitiesMain from '@/components/profile/ProfileRequisitiesMain';
import ProfileInfo from '@/components/profile/ProfileInfo';
import MetaTags from "../components/MetaTags";
import { getMetaByPath } from "../lib/meta-config";
import ProfileLegalEntitiesMain, { ProfileLegalEntitiesMainHandle } from '@/components/profile/ProfileLegalEntitiesMain';

const ProfileRequisitiesPage = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const legalEntitiesRef = useRef<ProfileLegalEntitiesMainHandle>(null);

  useEffect(() => {
    // Проверяем авторизацию
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/');
      return;
    }
    setIsAuthenticated(true);
  }, [router]);

  // Показываем загрузку пока проверяем авторизацию и данные
  if (!isAuthenticated) {
    return (
      <div className="page-wrapper">
        <div className="flex flex-col justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <div className="mt-4 text-gray-600">Загрузка...</div>
        </div>
        <Footer />
      </div>
    );
  }

  const metaConfig = getMetaByPath('/profile-req');

  const handleCreateLegalEntity = () => {
    legalEntitiesRef.current?.openCreateForm();
    const section = document.getElementById('legal-entities-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="page-wrapper">
      <MetaTags 
        title={metaConfig.title}
        description={metaConfig.description}
        keywords={metaConfig.keywords}
        ogTitle={metaConfig.ogTitle}
        ogDescription={metaConfig.ogDescription}
      />
      <ProfileInfo />
      <div className="flex flex-col pt-10 pb-16 max-md:px-5">
        
        <div className="flex relative gap-8 items-start self-stretch max-md:gap-5 max-sm:flex-col max-sm:gap-4 justify-center mx-auto max-w-[1580px] w-full h-full">
          <LKMenu />
          <div className="flex flex-col flex-1 gap-6 w-full">
            <div id="legal-entities-section">
              <ProfileLegalEntitiesMain ref={legalEntitiesRef} />
            </div>
            <ProfileRequisitiesMain onCreateLegalEntity={handleCreateLegalEntity} />
          </div>
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

export default ProfileRequisitiesPage;
