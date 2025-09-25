import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";

interface FaqItem {
  question: string;
  answer: string;
}

const mockFaq: FaqItem[] = [
  {
    question: "Можно ли вернуть товар без чека?",
    answer:
      "Да, возврат возможен и без бумажного чека. Достаточно электронного чека или информации о заказе в личном кабинете. Главное — чтобы товар сохранил свой вид и комплектность.",
  },
  {
    question: "Кто оплачивает доставку при возврате?",
    answer:
      "Обычно доставку оплачивает покупатель, если иное не предусмотрено законом или условиями возврата.",
  },
  {
    question: "Что делать, если пришёл бракованный товар?",
    answer:
      "В случае брака проводится экспертиза, после чего товар заменяется или возвращаются деньги.",
  },
  {
    question: "Можно ли обменять товар вместо возврата?",
    answer:
      "Да, возможен обмен товара, если он не был в употреблении и сохранён товарный вид.",
  },
  {
    question: "В какие сроки возвращаются деньги?",
    answer:
      "Деньги возвращаются тем же способом, которым была произведена оплата, в течение 3-10 рабочих дней после одобрения возврата.",
  },
];

const FaqAccordion: React.FC<{ items: FaqItem[] }> = ({ items }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (openIndex !== null && contentRefs.current[openIndex]) {
      contentRefs.current[openIndex]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [openIndex]);

  return (
    <div className="flex flex-col mt-8 w-full leading-snug max-md:max-w-full">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className={`flex flex-col bg-white rounded-3xl mb-4 transition-all duration-200 ${isOpen ? 'shadow-lg' : ''}`}
          >
            <button
              className="flex items-center justify-between w-full text-2xl font-semibold text-gray-950 px-8 py-6 focus:outline-none max-md:px-5 max-md:max-w-full"
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              aria-expanded={isOpen}
              style={{ fontWeight: 600 }}
            >
              <span className="text-left mr-4">{item.question}</span>
              <span
                className={`ml-auto transition-transform duration-300 text-2xl ${isOpen ? 'rotate-180' : ''}`}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 10L12 15L17 10" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </button>
            <div
              ref={(el) => {
                contentRefs.current[idx] = el;
              }}
              style={{
                maxHeight: isOpen ? contentRefs.current[idx]?.scrollHeight : 0,
                opacity: isOpen ? 1 : 0,
                overflow: 'hidden',
                transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s',
              }}
            >
              <div className="px-8 pb-6 text-base text-gray-600 max-md:px-5 max-md:max-w-full">
                {item.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const GuaranteeReturnHelp = () => {
  const router = useRouter();
  const handleOpenAuth = () => {
    const nextQuery = { ...router.query, openAuth: '1' } as Record<string, any>;
    router.push({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true });
  };

  return (
    <>
      <div className="flex flex-col p-8 mt-16 w-full bg-white rounded-3xl max-md:px-5 max-md:mt-10 max-md:max-w-full">
        <div className="text-3xl font-bold leading-tight text-gray-950 max-md:max-w-full">
          Как оформить возврат
        </div>
        <div className="flex flex-wrap gap-2.5 items-start mt-8 w-full text-base leading-6 text-gray-950 max-md:max-w-full">
          <div className="flex flex-1 shrink gap-2.5 justify-center items-center pt-5 basis-0 min-w-[230px] w-[230px] max-sm:w-auto max-sm:max-w-full">
            <div className="flex-1 shrink self-stretch my-auto basis-0 text-gray-950 w-[230px] max-sm:w-auto max-sm:max-w-full">
              <span className="text-red-600 cursor-pointer " onClick={handleOpenAuth} tabIndex={0} role="button">Авторизуйтесь</span> в личном кабинете
            </div>
          </div>
          <img
            loading="lazy"
            src="https://api.builder.io/api/v1/image/assets/f5bc5a2dc9b841d0aba1cc6c74a35920/24bc9386453b872f69d1065836aa4283c4a9c297?apiKey=f5bc5a2dc9b841d0aba1cc6c74a35920&"
            className="object-contain shrink-0 aspect-square w-[60px]"
          />
          <div className="flex flex-1 shrink gap-2.5 justify-center items-center pt-5 basis-0 min-w-[230px] w-[230px] max-sm:w-auto max-sm:max-w-full">
            <div className="flex-1 shrink self-stretch my-auto basis-0 text-gray-950 w-[230px] max-sm:w-auto max-sm:max-w-full">
              <span className="text-red-600">Выберите заказ</span> и нажмите <span className="text-red-600">«Вернуть товар»</span>
            </div>
          </div>
          <img
            loading="lazy"
            src="https://api.builder.io/api/v1/image/assets/f5bc5a2dc9b841d0aba1cc6c74a35920/24bc9386453b872f69d1065836aa4283c4a9c297?apiKey=f5bc5a2dc9b841d0aba1cc6c74a35920&"
            className="object-contain shrink-0 aspect-square w-[60px]"
          />
          <div className="flex flex-1 shrink gap-2.5 justify-center items-center pt-5 leading-snug basis-0 min-w-[230px] w-[230px] max-sm:w-auto max-sm:max-w-full">
            <div className="flex-1 shrink self-stretch my-auto basis-0 text-gray-950 w-[230px] max-sm:w-auto max-sm:max-w-full">
              Укажите причину возврата
            </div>
          </div>
          <img
            loading="lazy"
            src="https://api.builder.io/api/v1/image/assets/f5bc5a2dc9b841d0aba1cc6c74a35920/24bc9386453b872f69d1065836aa4283c4a9c297?apiKey=f5bc5a2dc9b841d0aba1cc6c74a35920&"
            className="object-contain shrink-0 aspect-square w-[60px]"
          />
          <div className="flex flex-1 shrink gap-2.5 justify-center items-center pt-5 basis-0 min-w-[230px] w-[230px] max-sm:w-auto max-sm:max-w-full">
            <div className="flex-1 shrink self-stretch my-auto basis-0 text-gray-950 w-[230px] max-sm:w-auto max-sm:max-w-full">
              Отправьте товар нам или принесите в пункт выдачи
            </div>
          </div>
          <img
            loading="lazy"
            src="https://api.builder.io/api/v1/image/assets/f5bc5a2dc9b841d0aba1cc6c74a35920/24bc9386453b872f69d1065836aa4283c4a9c297?apiKey=f5bc5a2dc9b841d0aba1cc6c74a35920&"
            className="object-contain shrink-0 aspect-square w-[60px]"
          />
          <div className="flex flex-1 shrink gap-2.5 justify-center items-center pt-5 basis-0 min-w-[230px] w-[230px] max-sm:w-auto max-sm:max-w-full">
            <div className="flex-1 shrink self-stretch my-auto basis-0 text-gray-950 w-[230px] max-sm:w-auto max-sm:max-w-full">
              Получите подтверждение и возврат денег
            </div>
          </div>
        </div>
      </div>
      {/* Частые вопросы */}
      <div className="flex flex-col mt-16 w-full max-md:mt-10 max-md:max-w-full">
        <div className="text-3xl font-bold leading-tight text-gray-950">
          Частые вопросы
        </div>
        <FaqAccordion items={mockFaq} />
      </div>
    </>
  );
};

export default GuaranteeReturnHelp;
