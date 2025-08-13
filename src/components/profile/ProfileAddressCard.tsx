import React from "react";

type ProfileAddressCardProps = {
  type: string;
  title: string;
  address: string;
  storagePeriod?: string;
  workTime?: string;
  comment?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onSelectMain?: () => void;
  isMain?: boolean;
};

const ProfileAddressCard: React.FC<ProfileAddressCardProps> = ({
  type,
  title,
  address,
  storagePeriod,
  workTime,
  comment,
  onEdit,
  onDelete,
  onSelectMain,
  isMain
}) => (
  <div className="flex flex-col justify-between items-start self-stretch p-8 bg-white rounded-lg border border-solid border-stone-300 sm:min-w-[340px] min-w-[200px] max-w-[404px] flex-[1_0_0] max-md:max-w-[350px] max-sm:p-5 max-sm:max-w-full">
    <div className="flex flex-col gap-1.5 items-start self-stretch pb-8">
      <div className="relative text-base leading-6 text-gray-950">{type}</div>
      <div className="relative self-stretch text-xl font-bold leading-7 text-gray-950">{title}</div>
      <div className="relative self-stretch text-base leading-6 text-gray-950">{address}</div>
    </div>
    <div className="flex flex-col gap-5 items-start self-stretch">
      {storagePeriod && workTime && (
        <div className="flex gap-5 items-start self-stretch max-sm:flex-col max-sm:gap-4">
          <div className="flex flex-col gap-2 items-start flex-[1_0_0] min-w-[132px] max-sm:min-w-full">
            <div className="overflow-hidden relative self-stretch text-sm leading-5 text-gray-600 text-ellipsis">Срок хранения</div>
            <div className="overflow-hidden relative self-stretch text-lg font-medium leading-5 text-ellipsis text-gray-950">{storagePeriod}</div>
          </div>
          <div className="flex flex-col gap-2 items-start flex-[1_0_0] min-w-[132px] max-sm:min-w-full">
            <div className="overflow-hidden relative self-stretch text-sm leading-5 text-gray-600 text-ellipsis">Ежедневно</div>
            <div className="overflow-hidden relative text-lg font-medium leading-5 text-ellipsis text-gray-950">{workTime}</div>
          </div>
        </div>
      )}
      {comment && (
        <div className="flex flex-col gap-2 items-start self-stretch min-w-[160px]">
          <div className="relative self-stretch text-sm leading-5 text-gray-600">Комментарий</div>
          <div className="relative self-stretch text-base leading-5 text-gray-950 break-words">
  {comment}
</div>
        </div>
      )}
      <div className="flex justify-between items-start self-stretch max-sm:flex-row max-sm:gap-4 max-sm:justify-start max-sm:items-center">
        <div
          className="flex gap-1.5 items-center cursor-pointer group"
          onClick={onEdit}
          role="button"
          tabIndex={0}
          aria-label="Редактировать адрес"
          onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onEdit && onEdit()}
          onMouseEnter={e => {
            const svg = (e.currentTarget as HTMLElement).querySelector('img');
            if (svg) (svg as HTMLImageElement).style.filter = 'invert(32%) sepia(97%) saturate(7490%) hue-rotate(355deg) brightness(97%) contrast(108%)';
          }}
          onMouseLeave={e => {
            const svg = (e.currentTarget as HTMLElement).querySelector('img');
            if (svg) (svg as HTMLImageElement).style.filter = '';
          }}
        >
          <img src="/images/edit.svg" alt="edit" width={18} height={18} className="mr-1.5" />
          <div className="relative text-sm leading-5 text-gray-600 group-hover:text-red-600 max-sm:hidden">Редактировать</div>
        </div>
        <div
          className="flex gap-1.5 items-center cursor-pointer group"
          role="button"
          tabIndex={0}
          aria-label="Удалить адрес"
          onClick={onDelete}
          onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onDelete && onDelete()}
          onMouseEnter={e => {
            const path = e.currentTarget.querySelector('path');
            if (path) path.setAttribute('fill', '#ec1c24');
          }}
          onMouseLeave={e => {
            const path = e.currentTarget.querySelector('path');
            if (path) path.setAttribute('fill', '#D0D0D0');
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M4.625 17.5C4.14375 17.5 3.73192 17.3261 3.3895 16.9782C3.04708 16.6304 2.87558 16.2117 2.875 15.7222V4.16667H2V2.38889H6.375V1.5H11.625V2.38889H16V4.16667H15.125V15.7222C15.125 16.2111 14.9538 16.6298 14.6114 16.9782C14.269 17.3267 13.8568 17.5006 13.375 17.5H4.625ZM6.375 13.9444H8.125V5.94444H6.375V13.9444ZM9.875 13.9444H11.625V5.94444H9.875V13.9444Z"
              fill="#D0D0D0"
              style={{ transition: 'fill 0.2s' }}
            />
          </svg>
          <div className="relative text-sm leading-5 text-gray-600 group-hover:text-red-600 max-sm:hidden">Удалить</div>
        </div>
      </div>
      {onSelectMain && (
        <div className="flex gap-1.5 items-center cursor-pointer mt-4" onClick={onSelectMain}>
          <div className="relative flex items-center justify-center aspect-[1/1] h-[18px] w-[18px]">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ width: 18, height: 18, flexShrink: 0 }}>
              <circle cx="9" cy="9" r="8.5" stroke="#EC1C24" />
            </svg>
            {isMain && (
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 10,
                  height: 10,
                  flexShrink: 0,
                }}
              >
                <circle cx="5" cy="5" r="5" fill="#EC1C24" />
              </svg>
            )}
          </div>
          <div className="relative text-sm leading-5 text-gray-600">Выбрать как основной адрес</div>
        </div>
      )}
    </div>
  </div>
);

export default ProfileAddressCard; 