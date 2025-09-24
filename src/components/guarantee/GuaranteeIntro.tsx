import React from "react";
import { useRouter } from "next/router";

const GuaranteeIntro = () => {
  const router = useRouter();
  return (
    <div className="w-layout-blockcontainer container w-container">
      <div className="flex flex-wrap gap-6 w-full min-h-[392px] max-md:max-w-full">
        <div className="flex flex-col flex-1 shrink p-10 my-auto bg-white rounded-3xl basis-0 min-w-[240px] max-md:px-5 max-md:max-w-full">
          <div className="flex flex-col w-full max-md:max-w-full">
            <div className="text-3xl font-bold leading-tight text-gray-950 max-md:max-w-full">
              Возврат и гарантия Protek Авто
            </div>
            <div className="mt-3 text-base leading-snug text-zinc-900 max-md:max-w-full">
              Мы ценим ваше доверие и делаем процесс возврата простым и прозрачным
            </div>
          </div>
          <div className="flex flex-col mt-8 w-full text-base leading-snug max-w-[735px] min-h-[112px] text-zinc-900 max-md:max-w-full">
            <div className="flex flex-wrap gap-4 w-full max-md:max-w-full">
              <img
                loading="lazy"
                src="https://api.builder.io/api/v1/image/assets/f5bc5a2dc9b841d0aba1cc6c74a35920/d429efc9331a1431693eef40a118910ad20fbcd8?apiKey=f5bc5a2dc9b841d0aba1cc6c74a35920&"
                className="object-contain shrink-0 self-start w-6 aspect-square"
              />
              <div className="flex-1 shrink basis-0 text-zinc-900 max-md:max-w-full">
                Просто – возврат можно оформить онлайн или в пункте выдачи
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-4 w-full max-md:max-w-full">
              <img
                loading="lazy"
                src="https://api.builder.io/api/v1/image/assets/f5bc5a2dc9b841d0aba1cc6c74a35920/d429efc9331a1431693eef40a118910ad20fbcd8?apiKey=f5bc5a2dc9b841d0aba1cc6c74a35920&"
                className="object-contain shrink-0 self-start w-6 aspect-square"
              />
              <div className="flex-1 shrink basis-0 text-zinc-900 max-md:max-w-full">
                Прозрачно – понятные правила, без скрытых условий
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-4 w-full max-md:max-w-full">
              <img
                loading="lazy"
                src="https://api.builder.io/api/v1/image/assets/f5bc5a2dc9b841d0aba1cc6c74a35920/d429efc9331a1431693eef40a118910ad20fbcd8?apiKey=f5bc5a2dc9b841d0aba1cc6c74a35920&"
                className="object-contain shrink-0 self-start w-6 aspect-square"
              />
              <div className="flex-1 shrink basis-0 text-zinc-900 max-md:max-w-full">
                Надёжно – гарантия качества на все товары от производителей
              </div>
            </div>
          </div>
          <div
            className="flex gap-2.5 justify-center items-center self-start px-10 py-6 mt-8 text-lg font-medium leading-tight text-center text-white bg-red-600 rounded-xl max-md:px-5 cursor-pointer transition hover:bg-red-700"
            onClick={() => router.push("/profile-acts")}
            tabIndex={0}
            role="button"
            style={{ outline: "none" }}
          >
            <div className="self-stretch my-auto text-white">
              Оформить возврат
            </div>
          </div>
        </div>
        <img
          loading="lazy"
          srcSet="https://api.builder.io/api/v1/image/assets/f5bc5a2dc9b841d0aba1cc6c74a35920/7e7a7598a09b334934fe0ea9d5fc22afbcb84a90?apiKey=f5bc5a2dc9b841d0aba1cc6c74a35920&width=100 100w, https://api.builder.io/api/v1/image/assets/f5bc5a2dc9b841d0aba1cc6c74a35920/7e7a7598a09b334934fe0ea9d5fc22afbcb84a90?apiKey=f5bc5a2dc9b841d0aba1cc6c74a35920&width=200 200w, https://api.builder.io/api/v1/image/assets/f5bc5a2dc9b841d0aba1cc6c74a35920/7e7a7598a09b334934fe0ea9d5fc22afbcb84a90?apiKey=f5bc5a2dc9b841d0aba1cc6c74a35920&width=400 400w, https://api.builder.io/api/v1/image/assets/f5bc5a2dc9b841d0aba1cc6c74a35920/7e7a7598a09b334934fe0ea9d5fc22afbcb84a90?apiKey=f5bc5a2dc9b841d0aba1cc6c74a35920&width=800 800w, https://api.builder.io/api/v1/image/assets/f5bc5a2dc9b841d0aba1cc6c74a35920/7e7a7598a09b334934fe0ea9d5fc22afbcb84a90?apiKey=f5bc5a2dc9b841d0aba1cc6c74a35920&width=1200 1200w, https://api.builder.io/api/v1/image/assets/f5bc5a2dc9b841d0aba1cc6c74a35920/7e7a7598a09b334934fe0ea9d5fc22afbcb84a90?apiKey=f5bc5a2dc9b841d0aba1cc6c74a35920&width=1600 1600w, https://api.builder.io/api/v1/image/assets/f5bc5a2dc9b841d0aba1cc6c74a35920/7e7a7598a09b334934fe0ea9d5fc22afbcb84a90?apiKey=f5bc5a2dc9b841d0aba1cc6c74a35920&width=2000 2000w, https://api.builder.io/api/v1/image/assets/f5bc5a2dc9b841d0aba1cc6c74a35920/7e7a7598a09b334934fe0ea9d5fc22afbcb84a90?apiKey=f5bc5a2dc9b841d0aba1cc6c74a35920&"
          className="object-contain flex-1 shrink w-full aspect-[2.09] basis-20 min-w-[240px] max-md:max-w-full"
        />
      </div>
      <div className="flex flex-col mt-6 w-full max-md:max-w-full">
        <div className="flex flex-wrap gap-6 items-start w-full max-md:max-w-full">
          <div className="flex flex-wrap gap-5 items-start p-8 bg-white rounded-3xl min-w-[240px] w-[520px] h-[178px] max-md:px-5 max-md:max-w-full max-md:h-auto">
            <img
              loading="lazy"
              srcSet="https://api.builder.io/api/v1/image/assets/f5bc5a2dc9b841d0aba1cc6c74a35920/0f9f66ee7f940af7b8b4f9fa6c2913fc2849e8a2?apiKey=f5bc5a2dc9b841d0aba1cc6c74a35920&width=100 100w, https://api.builder.io/api/v1/image/assets/f5bc5a2dc9b841d0aba1cc6c74a35920/0f9f66ee7f940af7b8b4f9fa6c2913fc2849e8a2?apiKey=f5bc5a2dc9b841d0aba1cc6c74a35920&width=200 200w, https://api.builder.io/api/v1/image/assets/f5bc5a2dc9b841d0aba1cc6c74a35920/0f9f66ee7f940af7b8b4f9fa6c2913fc2849e8a2?apiKey=f5bc5a2dc9b841d0aba1cc6c74a35920&width=400 400w, https://api.builder.io/api/v1/image/assets/f5bc5a2dc9b841d0aba1cc6c74a35920/0f9f66ee7f940af7b8b4f9fa6c2913fc2849e8a2?apiKey=f5bc5a2dc9b841d0aba1cc6c74a35920&width=800 800w, https://api.builder.io/api/v1/image/assets/f5bc5a2dc9b841d0aba1cc6c74a35920/0f9f66ee7f940af7b8b4f9fa6c2913fc2849e8a2?apiKey=f5bc5a2dc9b841d0aba1cc6c74a35920&width=1200 1200w, https://api.builder.io/api/v1/image/assets/f5bc5a2dc9b841d0aba1cc6c74a35920/0f9f66ee7f940af7b8b4f9fa6c2913fc2849e8a2?apiKey=f5bc5a2dc9b841d0aba1cc6c74a35920&width=1600 1600w, https://api.builder.io/api/v1/image/assets/f5bc5a2dc9b841d0aba1cc6c74a35920/0f9f66ee7f940af7b8b4f9fa6c2913fc2849e8a2?apiKey=f5bc5a2dc9b841d0aba1cc6c74a35920&width=2000 2000w, https://api.builder.io/api/v1/image/assets/f5bc5a2dc9b841d0aba1cc6c74a35920/0f9f66ee7f940af7b8b4f9fa6c2913fc2849e8a2?apiKey=f5bc5a2dc9b841d0aba1cc6c74a35920&"
              className="object-contain shrink-0 aspect-square w-[90px]"
            />
            <div className="flex flex-col flex-1 shrink basis-0 min-w-[240px]">
              <div className="text-3xl font-semibold leading-tight text-gray-950">
                Оригинальные детали
              </div>
              <div className="mt-3 text-base leading-6 text-gray-600">
                Мы продаём только сертифицированные автозапчасти от производителей и дистрибьюторов
              </div>
            </div>
          </div>
          <div className="flex flex-wrap flex-1 shrink gap-5 items-start p-8 bg-white rounded-3xl basis-0 min-w-[240px] w-[520px] h-[178px] max-md:px-5 max-md:max-w-full max-md:h-auto">
            <img
              loading="lazy"
              srcSet="https://api.builder.io/api/v1/image/assets/f5bc5a2dc9b841d0aba1cc6c74a35920/e47e593c65f65a12079d1b80c349c0295b37bb75?apiKey=f5bc5a2dc9b841d0aba1cc6c74a35920&width=100 100w, https://api.builder.io/api/v1/image/assets/f5bc5a2dc9b841d0aba1cc6c74a35920/e47e593c65f65a12079d1b80c349c0295b37bb75?apiKey=f5bc5a2dc9b841d0aba1cc6c74a35920&width=200 200w, https://api.builder.io/api/v1/image/assets/f5bc5a2dc9b841d0aba1cc6c74a35920/e47e593c65f65a12079d1b80c349c0295b37bb75?apiKey=f5bc5a2dc9b841d0aba1cc6c74a35920&width=400 400w, https://api.builder.io/api/v1/image/assets/f5bc5a2dc9b841d0aba1cc6c74a35920/e47e593c65f65a12079d1b80c349c0295b37bb75?apiKey=f5bc5a2dc9b841d0aba1cc6c74a35920&width=800 800w, https://api.builder.io/api/v1/image/assets/f5bc5a2dc9b841d0aba1cc6c74a35920/e47e593c65f65a12079d1b80c349c0295b37bb75?apiKey=f5bc5a2dc9b841d0aba1cc6c74a35920&width=1200 1200w, https://api.builder.io/api/v1/image/assets/f5bc5a2dc9b841d0aba1cc6c74a35920/e47e593c65f65a12079d1b80c349c0295b37bb75?apiKey=f5bc5a2dc9b841d0aba1cc6c74a35920&width=1600 1600w, https://api.builder.io/api/v1/image/assets/f5bc5a2dc9b841d0aba1cc6c74a35920/e47e593c65f65a12079d1b80c349c0295b37bb75?apiKey=f5bc5a2dc9b841d0aba1cc6c74a35920&width=2000 2000w, https://api.builder.io/api/v1/image/assets/f5bc5a2dc9b841d0aba1cc6c74a35920/e47e593c65f65a12079d1b80c349c0295b37bb75?apiKey=f5bc5a2dc9b841d0aba1cc6c74a35920&"
              className="object-contain shrink-0 aspect-square w-[90px]"
            />
            <div className="flex flex-col flex-1 shrink basis-0 min-w-[240px]">
              <div className="text-3xl font-semibold leading-tight text-gray-950">
                Срок гарантии
              </div>
              <div className="mt-3 text-base leading-6 text-gray-600">
                Гарантийные обязательства сохраняются весь период, установленный заводом-изготовителем
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-5 items-start p-8 bg-white rounded-3xl min-w-[240px] w-[520px] h-[178px] max-md:px-5 max-md:max-w-full max-md:h-auto">
            <img
              loading="lazy"
              srcSet="https://api.builder.io/api/v1/image/assets/f5bc5a2dc9b841d0aba1cc6c74a35920/954c2a882cfeb659a12b6115c20447e32561d904?apiKey=f5bc5a2dc9b841d0aba1cc6c74a35920&width=100 100w, https://api.builder.io/api/v1/image/assets/f5bc5a2dc9b841d0aba1cc6c74a35920/954c2a882cfeb659a12b6115c20447e32561d904?apiKey=f5bc5a2dc9b841d0aba1cc6c74a35920&width=200 200w, https://api.builder.io/api/v1/image/assets/f5bc5a2dc9b841d0aba1cc6c74a35920/954c2a882cfeb659a12b6115c20447e32561d904?apiKey=f5bc5a2dc9b841d0aba1cc6c74a35920&width=400 400w, https://api.builder.io/api/v1/image/assets/f5bc5a2dc9b841d0aba1cc6c74a35920/954c2a882cfeb659a12b6115c20447e32561d904?apiKey=f5bc5a2dc9b841d0aba1cc6c74a35920&width=800 800w, https://api.builder.io/api/v1/image/assets/f5bc5a2dc9b841d0aba1cc6c74a35920/954c2a882cfeb659a12b6115c20447e32561d904?apiKey=f5bc5a2dc9b841d0aba1cc6c74a35920&width=1200 1200w, https://api.builder.io/api/v1/image/assets/f5bc5a2dc9b841d0aba1cc6c74a35920/954c2a882cfeb659a12b6115c20447e32561d904?apiKey=f5bc5a2dc9b841d0aba1cc6c74a35920&width=1600 1600w, https://api.builder.io/api/v1/image/assets/f5bc5a2dc9b841d0aba1cc6c74a35920/954c2a882cfeb659a12b6115c20447e32561d904?apiKey=f5bc5a2dc9b841d0aba1cc6c74a35920&width=2000 2000w, https://api.builder.io/api/v1/image/assets/f5bc5a2dc9b841d0aba1cc6c74a35920/954c2a882cfeb659a12b6115c20447e32561d904?apiKey=f5bc5a2dc9b841d0aba1cc6c74a35920&"
              className="object-contain shrink-0 aspect-square w-[90px]"
            />
            <div className="flex flex-col flex-1 shrink basis-0 min-w-[240px]">
              <div className="text-3xl font-semibold leading-tight text-gray-950">
                Возврат и замена
              </div>
              <div className="mt-3 text-base leading-6 text-gray-600">
                В случае брака проводится экспертиза, после чего товар заменяется или возвращаются деньги.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuaranteeIntro;
