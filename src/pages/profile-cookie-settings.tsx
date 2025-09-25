import React from 'react';
import Head from 'next/head';
import LKMenu from '@/components/LKMenu';
import ProfileInfo from '@/components/profile/ProfileInfo';
import CatalogSubscribe from '@/components/CatalogSubscribe';
import MobileMenuBottomSection from '@/components/MobileMenuBottomSection';
import Footer from '@/components/Footer';
import CookieSettings from '@/components/profile/CookieSettings';

const ProfileCookieSettingsPage: React.FC = () => {
  return (
    <div className="page-wrapper h-full flex flex-col flex-1">
      <Head>
        <title>Настройки cookies | Личный кабинет | ПротекАвто</title>
        <meta name="description" content="Управление настройками файлов cookie в личном кабинете" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <ProfileInfo />

      <div className="flex flex-col pt-10 pb-16 max-md:px-5">
        <div className="flex relative gap-8 items-start self-stretch max-md:gap-5 max-sm:flex-col max-sm:gap-4 justify-center mx-auto max-w-[1580px] w-full h-full">
          <LKMenu />
          <div className="flex flex-col flex-1 gap-6 w-full">
            <CookieSettings />
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

export default ProfileCookieSettingsPage;
