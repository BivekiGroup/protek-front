import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Footer from '@/components/Footer';

const PrivacyPolicy: React.FC = () => {
  return (
    <>
      <Head>
        <title>Политика конфиденциальности | PROTEKAUTO.RU</title>
        <meta name="description" content="Политика конфиденциальности интернет-магазина автозапчастей ПротекАвто. Защита персональных данных пользователей" />
        <meta name="robots" content="index, follow" />
      </Head>

      {/* Breadcrumbs */}
      <section className="section-info">
        <div className="w-layout-blockcontainer container info w-container">
          <div className="w-layout-vflex flex-block-9">
            <div className="w-layout-hflex flex-block-7">
              <Link href="/" className="link-block w-inline-block">
                <div>Главная</div>
              </Link>
              <div className="text-block-3">→</div>
              <div className="text-block-3">Политика конфиденциальности</div>
            </div>
          </div>
        </div>
      </section>

      <section className="main" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
        <div className="w-layout-blockcontainer container w-container">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Onest, sans-serif' }}>
                Политика конфиденциальности для сайта PROTEKAUTO.RU
              </h1>
              <p className="text-sm text-gray-500">
                Последнее обновление: 11.11.2025
              </p>
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8" style={{ fontFamily: 'Onest, sans-serif' }}>

              {/* 1. Общие положения */}
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 text-sm font-bold">1</span>
                  Общие положения
                </h2>
                <div className="space-y-3 text-gray-700 leading-relaxed">
                  <p>
                    <strong>1.1.</strong> Настоящая Политика конфиденциальности (далее — «Политика») определяет порядок обработки и защиты информации о пользователях веб-сайта protekauto.ru (далее — «Сайт»), принадлежащего Обществу с ограниченной ответственностью «ПРОТЕК» (далее — «Общество», «Мы», «Нас»).
                  </p>
                  <p>
                    <strong>1.2.</strong> Используя Сайт и его сервисы (оформление заказа, регистрация, подписка на новости и т.д.), вы даете свое согласие на обработку ваших данных в соответствии с настоящей Политикой.
                  </p>
                  <p>
                    <strong>1.3.</strong> Обработка персональных данных физических лиц осуществляется в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных».
                  </p>
                </div>
              </section>

              {/* 2. Какие данные мы собираем */}
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 text-sm font-bold">2</span>
                  Какие данные мы собираем
                </h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <div>
                    <p className="mb-3"><strong>2.1. Данные физических лиц (покупателей, представителей юридических лиц, пользователей):</strong></p>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p><strong>Данные для идентификации и связи:</strong> Фамилия, имя, отчество, номер телефона, адрес электронной почты (e-mail).</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p><strong>Данные для доставки заказа:</strong> Адрес доставки (индекс, город, улица, дом, квартира).</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p><strong>Данные о вашем устройстве и поведении на Сайте:</strong> Техническая информация (IP-адрес, тип браузера, версия ОС), данные, собираемые с помощью файлов cookie и аналогичных технологий (сведения о просмотренных товарах, история поиска, переходы по ссылкам).</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p><strong>Прочие данные:</strong> Любая иная информация, которую вы добровольно предоставляете нам при оформлении заказа, в отзывах или в обращении в службу поддержки.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="mb-3"><strong>2.2. Данные юридических лиц и их представителей:</strong></p>
                    <p className="mb-3">При оформлении заказа или регистрации от имени юридического лица мы собираем следующую информацию:</p>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <p><strong>Реквизиты юридического лица:</strong> Полное наименование организации, Идентификационный номер налогоплательщика (ИНН), Код причины постановки на учет (КПП), юридический адрес, банковские реквизиты.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <p><strong>Данные представителя юридического лица:</strong> Фамилия, имя, отчество лица, действующего от имени компании (директора, менеджера), его должность, контактный телефон и адрес электронной почты. Данные представителя являются персональными и обрабатываются в соответствии с настоящей Политикой.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p><strong>Данные для доставки:</strong> Фактический адрес доставки товара.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 3. Цели сбора и обработки данных */}
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 text-sm font-bold">3</span>
                  Цели сбора и обработки данных
                </h2>
                <div className="space-y-3 text-gray-700 leading-relaxed">
                  <p><strong>3.1.</strong> Мы используем ваши данные для следующих целей:</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="bg-gradient-to-br from-red-50 to-white rounded-lg p-4 border border-red-100">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Обработка и выполнение заказов
                      </h3>
                      <p className="text-sm text-gray-600">Оформление, подтверждение, обработка платежей, доставка автозапчастей как физическим, так и юридическим лицам.</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-4 border border-blue-100">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        Взаимодействие и поддержка
                      </h3>
                      <p className="text-sm text-gray-600">Связь с вами для уточнения деталей заказа, согласования условий поставки, предоставления информации о статусе заказа, ответа на запросы в службу поддержки.</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-white rounded-lg p-4 border border-green-100">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Документооборот
                      </h3>
                      <p className="text-sm text-gray-600">Заключение и исполнение договоров купли-продажи и поставки, выставление счетов, счетов-фактур, актов и иных закрывающих документов для юридических лиц.</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-white rounded-lg p-4 border border-purple-100">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                        </svg>
                        Маркетинг и коммуникация
                      </h3>
                      <p className="text-sm text-gray-600">Отправка вам информационных и рекламных рассылок (только с вашего согласия) о новых товарах, акциях и специальных предложениях.</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-white rounded-lg p-4 border border-amber-100">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Улучшение сервиса
                      </h3>
                      <p className="text-sm text-gray-600">Анализ поведения на Сайте, улучшение его функциональности, удобства и разработка новых сервисов.</p>
                    </div>
                    <div className="bg-gradient-to-br from-cyan-50 to-white rounded-lg p-4 border border-cyan-100">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Безопасность
                      </h3>
                      <p className="text-sm text-gray-600">Предотвращение и выявление мошеннических действий, обеспечение безопасности наших систем и пользователей.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* 4. Условия обработки и передачи данных */}
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 text-sm font-bold">4</span>
                  Условия обработки и передачи данных
                </h2>
                <div className="space-y-3 text-gray-700 leading-relaxed">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p><strong>4.1.</strong> Мы обязуемся не разглашать полученные от вас данные, за исключением случаев, когда это необходимо для:</p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li><strong>Исполнения вашего заказа:</strong> Мы можем передать ваши контактные данные и адрес доставки курьерским службам, почтовым операторам и логистическим партнерам.</li>
                      <li><strong>Обработки платежей:</strong> Данные, необходимые для проведения платежа (например, номер заказа, сумма), передаются в банк-эквайер или платежную систему.</li>
                      <li><strong>Выполнения требований законодательства:</strong> Мы можем раскрыть ваши данные по законному запросу государственных органов (например, суда, ФНС, органов следствия).</li>
                      <li><strong>Обеспечения безопасности:</strong> Для защиты от мошенничества и обеспечения безопасности наших систем.</li>
                    </ul>
                  </div>
                  <p><strong>4.2.</strong> Мы не передаем ваши персональные данные третьим лицам для их независимых маркетинговых целей без вашего прямого согласия.</p>
                </div>
              </section>

              {/* 5. Использование файлов Cookie */}
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 text-sm font-bold">5</span>
                  Использование файлов Cookie
                </h2>
                <div className="space-y-3 text-gray-700 leading-relaxed">
                  <p><strong>5.1.</strong> Сайт использует файлы cookie и аналогичные технологии для улучшения вашего пользовательского опыта, анализа трафика и показа релевантной рекламы (ретаргетинга).</p>
                  <p><strong>5.2.</strong> Вы можете отключить использование файлов cookie в настройках вашего браузера, однако это может ограничить функциональность Сайта.</p>
                </div>
              </section>

              {/* 6. Защита данных */}
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 text-sm font-bold">6</span>
                  Защита данных
                </h2>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <p className="text-gray-700"><strong>6.1.</strong> Мы принимаем необходимые и достаточные организационные и технические меры для защиты ваших данных от неправомерного или случайного доступа, уничтожения, изменения, блокирования, копирования, распространения, а также от иных неправомерных действий.</p>
                  </div>
                </div>
              </section>

              {/* 7. Ваши права */}
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 text-sm font-bold">7</span>
                  Ваши права
                </h2>
                <div className="space-y-3 text-gray-700 leading-relaxed">
                  <p><strong>7.1.</strong> Вы имеете право:</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                      <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="text-sm">На доступ к своим персональным данным и их уточнение</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                      <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                      <span className="text-sm">На отзыв согласия на обработку персональных данных</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                      <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span className="text-sm">Требовать удаления ваших персональных данных</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                      <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm">Направить запрос на info@protekauto.ru</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 italic mt-3">* За исключением случаев, когда мы обязаны хранить их в соответствии с законодательством (например, данные о финансовых операциях для налоговой отчетности хранятся в течение установленного законом срока).</p>
                </div>
              </section>

              {/* 8. Обратная связь */}
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 text-sm font-bold">8</span>
                  Обратная связь
                </h2>
                <div className="space-y-3 text-gray-700 leading-relaxed">
                  <p><strong>8.1.</strong> По всем вопросам, связанным с обработкой ваших данных и настоящей Политикой конфиденциальности, вы можете обращаться к нам:</p>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white flex-shrink-0">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Электронная почта</p>
                          <a href="mailto:info@protekauto.ru" className="font-semibold text-blue-600 hover:text-blue-700">info@protekauto.ru</a>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white flex-shrink-0">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Почтовый адрес</p>
                          <p className="font-semibold text-gray-900">Юридический адрес ООО «ПРОТЕК»</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 9. Заключительные положения */}
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 text-sm font-bold">9</span>
                  Заключительные положения
                </h2>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-700"><strong>9.1.</strong> Мы оставляем за собой право вносить изменения в настоящую Политику конфиденциальности. Новая редакция Политики вступает в силу с момента ее размещения на Сайте. При продолжении использования Сайта после внесения изменений вы соглашаетесь с новой редакцией Политики.</p>
                </div>
              </section>

              {/* Footer info */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <p className="text-sm text-gray-500">
                    Документ составлен в соответствии с ФЗ-152 «О персональных данных»
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Вернуться на главную
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default PrivacyPolicy;
