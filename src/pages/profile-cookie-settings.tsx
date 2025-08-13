import React from 'react';
import Head from 'next/head';
import LKMenu from '@/components/LKMenu';
import CookieSettings from '@/components/profile/CookieSettings';

const ProfileCookieSettingsPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Настройки cookies | Личный кабинет | ПротекАвто</title>
        <meta name="description" content="Управление настройками файлов cookie в личном кабинете" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8 max-md:flex-col">
            {/* Боковое меню */}
            <div className="w-80 max-md:w-full">
              <LKMenu />
            </div>

            {/* Основной контент */}
            <div className="flex-1">
              <CookieSettings />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileCookieSettingsPage; 