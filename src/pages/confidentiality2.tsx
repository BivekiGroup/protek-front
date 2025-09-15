import React from 'react';
import Head from 'next/head';
import CatalogSubscribe from "@/components/CatalogSubscribe";
import MobileMenuBottomSection from "@/components/MobileMenuBottomSection";
import NewsAndPromos from "@/components/index/NewsAndPromos";
import Footer from "@/components/Footer";
import IndexTopMenuNav from "@/components/index/IndexTopMenuNav";
import MetaTags from "@/components/MetaTags";
import { getMetaByPath } from "@/lib/meta-config";
import JsonLdScript from "@/components/JsonLdScript";
import { generateOrganizationSchema, generateWebSiteSchema, PROTEK_ORGANIZATION } from "@/lib/schema";

export default function Confidentiality() {
  const metaData = getMetaByPath('/');
  const organizationSchema = generateOrganizationSchema(PROTEK_ORGANIZATION);
  const websiteSchema = generateWebSiteSchema(
    "Protek - Автозапчасти и аксессуары", 
    "https://protek.ru",
    "https://protek.ru/search"
  );

  return (
    <>
      <MetaTags {...metaData} />
      <JsonLdScript schema={organizationSchema} />
      <JsonLdScript schema={websiteSchema} />
      <link
        href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;700&display=swap"
        rel="stylesheet"
      />
      <div className="flex relative gap-8 items-start self-stretch pt-10 pb-20  max-md:p-8 max-sm:gap-5 max-sm:p-5">
        <div className="flex relative flex-col gap-8 items-start p-10 bg-white rounded-3xl flex-[1_0_0] max-w-[1580px] mx-auto max-md:p-8 max-sm:gap-5 max-sm:p-5">
          <div className="flex relative flex-col gap-4 items-start w-full max-sm:gap-3">
            <div
              layer-name="Политика конфиденциальности"
              className="relative self-stretch text-3xl font-bold leading-9 text-gray-950 max-md:text-2xl max-sm:text-2xl"
            >
              Политика конфиденциальности
            </div>
            <div
              layer-name="ООО «Protek Авто» уважает право каждого клиента на сохранение конфиденциальности и обязуется обеспечивать защиту персональных данных в соответствии с законодательством РФ."
              className="relative self-stretch text-base leading-6 text-gray-600"
            >
              ООО «Protek Авто» уважает право каждого клиента на сохранение
              конфиденциальности и обязуется обеспечивать защиту персональных
              данных в соответствии с законодательством РФ.
            </div>
          </div>
          <div className="flex relative flex-col gap-6 items-start w-full max-md:gap-5 max-sm:gap-4">
            <div
              layer-name="1. Общие положения"
              className="relative self-stretch text-3xl font-medium leading-9 text-gray-950 max-md:text-2xl max-sm:text-2xl"
            >
              1. Общие положения
            </div>
            <div className="flex relative flex-col gap-3 items-start self-stretch max-sm:gap-2">
              <div
                layer-name="Настоящая Политика определяет порядок обработки и защиты персональных данных пользователей сайта."
                className="relative text-base leading-6 text-gray-600"
              >
                • Настоящая Политика определяет порядок обработки и защиты персональных данных пользователей сайта.
              </div>
              <div
                layer-name="Под персональными данными понимается любая информация, которая позволяет прямо или косвенно идентифицировать физическое лицо."
                className="relative text-base leading-6 text-gray-600"
              >
                • Под персональными данными понимается любая информация, которая позволяет прямо или косвенно идентифицировать физическое лицо.
              </div>
              <div
                layer-name="Используя сайт, пользователь подтверждает своё согласие с условиями данной Политики."
                className="relative text-base leading-6 text-gray-600"
              >
                • Используя сайт, пользователь подтверждает своё согласие с условиями данной Политики.
              </div>
            </div>
            <div
              layer-name="На электрические насосы системы охлаждения MasterKit Electro предоставляется гарантия 1 год или 30.000 км пробега, в зависимости от того, что наступит раньше. Все новинки уже внесены в каталог подбора продукции и доступны для заказа."
              className="relative self-stretch text-base leading-6 text-gray-600"
            >
              На электрические насосы системы охлаждения MasterKit Electro
              предоставляется гарантия 1 год или 30.000 км пробега, в
              зависимости от того, что наступит раньше. Все новинки уже внесены
              в каталог подбора продукции и доступны для заказа.
            </div>
          </div>
          <div className="flex relative flex-col gap-6 items-start w-full max-md:gap-5 max-sm:gap-4">
            <div className="flex relative flex-col gap-4 items-start self-stretch max-sm:gap-3">
              <div
                layer-name="2. Сбор персональных данных"
                className="relative self-stretch text-3xl font-medium leading-9 text-gray-950 max-md:text-2xl max-sm:text-2xl"
              >
                2. Сбор персональных данных
              </div>
              <div
                layer-name="Мы можем собирать следующие данные:"
                className="relative self-stretch text-base leading-6 text-gray-600"
              >
                Мы можем собирать следующие данные:
              </div>
            </div>
            <div className="flex relative flex-col gap-3 items-start self-stretch max-sm:gap-2">
              <div className="relative text-base leading-6 text-gray-600">• Имя и фамилия;</div>
              <div className="relative text-base leading-6 text-gray-600">• Контактный номер телефона;</div>
              <div className="relative text-base leading-6 text-gray-600">• Адрес электронной почты;</div>
              <div className="relative text-base leading-6 text-gray-600">• Почтовый адрес для доставки заказов;</div>
              <div className="relative text-base leading-6 text-gray-600">• История заказов и взаимодействия с сайтом.</div>
            </div>
          </div>
          <div className="flex relative flex-col gap-6 items-start w-full max-md:gap-5 max-sm:gap-4">
            <div className="flex relative flex-col gap-4 items-start self-stretch max-sm:gap-3">
              <div
                layer-name="3. Использование персональных данных"
                className="relative self-stretch text-3xl font-medium leading-9 text-gray-950 max-md:text-2xl max-sm:text-2xl"
              >
                3. Использование персональных данных
              </div>
              <div
                layer-name="Собранные данные используются исключительно для:"
                className="relative self-stretch text-base leading-6 text-gray-600"
              >
                Собранные данные используются исключительно для:
              </div>
            </div>
            <div className="flex relative flex-col gap-3 items-start self-stretch max-sm:gap-2">
              <div className="relative text-base leading-6 text-gray-600">• оформления и обработки заказов;</div>
              <div className="relative text-base leading-6 text-gray-600">• предоставления информации о статусе заказа;</div>
              <div className="relative text-base leading-6 text-gray-600">• улучшения качества обслуживания;</div>
              <div className="relative text-base leading-6 text-gray-600">• рассылки уведомлений (новости, акции, персональные предложения) — только при согласии клиента.</div>
            </div>
          </div>
          <div className="flex relative flex-col gap-6 items-start w-full max-md:gap-5 max-sm:gap-4">
            <div
              layer-name="4. Передача данных третьим лицам"
              className="relative self-stretch text-3xl font-medium leading-9 text-gray-950 max-md:text-2xl max-sm:text-2xl"
            >
              4. Передача данных третьим лицам
            </div>
            <div className="flex relative flex-col gap-3 items-start self-stretch max-sm:gap-2">
              <div className="relative text-base leading-6 text-gray-600">• Персональные данные не передаются третьим лицам, за исключением случаев, предусмотренных законом РФ.</div>
              <div className="relative text-base leading-6 text-gray-600">• Данные могут быть переданы партнёрам-доставщикам и платёжным системам только в рамках исполнения заказа.</div>
            </div>
          </div>
          <div className="flex relative flex-col gap-4 items-start w-full max-sm:gap-3">
            <div
              layer-name="5. Защита данных"
              className="relative self-stretch text-3xl font-medium leading-9 text-gray-950 max-md:text-2xl max-sm:text-2xl"
            >
              5. Защита данных
            </div>
            <div
              layer-name="Мы применяем современные технические и организационные меры для защиты персональных данных от утраты, неправомерного доступа, изменения или разглашения."
              className="relative self-stretch text-base leading-6 text-gray-600"
            >
              Мы применяем современные технические и организационные меры для
              защиты персональных данных от утраты, неправомерного доступа,
              изменения или разглашения.
            </div>
          </div>
          <div className="flex relative flex-col gap-6 items-start w-full max-md:gap-5 max-sm:gap-4">
            <div className="flex relative flex-col gap-4 items-start self-stretch max-sm:gap-3">
              <div
                layer-name="6. Права пользователя"
                className="relative self-stretch text-3xl font-medium leading-9 text-gray-950 max-md:text-2xl max-sm:text-2xl"
              >
                6. Права пользователя
              </div>
              <div
                layer-name="Пользователь имеет право:"
                className="relative self-stretch text-base leading-6 text-gray-600"
              >
                Пользователь имеет право:
              </div>
            </div>
            <div className="flex relative flex-col gap-3 items-start self-stretch max-sm:gap-2">
              <div className="relative text-base leading-6 text-gray-600">• запросить информацию о своих персональных данных;</div>
              <div className="relative text-base leading-6 text-gray-600">• потребовать их уточнения или удаления;</div>
              <div className="relative text-base leading-6 text-gray-600">• отозвать согласие на обработку данных.</div>
            </div>
          </div>
          <div className="flex relative flex-col gap-6 items-start w-full max-md:gap-5 max-sm:gap-4">
            <div className="flex relative flex-col gap-4 items-start self-stretch max-sm:gap-3">
              <div
                layer-name="7. Контактная информация"
                className="relative self-stretch text-3xl font-medium leading-9 text-gray-950 max-md:text-2xl max-sm:text-2xl"
              >
                7. Контактная информация
              </div>
              <div
                layer-name="По всем вопросам, связанным с обработкой и защитой персональных данных, вы можете обратиться:"
                className="relative self-stretch text-base leading-6 text-gray-600"
              >
                По всем вопросам, связанным с обработкой и защитой персональных
                данных, вы можете обратиться:
              </div>
            </div>
            <div className="flex relative flex-col gap-3 items-start self-stretch max-sm:gap-2">
              <div className="relative text-base leading-6 text-gray-600">• по телефону:<span className="font-bold"> +7 (495) 260-20-60</span></div>
              <div className="relative text-base leading-6 text-gray-600">• по электронной почте: <span className="underline">info@protekauto.ru</span></div>
            </div>
          </div>
        </div>
      </div>
      <section className="section-3">
        <CatalogSubscribe />
      </section>
      <Footer />
      <MobileMenuBottomSection />
    </>
  );
}
