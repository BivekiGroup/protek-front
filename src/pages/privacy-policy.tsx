import React from 'react';
import Head from 'next/head';

const PrivacyPolicy: React.FC = () => {
  return (
    <>
      <Head>
        <title>Политика конфиденциальности | ПротекАвто</title>
        <meta name="description" content="Политика конфиденциальности интернет-магазина автозапчастей ПротекАвто" />
        <meta name="robots" content="index, follow" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-950 mb-8">
              Политика конфиденциальности
            </h1>

            <div className="prose prose-gray max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-semibold text-gray-950 mb-4">
                  1. Общие положения
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных 
                  пользователей интернет-магазина ПротекАвто (далее — «Сайт»). Мы уважаем вашу конфиденциальность 
                  и стремимся защитить ваши персональные данные.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-950 mb-4">
                  2. Сбор и использование персональных данных
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Мы собираем следующие категории персональных данных:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Контактная информация (имя, телефон, email)</li>
                  <li>Данные для доставки (адрес, индекс)</li>
                  <li>Информация о заказах и покупках</li>
                  <li>Техническая информация (IP-адрес, браузер, устройство)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-950 mb-4">
                  3. Файлы cookie
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Наш сайт использует файлы cookie для улучшения пользовательского опыта. Мы используем следующие типы cookie:
                </p>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-950 mb-2">Необходимые cookie</h3>
                    <p className="text-sm text-gray-600">
                      Обеспечивают базовую функциональность сайта, включая корзину покупок, авторизацию и безопасность.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-950 mb-2">Аналитические cookie</h3>
                    <p className="text-sm text-gray-600">
                      Помогают нам понять, как посетители используют сайт, чтобы улучшить его работу.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-950 mb-2">Маркетинговые cookie</h3>
                    <p className="text-sm text-gray-600">
                      Используются для показа релевантной рекламы и отслеживания эффективности рекламных кампаний.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-950 mb-2">Функциональные cookie</h3>
                    <p className="text-sm text-gray-600">
                      Обеспечивают расширенную функциональность и персонализацию сайта.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-950 mb-4">
                  4. Цели обработки данных
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Мы обрабатываем ваши персональные данные для следующих целей:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Обработка и выполнение заказов</li>
                  <li>Связь с клиентами по вопросам заказов</li>
                  <li>Улучшение качества обслуживания</li>
                  <li>Анализ использования сайта</li>
                  <li>Маркетинговые коммуникации (с вашего согласия)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-950 mb-4">
                  5. Передача данных третьим лицам
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Мы не продаем и не передаем ваши персональные данные третьим лицам, за исключением случаев, 
                  необходимых для выполнения наших обязательств перед вами (доставка, оплата) или требований законодательства.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-950 mb-4">
                  6. Защита данных
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Мы применяем современные технические и организационные меры для защиты ваших персональных данных 
                  от несанкционированного доступа, изменения, раскрытия или уничтожения.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-950 mb-4">
                  7. Ваши права
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Вы имеете право:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Получить информацию о обработке ваших данных</li>
                  <li>Внести изменения в ваши данные</li>
                  <li>Удалить ваши данные</li>
                  <li>Ограничить обработку данных</li>
                  <li>Отозвать согласие на обработку данных</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-950 mb-4">
                  8. Контактная информация
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  По вопросам обработки персональных данных вы можете обратиться к нам:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg mt-4">
                  <p className="text-gray-600">
                    <strong>Email:</strong> privacy@protekauto.ru<br />
                    <strong>Телефон:</strong> +7 (495) 123-45-67<br />
                    <strong>Адрес:</strong> г. Москва, ул. Примерная, д. 1
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-950 mb-4">
                  9. Изменения в политике
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Мы оставляем за собой право вносить изменения в настоящую Политику конфиденциальности. 
                  Актуальная версия всегда доступна на данной странице.
                </p>
              </section>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy; 