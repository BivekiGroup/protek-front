import * as React from "react";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onRequestLogin?: () => void;
}

const images = [
  "https://api.builder.io/api/v1/image/assets/TEMP/1dece40aba41b14dc29420e73511605e2c90a70d?width=240",
  "https://api.builder.io/api/v1/image/assets/TEMP/c2d4b804d398a9774a78bbbb733b07f8ca28b615?width=240",
  "https://api.builder.io/api/v1/image/assets/TEMP/0ef9d54b1df023cf88d94604cb322ad1dc512f85?width=240",
];

export const AuthModal: React.FC<AuthModalProps> = ({ open, onClose, onRequestLogin }) => {
  if (!open) return null;
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 bg-opacity-50 transition-opacity"
        onClick={onClose}
        style={{ animation: "fadeIn 0.2s" }}
      >
        <div
          layer-name="Step1"
          className="box-border flex relative flex-col gap-8 items-start p-8 max-w-full bg-white rounded-3xl w-[1130px] max-md:p-6 max-md:mx-auto max-md:my-0 max-md:w-full max-md:max-w-[800px] max-sm:p-4 max-sm:rounded-2xl max-sm:w-[95vw] max-sm:max-w-xs max-sm:mx-auto max-sm:max-h-[70vh] max-sm:overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex relative flex-col gap-8 items-start w-full">
            <div className="flex relative flex-col gap-3 items-start w-full">
              <div className="flex relative justify-between items-center w-full">
                <div
                  layer-name="Войдите, чтобы продолжить"
                  className="relative max-w-full text-4xl font-bold leading-[50.4px] text-gray-950 w-[600px] max-md:w-full max-md:text-3xl max-sm:text-3xl max-sm:leading-9"
                >
                  Войдите, чтобы продолжить
                </div>
                <div>
                  <div
                    onClick={onClose}
                    style={{ cursor: "pointer" }}
                    dangerouslySetInnerHTML={{
                      __html:
                        '<svg id="154:4915" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" class="close-icon" style="width: 17.5px; height: 17.5px; fill: #000814; position: relative; cursor: pointer"><path d="M2.25 17.75L0.5 16L7.5 9L0.5 2L2.25 0.25L9.25 7.25L16.25 0.25L18 2L11 9L18 16L16.25 17.75L9.25 10.75L2.25 17.75Z" fill="#000814"></path></svg>',
                    }}
                  />
                </div>
              </div>
              <div
                layer-name="Эта страница доступна только авторизованным пользователям. После входа вы сможете пользоваться всеми возможностями:"
                className="relative w-full text-lg leading-6 text-gray-600 max-sm:text-base"
              >
                Эта страница <span className="text-red-600">доступна только авторизованным пользователям</span>. После входа вы сможете пользоваться всеми возможностями:
              </div>
            </div>
            <div className="flex relative gap-4 items-start w-full max-md:flex-col max-md:gap-3 max-sm:hidden">
              {images.map((image, idx) => (
                <div
                  key={idx}
                  className="flex relative flex-col gap-2 justify-center items-center p-5 bg-slate-50 flex-[1_0_0] rounded-[32px] max-md:p-4 max-sm:p-3 max-sm:rounded-3xl"
                >
                  <div
                    style={{
                      backgroundImage: `url(${image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      width: "120px",
                      height: "120px",
                      borderRadius: "24px",
                    }}
                    className="relative aspect-[1/1] h-[120px] w-[120px] max-md:h-[100px] max-md:w-[100px] max-sm:w-20 max-sm:h-20"
                  />
                  <div className="flex relative flex-col gap-2 items-start w-full">
                    <div
                      layer-name={
                        [
                          "Добавляйте авто в гараж",
                          "Сохраняйте избранное",
                          "Отслеживайте заказы",
                        ][idx]
                      }
                      className="relative w-full text-2xl font-bold leading-8 text-center text-gray-950 max-md:text-xl max-sm:text-lg"
                    >
                      {[
                        "Добавляйте авто в гараж",
                        "Сохраняйте избранное",
                        "Отслеживайте заказы",
                      ][idx]}
                    </div>
                    <div
                      layer-name={
                        [
                          "Для быстрого подбора",
                          "Не теряйте важные товары и подборки",
                          "Статусы, история и повторные покупки",
                        ][idx]
                      }
                      className="relative w-full text-base leading-6 text-center text-zinc-900 max-md:text-base max-sm:text-sm"
                    >
                      {[
                        "Для быстрого подбора",
                        "Не теряйте важные товары и подборки",
                        "Статусы, история и повторные покупки",
                      ][idx]}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex relative gap-4 items-start max-md:flex-col max-md:gap-3 max-md:w-full">
              <div
                layer-name="button_icon"
                className="flex relative gap-3.5 items-center px-8 py-5 bg-red-600 rounded-xl cursor-pointer duration-[0.2s] ease-[ease] transition-[background-color] max-md:justify-center max-md:w-full max-sm:px-6 max-sm:py-4"
                onClick={onRequestLogin}
              >
                <div>
                  <div
                    dangerouslySetInnerHTML={{
                      __html:
                        '<svg id="I154:4934;1120:2897" data-component-name="Frame" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="login-icon" style="width: 24px; height: 24px; position: relative"><path d="M10 17L15 12L10 7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M15 12H3" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
                    }}
                  />
                </div>
                <div
                  layer-name="+7 (495) 260-20-60"
                  className="relative text-lg leading-5 text-white max-sm:text-base"
                >
                  Войти или зарегистрироваться
                </div>
              </div>
              <div
                layer-name="ABig_Button"
                className="flex relative gap-2.5 justify-center items-center px-8 py-5 h-16 rounded-xl border border-red-600 border-solid transition-all cursor-pointer duration-[0.2s] ease-[ease] max-md:justify-center max-md:w-full max-sm:px-6 max-sm:py-4"
                onClick={() => window.location.href = '/'}
              >
                <div
                  layer-name="Button Big"
                  className="relative text-lg leading-5 text-center text-black max-sm:text-base"
                >
                  На главную
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default AuthModal;
