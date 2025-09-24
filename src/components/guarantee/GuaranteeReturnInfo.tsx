import React from "react";

const GuaranteeReturnInfo = () => (
    <div className="flex flex-col w-full max-md:max-w-full">
      <div className="text-3xl font-bold leading-tight text-gray-950">
        Условия возврата
      </div>
      <div className="flex flex-wrap gap-5 items-center mt-8 w-full max-md:max-w-full">
        <div className="flex flex-col grow shrink self-stretch px-8 py-8 my-auto rounded-2xl border border-red-600 border-solid min-h-[158px] min-w-[240px] w-[656px] max-md:px-5 max-md:max-w-full">
          <div className="text-2xl font-semibold leading-tight text-gray-950 max-md:max-w-full">
            Срок возврата — 14 дней
          </div>
          <div className="mt-3.5 text-lg leading-6 text-gray-600 max-md:max-w-full">
            Товар можно вернуть в течение двух недель, если он не использовался и сохранён товарный вид
          </div>
        </div>
        <div className="flex flex-col grow shrink self-stretch px-8 py-8 my-auto rounded-2xl border border-red-600 border-solid min-h-[158px] min-w-[240px] w-[656px] max-md:px-5 max-md:max-w-full">
          <div className="text-2xl font-semibold leading-tight text-gray-950 max-md:max-w-full">
            Гарантия на качество
          </div>
          <div className="mt-3.5 text-lg leading-6 text-gray-600 max-md:max-w-full">
            Изделия ненадлежащего качества подлежат возврату в течение всего гарантийного срока
          </div>
        </div>
        <div className="flex flex-col grow shrink self-stretch px-8 pt-8 pb-14 my-auto rounded-2xl border border-red-600 border-solid min-h-[158px] min-w-[240px] w-[656px] max-md:px-5 max-md:max-w-full">
          <div className="text-2xl font-semibold leading-tight text-gray-950 max-md:max-w-full">
            Возврат средств
          </div>
          <div className="mt-3.5 text-lg leading-snug text-gray-600 max-md:max-w-full">
            Деньги перечисляются тем же способом, которым клиент ранее произвёл оплату
          </div>
        </div>
        <div className="flex flex-col grow shrink self-stretch px-8 pt-8 pb-14 my-auto rounded-2xl border border-red-600 border-solid min-h-[158px] min-w-[240px] w-[656px] max-md:px-5 max-md:max-w-full">
          <div className="text-2xl font-semibold leading-tight text-gray-950 max-md:max-w-full">
            Документы для возврата
          </div>
          <div className="mt-3.5 text-lg leading-snug text-gray-600 max-md:max-w-full">
            Необходимо заявление и чек (или электронный чек из личного кабинета)
          </div>
        </div>
      </div>
    </div>

);

export default GuaranteeReturnInfo;
