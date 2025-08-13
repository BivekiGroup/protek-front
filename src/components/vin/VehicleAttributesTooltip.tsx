import React from 'react';

interface VehicleAttribute {
  key: string;
  name: string;
  value: string;
}

interface VehicleAttributesTooltipProps {
  show: boolean;
  position: { x: number; y: number };
  vehicleName?: string;
  vehicleAttributes: VehicleAttribute[];
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  imageUrl?: string; // опционально, для будущего
}

const VehicleAttributesTooltip: React.FC<VehicleAttributesTooltipProps> = ({
  show,
  position,
  vehicleName,
  vehicleAttributes,
  onMouseEnter,
  onMouseLeave,
  imageUrl,
}) => {
  if (!show) return null;
  return (
    <div
      className="flex overflow-hidden flex-col items-center px-8 py-8 bg-slate-50 shadow-[0px_0px_20px_rgba(0,0,0,0.15)] rounded-2xl w-[450px] max-w-full fixed z-[9999]"
      style={{
        left: `${position.x + 120}px`,
        top: `${position.y}px`,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Фоновое изображение, если будет нужно */}
      {imageUrl && (
        <img
          loading="lazy"
          src={imageUrl}
          className="object-cover absolute inset-0 size-full rounded-2xl opacity-10 pointer-events-none"
          alt="vehicle background"
        />
      )}
      <div className="flex relative flex-col w-full">
        {/* Заголовок */}
        {vehicleName && (
          <div className="font-semibold text-lg text-black mb-3 truncate">{vehicleName}</div>
        )}
        {/* Список характеристик или сообщение */}
        {vehicleAttributes.length > 0 ? (
          vehicleAttributes.map((attr, idx) => (
            <div
              key={idx}
              className="grid grid-cols-[150px_1fr] gap-x-5 items-start mt-2 w-full first:mt-0"
            >
              <div className="text-gray-400 break-words whitespace-normal text-left">
                {attr.name}
              </div>
              <div
                className="font-medium text-black break-words whitespace-normal text-left justify-self-start"
                style={{ textAlign: 'left' }}
              >
                {attr.value}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center w-full py-8">
            <div className="text-gray-400 mb-2">Дополнительная информация недоступна</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleAttributesTooltip; 