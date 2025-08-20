import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useQuery } from '@apollo/client';
import { GET_CLIENT_ME } from '@/lib/graphql';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProfileSidebar from '@/components/ProfileSidebar';
import CatalogSubscribe from '@/components/CatalogSubscribe';
import MobileMenuBottomSection from "@/components/MobileMenuBottomSection";
import LKMenu from '@/components/LKMenu';
import ProfileActsMain from '@/components/profile/ProfileActsMain';
import ProfileInfo from '@/components/profile/ProfileInfo';
import NotificationMane from "@/components/profile/NotificationMane";
import MetaTags from "../components/MetaTags";
import { getMetaByPath } from "../lib/meta-config";

const ProfileActsPage = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const { data: clientData, loading: clientLoading } = useQuery(GET_CLIENT_ME, {
    skip: !isAuthenticated,
    onCompleted: (data) => {
      // Проверяем есть ли у клиента юридические лица
      if (!data?.clientMe?.legalEntities?.length) {
        // Если нет юридических лиц, перенаправляем на настройки
        router.push('/profile-set');
        return;
      }
    },
    onError: (error) => {
      console.error('Ошибка загрузки данных клиента:', error);
      // Если ошибка авторизации, перенаправляем на главную
      router.push('/');
    }
  });

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
  if (!isAuthenticated || clientLoading) {
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
  return (
    <>
      <MetaTags 
        title={getMetaByPath('/profile-acts').title}
        description={getMetaByPath('/profile-acts').description}
        keywords={getMetaByPath('/profile-acts').keywords}
        ogTitle={getMetaByPath('/profile-acts').ogTitle}
        ogDescription={getMetaByPath('/profile-acts').ogDescription}
      />
      <ProfileInfo />
      <div className="flex flex-col pt-10 pb-16 max-md:px-5">
        <div className="flex relative gap-8 items-start self-stretch max-md:gap-5 max-sm:flex-col max-sm:gap-4 justify-center mx-auto max-w-[1580px] w-full h-full">
          <LKMenu />
          <ProfileActsMain />
        </div>
      </div>
      <section className="section-3">
        <CatalogSubscribe />
      </section>
      <MobileMenuBottomSection />
      <Footer />
    </>
  );
};

export default ProfileActsPage;
