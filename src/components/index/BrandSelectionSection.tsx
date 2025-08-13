import React, { useState, useMemo, useRef } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@apollo/client";
import { GET_LAXIMO_BRANDS } from "@/lib/graphql";
import { LaximoBrand } from "@/types/laximo";
import { Combobox } from '@headlessui/react';

const tabs = [
  "Техническое обслуживание",
  "Легковые",
  "Грузовые",
  "Коммерческие",
];

type Brand = { name: string; code?: string };

const BrandSelectionSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [brandQuery, setBrandQuery] = useState('');
  const router = useRouter();

  const { data, loading, error } = useQuery<{ laximoBrands: LaximoBrand[] }>(GET_LAXIMO_BRANDS, {
    errorPolicy: 'all'
  });

  const staticBrands: Brand[] = [
    { name: "Audi" },
    { name: "BMW" },
    { name: "Cadillac" },
    { name: "Chevrolet" },
    { name: "Citroen" },
    { name: "Fiat" },
    { name: "Mazda" }
  ];

  let brands: Brand[] = staticBrands;
  if (data?.laximoBrands && data.laximoBrands.length > 0) {
    brands = data.laximoBrands.map(brand => ({
      name: brand.name,
      code: brand.code
    }));
  } else if (error) {
    console.warn('Laximo API недоступен, используются статические данные:', error.message);
  }

  // Combobox фильтрация
  const filteredBrands = useMemo(() => {
    if (!brandQuery) return brands;
    return brands.filter(b => b.name.toLowerCase().includes(brandQuery.toLowerCase()));
  }, [brands, brandQuery]);

  const handleBrandClick = (brand: Brand) => {
    if (brand.code) {
      router.push(`/brands?selected=${brand.code}`);
    } else {
      console.warn('Brand code not available for', brand.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBrand) {
      const found = brands.find(b => b.code === selectedBrand.code || b.name === selectedBrand.name);
      if (found && found.code) {
        router.push(`/brands?selected=${found.code}`);
        return;
      }
    }
    router.push("/brands");
  };

  if (loading) {
    return (
      <section>
        <div className="w-layout-blockcontainer container w-container">
          <div className="w-layout-vflex inbt">
            <h2 className="heading-4">Подбор по маркам</h2>
            <div className="text-center">Загрузка брендов...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="main">
      <div className="w-layout-blockcontainer container w-container">
        <div className="w-layout-vflex inbt">
          <h2 className="heading-4">Подбор по маркам</h2>
          <div className="w-layout-hflex flex-block-6-copy">
            <div className="w-layout-hflex brandsortb">
              <div className="w-layout-hflex tabson">
                {tabs.map((tab, idx) => (
                  <div
                    className={activeTab === idx ? "tab_c tab_card-activ" : "tab_c tab_card"}
                    key={idx}
                    onClick={() => setActiveTab(idx)}
                    style={{ cursor: "pointer" }}
                  >
                    {tab}
                  </div>
                ))}
              </div>
              <div className="w-layout-hflex brandsort">
                {[...Array(5)].map((_, colIdx) => (
                  <div className="w-layout-vflex flex-block-26" key={colIdx}>
                    {brands.slice(colIdx * Math.ceil(brands.length / 5), (colIdx + 1) * Math.ceil(brands.length / 5)).map((brand, idx) => (
                      <button
                        onClick={() => handleBrandClick(brand)}
                        className="link-block-6 w-inline-block text-left"
                        key={idx}
                        style={{ background: 'none', border: 'none', padding: 0 }}
                      >
                        <div className="indexbrandblock">{brand.name}</div>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
              <button
                onClick={() => router.push('/brands')}
                className="w-layout-hflex flex-block-29 cursor-pointer hover:opacity-80 transition-opacity"
                style={{ background: 'none', border: 'none', padding: 0 }}
              >
                <div className="text-block-18">Все марки</div>
                <img src="/images/Arrow_right.svg" loading="lazy" alt="Стрелка вправо" />
              </button>
            </div>
            <div className="w-layout-vflex flex-block-124">
              <h1 className="heading-21">ПОДБОР АВТОЗАПЧАСТЕЙ ПО МАРКЕ АВТО</h1>
              <div className="form-block-4 w-form">
                <form id="email-form" name="email-form" data-name="Email Form" method="post" data-wf-page-id="685be6dfd87db2e01cbdb7a2" data-wf-element-id="e673036c-0caf-d251-3b66-9ba9cb85064c" onSubmit={handleSubmit}>
                  <div style={{ width: 180,   marginBottom: 16 }}>
                    <Combobox value={selectedBrand} onChange={setSelectedBrand} nullable>
                      <div className="relative">
                        <Combobox.Input
                          className="w-full px-6 py-4 bg-white rounded border border-stone-300 text-sm text-gray-950 placeholder:text-neutral-500 outline-none focus:shadow-none focus:border-stone-300 transition-colors"
                          displayValue={(brand: Brand | null) => brand?.name || ''}
                          onChange={e => setBrandQuery(e.target.value)}
                          placeholder="Марка"
                          autoComplete="off"
                        />
                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center px-3 focus:outline-none w-12">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6" />
                          </svg>
                        </Combobox.Button>
                        <Combobox.Options
                          className="absolute left-0 top-full z-100 bg-white border-x border-b border-stone-300 rounded-b-lg shadow-lg w-full max-h-60 overflow-auto scrollbar-none"
                          style={{ scrollbarWidth: 'none' }}
                          data-hide-scrollbar
                        >
                          {filteredBrands.length === 0 && (
                            <div className="px-6 py-4 text-gray-500">Бренды не найдены</div>
                          )}
                          {filteredBrands.map(brand => (
                            <Combobox.Option
                              key={brand.code || brand.name}
                              value={brand}
                              className={({ active, selected }) =>
                                `px-6 py-4 cursor-pointer hover:!bg-[rgb(236,28,36)] hover:!text-white text-sm transition-colors ${selected ? 'bg-red-50 font-semibold text-gray-950' : 'text-neutral-500'}`
                              }
                            >
                              {brand.name}
                            </Combobox.Option>
                          ))}
                        </Combobox.Options>
                      </div>
                    </Combobox>
                  </div>
                  <div className="div-block-10-copy">
                    <input type="submit" data-wait="Please wait..." className="button-3-copy w-button" value="Далее" />
                  </div>
                </form>
                <div className="w-form-done">
                  <div>Thank you! Your submission has been received!</div>
                </div>
                <div className="w-form-fail">
                  <div>Oops! Something went wrong while submitting the form.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandSelectionSection; 