import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import Head from 'next/head';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileMenuBottomSection from '@/components/MobileMenuBottomSection';
import { GET_BRANDS_BY_CODE, GET_LAXIMO_CATALOG_INFO } from '@/lib/graphql';
import { LaximoCatalogInfo } from '@/types/laximo';
import MetaTags from '@/components/MetaTags';
import { getMetaByPath } from '@/lib/meta-config';

const InfoBrandSelection = ({ 
  brand,
  brandName, 
  vehicleId,
  oemNumber, 
  detailName 
}: { 
  brand: string;
  brandName: string; 
  vehicleId: string;
  oemNumber: string; 
  detailName?: string;
}) => (
  <section className="section-info">
    <div className="w-layout-blockcontainer container info w-container">
      <div className="w-layout-vflex flex-block-9">
        <div className="w-layout-hflex flex-block-7">
          <a href="/" className="link-block w-inline-block">
            <div>Главная</div>
          </a>
          <div className="text-block-3">→</div>
          <a href="#" className="link-block w-inline-block">
            <div>Каталог</div>
          </a>
          <div className="text-block-3">→</div>
          <a href={`/vehicle-search/${brand}/${vehicleId}`} className="link-block w-inline-block">
            <div>{brandName}</div>
          </a>
          <div className="text-block-3">→</div>
          <a href="#" className="link-block-2 w-inline-block">
            <div>Деталь {oemNumber}</div>
          </a>
        </div>
        <div className="link-block w-inline-block">
          
            <div className="heading">Выберите производителя для {oemNumber}</div>
          
        </div>
      </div>
    </div>
  </section>
);

const BrandSelectionPage = () => {
  const router = useRouter();
  const { brand, vehicleId, oemNumber, detailName } = router.query;

  // Получаем информацию о каталоге
  const { data: catalogData, loading: catalogLoading } = useQuery<{ laximoCatalogInfo: LaximoCatalogInfo }>(
    GET_LAXIMO_CATALOG_INFO,
    {
      variables: { catalogCode: brand },
      skip: !brand,
      errorPolicy: 'all',
    }
  );

  // Получаем список брендов по артикулу
  const { data, loading, error } = useQuery(GET_BRANDS_BY_CODE, {
    variables: { code: oemNumber },
    skip: !oemNumber,
    errorPolicy: 'all'
  });

  if (!brand || vehicleId === undefined || vehicleId === null || !oemNumber) {
    return (
      <>
        <Head>
          <title>Выбор производителя</title>
        </Head>
        <main style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
              Неверные параметры
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
              Неверные параметры для выбора производителя
            </p>
            <button
              onClick={() => router.back()}
              style={{
                backgroundColor: '#dc2626',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Назад
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const catalogInfo = catalogData?.laximoCatalogInfo;
  const brandsData = data?.getBrandsByCode;
  const brands = brandsData?.brands || [];
  const hasError = brandsData?.error || error;
  const hasNoBrands = brandsData?.success && brands.length === 0;

  const handleBrandSelect = (selectedBrand: string) => {
    console.log('🎯 Выбран бренд:', { articleNumber: oemNumber, brand: selectedBrand });
    router.push(`/search-result?article=${encodeURIComponent(String(oemNumber))}&brand=${encodeURIComponent(selectedBrand)}`);
  };

  const handleBack = () => {
    router.back();
  };

  const metaData = getMetaByPath('/vehicle-search');

  return (
    <>
      <MetaTags {...metaData} />
      <InfoBrandSelection 
        brand={String(brand)}
        brandName={catalogInfo?.name || String(brand)} 
        vehicleId={String(vehicleId)}
        oemNumber={String(oemNumber)}
        detailName={String(detailName || '')}
      />
      <div className="page-wrapper bg-[#F5F8FB] min-h-screen">
        <div className="mx-auto px-8 max-md:px-5 pt-10 pb-16 ">

          {/* Кнопка назад */}
          {/* <div className="mb-6">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Назад к деталям
            </button>
          </div> */}

          {/* Обработка ошибок */}
          {hasError && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-2xl shadow p-10 mb-6">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-lg font-medium text-red-800">Ошибка загрузки</h3>
                  <p className="text-red-700 mt-1">
                    {brandsData?.error || error?.message || 'Не удалось загрузить список производителей'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Загрузка */}
          {(catalogLoading || loading) && (
            <div className="bg-white rounded-2xl shadow p-10 flex flex-col items-center justify-center min-h-[300px]">
              <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-red-600 mb-6"></div>
              <p className="text-lg text-gray-600">Загружаем производителей...</p>
            </div>
          )}

          {/* Результаты */}
          {!loading && !hasError && (
            <div className="space-y-6">
              {hasNoBrands ? (
                <div className="bg-[#eaf0fa] border border-[#b3c6e6] rounded-2xl shadow p-10 text-center">
                  <svg className="w-16 h-16 mx-auto mb-4" style={{ color: '#0d336c' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: '#0d336c' }}>
                    Производители не найдены
                  </h3>
                  <p className="mb-4" style={{ color: '#0d336c' }}>
                    По артикулу <span className="font-mono font-semibold">{oemNumber}</span> производители не найдены.
                  </p>
                  <p className="text-sm" style={{ color: '#3b5a99' }}>
                    Попробуйте изменить запрос или обратитесь к нашим менеджерам.
                  </p>
                </div>
              ) : brands.length > 0 && (
                  <div className="bg-white rounded-2xl shadow p-10 w-full max-w-[1580px] mx-auto min-h-[500px]">
                    {/* <div className="border-b border-gray-200 pb-4">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Выбор производителя для артикула: {oemNumber}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {detailName && <span>Деталь: {detailName} • </span>}
                        Найдено производителей: <span className="font-medium">{brands.length}</span>
                      </p>
                    </div> */}
                    <div className="divide-y divide-gray-200">
                      {brands.map((brandItem: any, index: number) => (
                        <div key={index}>
                          <button
                            onClick={() => handleBrandSelect(brandItem.brand)}
                            className="w-full text-left p-4 hover:bg-gray-50 transition-colors block group"
                          >
                            <div className="flex w-full items-center gap-2">
                              <div className="w-1/5 max-md:w-1/3 font-bold text-left truncate" style={{ color: 'rgb(77, 180, 94)' }}>
                                {brandItem.brand}
                              </div>
                              <div className="w-1/5 max-md:text-center max-md:w-1/3 font-bold text-left truncate group-hover:text-[#EC1C24] transition-colors">
                                {oemNumber}
                              </div>
                              <div className="w-3/5 max-md:w-1/3 text-left truncate">
                                {brandItem.name && brandItem.name !== brandItem.brand ? brandItem.name : detailName || 'Запчасть'}
                              </div>
                            </div>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
        <MobileMenuBottomSection />
        <Footer />
      </div>
    </>
  );
};

export default BrandSelectionPage; 